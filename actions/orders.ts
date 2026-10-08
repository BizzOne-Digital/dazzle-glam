"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { Order, type IOrder } from "@/models/Commerce";
import type { OrderStatus } from "@/types";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getAdminOrders() {
  await requireAdmin();
  await connectDB();
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return serialize(orders as unknown as IOrder[]);
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) return null;
  return serialize(order as unknown as IOrder);
}

export async function updateAdminOrderStatus(
  id: string,
  data: {
    status?: OrderStatus;
    trackingNumber?: string;
    courier?: string;
    internalNotes?: string;
  }
) {
  await requireAdmin();
  await connectDB();
  const order = await Order.findById(id);
  if (!order) return { success: false as const, error: "Order not found" };

  if (data.status) order.status = data.status;
  if (data.trackingNumber !== undefined) order.trackingNumber = data.trackingNumber;
  if (data.courier !== undefined) order.courier = data.courier;
  if (data.internalNotes !== undefined) order.internalNotes = data.internalNotes;

  if (data.status === "shipped") {
    order.fulfillmentStatus = "fulfilled";
  }
  if (data.status === "delivered") {
    order.fulfillmentStatus = "fulfilled";
  }
  if (data.status === "cancelled") {
    order.cancelledAt = new Date();
  }
  if (data.status === "refunded") {
    order.paymentStatus = "refunded";
    order.refundedAt = new Date();
  }

  await order.save();
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { success: true as const, data: serialize(order) };
}

/** Remove placeholder / demo orders that are not from Stripe checkout */
export async function deleteDummyOrders() {
  await requireAdmin();
  await connectDB();
  const result = await Order.deleteMany({
    $or: [
      { stripeSessionId: { $exists: false } },
      { stripeSessionId: null },
      { stripeSessionId: "" },
      { email: /dummy|example\.com|test@test/i },
      { orderNumber: /^ORD-/i },
    ],
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return {
    success: true as const,
    deleted: result.deletedCount ?? 0,
  };
}
