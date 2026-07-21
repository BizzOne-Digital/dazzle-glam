import { connectDB } from "@/lib/db/connect";
import { calculateDiscount } from "@/lib/utils";
import {
  Cart,
  Discount,
  Product,
  ShippingMethod,
  SiteSettings,
  type ICart,
  type ICartItem,
  type IDiscount,
  type IProduct,
  type IShippingMethod,
  type ISiteSettings,
} from "@/models";
import type { DiscountType } from "@/types";
import type { Types } from "mongoose";

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  shippingAmount: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  currency: string;
  freeShippingThreshold: number;
  itemCount: number;
  items: PricedCartItem[];
}

export interface PricedCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  name: string;
  image?: string;
  variantLabel?: string;
  sku?: string;
  stock: number;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function resolveUnitPrice(
  product: IProduct,
  variantId?: string
): {
  unitPrice: number;
  stock: number;
  variantLabel?: string;
  sku?: string;
  image?: string;
} {
  if (variantId) {
    const variant = product.variants.find((v) => String(v._id) === variantId);
    if (!variant) {
      throw new Error("Selected variant is unavailable");
    }
    return {
      unitPrice: variant.price ?? product.price,
      stock: variant.stock,
      variantLabel: variant.name,
      sku: variant.sku ?? product.sku,
      image: variant.image ?? product.media[0]?.url,
    };
  }

  return {
    unitPrice: product.price,
    stock: product.stock,
    sku: product.sku,
    image: product.media[0]?.url,
  };
}

async function getEcommerceDefaults() {
  const settings = (await SiteSettings.findOne().lean()) as ISiteSettings | null;
  return {
    taxRate: settings?.ecommerce?.taxRate ?? 0.13,
    freeShippingThreshold: settings?.ecommerce?.freeShippingThreshold ?? 150,
    currency: settings?.ecommerce?.currency ?? "CAD",
  };
}

async function resolveDiscount(
  code: string | undefined,
  subtotal: number
): Promise<{ amount: number; discount?: IDiscount; code?: string }> {
  if (!code) {
    return { amount: 0 };
  }

  const discount = (await Discount.findOne({
    code: code.toUpperCase(),
    isActive: true,
  }).lean()) as IDiscount | null;

  if (!discount) {
    return { amount: 0 };
  }

  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) {
    return { amount: 0 };
  }
  if (discount.endsAt && discount.endsAt < now) {
    return { amount: 0 };
  }
  if (
    typeof discount.usageLimit === "number" &&
    discount.usageCount >= discount.usageLimit
  ) {
    return { amount: 0 };
  }
  if (
    typeof discount.minPurchase === "number" &&
    subtotal < discount.minPurchase
  ) {
    return { amount: 0 };
  }

  const amount = calculateDiscount(
    subtotal,
    discount.type as DiscountType,
    discount.value
  );

  return {
    amount: roundMoney(amount),
    discount,
    code: discount.code,
  };
}

async function resolveShipping(
  subtotalAfterDiscount: number,
  freeShippingThreshold: number,
  discount?: IDiscount,
  shippingMethodId?: string
): Promise<number> {
  if (discount?.type === "free_shipping") {
    return 0;
  }

  if (subtotalAfterDiscount >= freeShippingThreshold) {
    return 0;
  }

  if (shippingMethodId) {
    const method = (await ShippingMethod.findOne({
      _id: shippingMethodId,
      isActive: true,
    }).lean()) as IShippingMethod | null;
    if (method) {
      return roundMoney(method.price);
    }
  }

  const fallback = (await ShippingMethod.findOne({ isActive: true })
    .sort({ price: 1 })
    .lean()) as IShippingMethod | null;

  return roundMoney(fallback?.price ?? 12);
}

export async function priceCartItems(
  items: Array<Pick<ICartItem, "product" | "variantId" | "quantity">>
): Promise<PricedCartItem[]> {
  if (!items.length) return [];

  const productIds = [...new Set(items.map((item) => String(item.product)))];

  const products = (await Product.find({
    _id: { $in: productIds },
    status: "published",
  }).lean()) as unknown as IProduct[];

  const productMap = new Map(
    products.map((product) => [String(product._id), product])
  );

  return items.map((item) => {
    const product = productMap.get(String(item.product));
    if (!product) {
      throw new Error("One or more products are unavailable");
    }

    const resolved = resolveUnitPrice(product, item.variantId);
    if (item.quantity > resolved.stock) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const unitPrice = roundMoney(resolved.unitPrice);
    return {
      productId: String(product._id),
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      lineTotal: roundMoney(unitPrice * item.quantity),
      name: product.name,
      image: resolved.image,
      variantLabel: resolved.variantLabel,
      sku: resolved.sku,
      stock: resolved.stock,
    };
  });
}

export async function calculateCartTotals(
  cartOrId: ICart | Types.ObjectId | string,
  options?: { shippingMethodId?: string }
): Promise<CartTotals> {
  await connectDB();

  const cart: ICart | null =
    typeof cartOrId === "object" &&
    cartOrId !== null &&
    "items" in cartOrId
      ? (cartOrId as ICart)
      : ((await Cart.findById(cartOrId).lean()) as ICart | null);

  if (!cart) {
    throw new Error("Cart not found");
  }

  const pricedItems = await priceCartItems(cart.items);
  const subtotal = roundMoney(
    pricedItems.reduce((sum, item) => sum + item.lineTotal, 0)
  );

  const { taxRate, freeShippingThreshold, currency } =
    await getEcommerceDefaults();

  const discountResult = await resolveDiscount(cart.discountCode, subtotal);
  const taxableBase = Math.max(0, subtotal - discountResult.amount);
  const shippingAmount = await resolveShipping(
    taxableBase,
    freeShippingThreshold,
    discountResult.discount,
    options?.shippingMethodId
  );
  const taxAmount = roundMoney(taxableBase * taxRate);
  const total = roundMoney(taxableBase + shippingAmount + taxAmount);

  return {
    subtotal,
    discountAmount: discountResult.amount,
    discountCode: discountResult.code,
    shippingAmount,
    taxAmount,
    taxRate,
    total,
    currency,
    freeShippingThreshold,
    itemCount: pricedItems.reduce((sum, item) => sum + item.quantity, 0),
    items: pricedItems,
  };
}
