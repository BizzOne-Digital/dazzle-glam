"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import type { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { getCurrentUser } from "@/lib/auth/session";
import { calculateCartTotals, priceCartItems } from "@/lib/services/cart";
import {
  applyDiscountSchema,
  cartItemInputSchema,
} from "@/lib/validations";
import { Cart, Discount, Product, type ICart, type ICartItem } from "@/models";
import type { ActionResult } from "@/actions/auth";

const CART_COOKIE = "dg_cart_sid";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CartDoc = {
  _id: Types.ObjectId;
  items: Types.DocumentArray<ICartItem & { _id: Types.ObjectId }>;
  discountCode?: string;
  customer?: Types.ObjectId;
  sessionId?: string;
  save: () => Promise<unknown>;
  toObject: () => ICart;
};

async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  jar.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return sessionId;
}

async function findCart(): Promise<ICart> {
  await connectDB();
  const user = await getCurrentUser();
  const sessionId = await getOrCreateSessionId();

  if (user?.role === "customer") {
    let cart = await Cart.findOne({ customer: user.id });
    if (!cart) {
      const guestCart = await Cart.findOne({ sessionId });
      if (guestCart) {
        guestCart.customer = user.id as unknown as typeof guestCart.customer;
        await guestCart.save();
        cart = guestCart;
      } else {
        cart = await Cart.create({ customer: user.id, items: [] });
      }
    }
    return cart.toObject() as ICart;
  }

  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart.toObject() as ICart;
}

async function getMutableCart(): Promise<CartDoc> {
  await connectDB();
  const user = await getCurrentUser();
  const sessionId = await getOrCreateSessionId();

  if (user?.role === "customer") {
    let cart = await Cart.findOne({ customer: user.id });
    if (!cart) {
      cart = await Cart.create({ customer: user.id, items: [] });
    }
    return cart as unknown as CartDoc;
  }

  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart as unknown as CartDoc;
}

export async function addToCart(
  input: unknown
): Promise<ActionResult<{ cartId: string; itemCount: number }>> {
  const parsed = cartItemInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid cart item",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { productId, variantId, quantity } = parsed.data;

  await connectDB();

  const product = (await Product.findOne({
    _id: productId,
    status: "published",
  }).lean()) as { _id: Types.ObjectId } | null;

  if (!product) {
    return { success: false, message: "Product not found" };
  }

  try {
    const [priced] = await priceCartItems([
      {
        product: product._id,
        variantId,
        quantity,
      },
    ]);

    const cart = await getMutableCart();
    const existingIndex = cart.items.findIndex(
      (item: ICartItem) =>
        String(item.product) === productId &&
        (item.variantId || undefined) === (variantId || undefined)
    );

    if (existingIndex >= 0) {
      const nextQty = cart.items[existingIndex].quantity + quantity;
      if (nextQty > priced.stock) {
        return { success: false, message: "Not enough stock available" };
      }
      cart.items[existingIndex].quantity = nextQty;
      cart.items[existingIndex].price = priced.unitPrice;
      cart.items[existingIndex].name = priced.name;
      cart.items[existingIndex].image = priced.image;
      cart.items[existingIndex].variantLabel = priced.variantLabel;
    } else {
      cart.items.push({
        product: product._id,
        variantId,
        quantity,
        price: priced.unitPrice,
        name: priced.name,
        image: priced.image,
        variantLabel: priced.variantLabel,
      } as ICartItem & { _id?: Types.ObjectId });
    }

    await cart.save();
    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Added to cart",
      data: {
        cartId: String(cart._id),
        itemCount: cart.items.reduce(
          (sum: number, item: ICartItem) => sum + item.quantity,
          0
        ),
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to add to cart",
    };
  }
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<ActionResult> {
  if (!itemId || !Number.isInteger(quantity) || quantity < 0 || quantity > 99) {
    return { success: false, message: "Invalid quantity" };
  }

  const cart = await getMutableCart();
  const item = cart.items.id(itemId);
  if (!item) {
    return { success: false, message: "Cart item not found" };
  }

  if (quantity === 0) {
    item.deleteOne();
  } else {
    try {
      await priceCartItems([
        {
          product: item.product,
          variantId: item.variantId,
          quantity,
        },
      ]);
      item.quantity = quantity;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to update cart",
      };
    }
  }

  await cart.save();
  revalidatePath("/cart");
  revalidatePath("/checkout");

  return { success: true, message: "Cart updated" };
}

export async function removeFromCart(itemId: string): Promise<ActionResult> {
  if (!itemId) {
    return { success: false, message: "Item id is required" };
  }

  const cart = await getMutableCart();
  const item = cart.items.id(itemId);
  if (!item) {
    return { success: false, message: "Cart item not found" };
  }

  item.deleteOne();
  await cart.save();
  revalidatePath("/cart");
  revalidatePath("/checkout");

  return { success: true, message: "Item removed" };
}

export async function applyDiscount(
  input: unknown
): Promise<ActionResult<{ discountAmount: number; total: number }>> {
  const parsed = applyDiscountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid discount code",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await connectDB();
  const code = parsed.data.code.trim().toUpperCase();

  const discount = await Discount.findOne({ code, isActive: true }).lean();
  if (!discount || Array.isArray(discount)) {
    return { success: false, message: "Discount code is invalid" };
  }

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) {
    return { success: false, message: "Discount code is not active yet" };
  }
  if (discount.endsAt && discount.endsAt < now) {
    return { success: false, message: "Discount code has expired" };
  }
  if (
    typeof discount.usageLimit === "number" &&
    discount.usageCount >= discount.usageLimit
  ) {
    return { success: false, message: "Discount code usage limit reached" };
  }

  const cart = await getMutableCart();
  cart.discountCode = code;
  await cart.save();

  try {
    const totals = await calculateCartTotals(cart.toObject());
    if (totals.discountAmount <= 0 && discount.type !== "free_shipping") {
      cart.discountCode = undefined;
      await cart.save();
      return {
        success: false,
        message: "Discount does not apply to this cart",
      };
    }

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return {
      success: true,
      message: "Discount applied",
      data: {
        discountAmount: totals.discountAmount,
        total: totals.total,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to apply discount",
    };
  }
}

export async function getCartSnapshot() {
  const cart = await findCart();
  if (!cart.items.length) {
    return {
      cartId: String(cart._id),
      items: [],
      totals: null,
    };
  }

  const totals = await calculateCartTotals(cart);
  return {
    cartId: String(cart._id),
    items: cart.items,
    totals,
  };
}
