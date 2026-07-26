import { connectDB } from "@/lib/db/connect";
import { calculateCartTotals } from "@/lib/services/cart";
import {
  Cart,
  Customer,
  Discount,
  Order,
  type ICart,
  type IOrder,
} from "@/models";
import type { Address } from "@/types";
import type { Types } from "mongoose";

export async function createOrderNumber(prefix?: string): Promise<string> {
  await connectDB();

  const orderPrefix = prefix || "DG";

  // Sequential DG-XXXX (4+ digit number)
  const existing = await Order.find({
    orderNumber: new RegExp(`^${orderPrefix}-\\d+$`),
  })
    .select("orderNumber")
    .lean();

  let max = 1000;
  for (const row of existing) {
    const n = parseInt(String(row.orderNumber).split("-").pop() || "", 10);
    if (Number.isFinite(n) && n > max) max = n;
  }

  let next = max + 1;
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${orderPrefix}-${String(next).padStart(4, "0")}`;
    const exists = await Order.exists({ orderNumber: candidate });
    if (!exists) return candidate;
    next += 1;
  }

  return `${orderPrefix}-${Date.now().toString().slice(-6)}`;
}

export interface CreateOrderFromCartInput {
  cartId: string | Types.ObjectId;
  email: string;
  phone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethodId?: string;
  shippingMethodName?: string;
  notes?: string;
  customerId?: string | Types.ObjectId;
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  clearCart?: boolean;
}

export async function createOrderFromCart(
  input: CreateOrderFromCartInput
): Promise<IOrder> {
  await connectDB();

  const cart = (await Cart.findById(input.cartId).lean()) as ICart | null;
  if (!cart || !cart.items.length) {
    throw new Error("Cart is empty");
  }

  const totals = await calculateCartTotals(cart, {
    shippingMethodId: input.shippingMethodId,
  });

  const orderNumber = await createOrderNumber();
  const billingAddress = input.billingAddress ?? input.shippingAddress;

  const order = await Order.create({
    orderNumber,
    customer: input.customerId ?? cart.customer,
    email: input.email.toLowerCase(),
    phone: input.phone,
    items: totals.items.map((item) => ({
      product: item.productId,
      variantId: item.variantId,
      name: item.name,
      sku: item.sku,
      image: item.image,
      variantLabel: item.variantLabel,
      quantity: item.quantity,
      price: item.unitPrice,
      total: item.lineTotal,
    })),
    shippingAddress: input.shippingAddress,
    billingAddress,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    discountCode: totals.discountCode,
    shippingAmount: totals.shippingAmount,
    taxAmount: totals.taxAmount,
    total: totals.total,
    currency: totals.currency,
    status: "pending",
    paymentStatus: "pending",
    fulfillmentStatus: "unfulfilled",
    shippingMethod: input.shippingMethodName,
    notes: input.notes,
    stripePaymentIntentId: input.stripePaymentIntentId,
    stripeSessionId: input.stripeSessionId,
  });

  if (totals.discountCode) {
    await Discount.updateOne(
      { code: totals.discountCode },
      { $inc: { usageCount: 1 } }
    );
  }

  if (input.customerId || cart.customer) {
    const customerId = input.customerId ?? cart.customer;
    await Customer.updateOne(
      { _id: customerId },
      {
        $inc: { orderCount: 1, totalSpent: totals.total },
      }
    );
  }

  if (input.clearCart !== false) {
    await Cart.updateOne(
      { _id: cart._id },
      { $set: { items: [], discountCode: undefined } }
    );
  }

  return order.toObject();
}
