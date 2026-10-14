"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { Order, type IOrder, type IOrderItem } from "@/models/Commerce";
import type { Address, OrderStatus, PaymentStatus } from "@/types";
import {
  type AdminOrderLineInput,
  computeOrderTotals,
  getOrderTaxRate,
  mergeShippingAddress,
  normalizeAdminOrderLines,
} from "@/lib/services/adminOrderEdit";
import {
  sendInteracOrderConfirmationEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
} from "@/lib/email";
import { getSiteSettings } from "@/actions/settings";

const STATUSES_THAT_MARK_PAID: OrderStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

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
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    courier?: string;
    internalNotes?: string;
    email?: string;
    phone?: string;
    shippingAddress?: Partial<Address>;
    items?: AdminOrderLineInput[];
    discountAmount?: number;
    shippingAmount?: number;
    taxAmount?: number;
    total?: number;
    /** When true (default), recompute tax & total from line items and amounts */
    recalculateTotals?: boolean;
  }
) {
  await requireAdmin();
  await connectDB();
  const order = await Order.findById(id);
  if (!order) return { success: false as const, error: "Order not found" };

  const previousStatus = order.status;

  if (data.email !== undefined) {
    const email = data.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { success: false as const, error: "Valid customer email is required" };
    }
    order.email = email;
  }
  if (data.phone !== undefined) order.phone = data.phone.trim() || undefined;
  if (data.shippingAddress) {
    order.shippingAddress = mergeShippingAddress(
      order.shippingAddress,
      data.shippingAddress
    );
    if (!order.billingAddress?.line1) {
      order.billingAddress = order.shippingAddress;
    }
  }

  if (data.items) {
    try {
      order.items = await normalizeAdminOrderLines(data.items);
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : "Invalid line items",
      };
    }
  }

  if (data.discountAmount !== undefined) {
    order.discountAmount = Math.max(0, data.discountAmount);
  }
  if (data.shippingAmount !== undefined) {
    order.shippingAmount = Math.max(0, data.shippingAmount);
  }

  const shouldRecalculate =
    data.recalculateTotals !== false &&
    (data.items !== undefined ||
      data.discountAmount !== undefined ||
      data.shippingAmount !== undefined);

  if (shouldRecalculate) {
    const taxRate = await getOrderTaxRate();
    const subtotal = order.items.reduce(
      (sum: number, item: IOrderItem) => sum + item.total,
      0
    );
    const totals = computeOrderTotals(
      subtotal,
      order.discountAmount,
      order.shippingAmount,
      taxRate
    );
    order.subtotal = totals.subtotal;
    order.taxAmount = totals.taxAmount;
    order.total = totals.total;
  } else if (
    data.taxAmount !== undefined ||
    data.total !== undefined ||
    data.items !== undefined
  ) {
    if (data.items) {
      order.subtotal = order.items.reduce(
        (sum: number, item: IOrderItem) => sum + item.total,
        0
      );
    }
    if (data.taxAmount !== undefined) order.taxAmount = Math.max(0, data.taxAmount);
    if (data.total !== undefined) order.total = Math.max(0, data.total);
  }

  if (data.status) order.status = data.status;
  if (data.paymentStatus) {
    order.paymentStatus = data.paymentStatus;
  }
  if (data.status && STATUSES_THAT_MARK_PAID.includes(data.status)) {
    order.paymentStatus = "paid";
  }
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

  if (data.status === "shipped" && previousStatus !== "shipped") {
    const customerName =
      `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
      "Customer";
    try {
      await sendOrderShippedEmail({
        to: order.email,
        orderNumber: order.orderNumber,
        customerName,
        trackingNumber: order.trackingNumber,
        courier: order.courier,
      });
    } catch (error) {
      console.error("sendOrderShippedEmail:", error);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { success: true as const, data: serialize(order) };
}

function orderEmailPayload(order: IOrder, customerName: string) {
  return {
    orderNumber: order.orderNumber,
    customerName,
    customerEmail: order.email,
    customerPhone: order.phone,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      variantLabel: item.variantLabel,
      sku: item.sku,
    })),
    shippingAddress: {
      name: customerName,
      line1: order.shippingAddress?.line1 || "",
      line2: order.shippingAddress?.line2,
      city: order.shippingAddress?.city || "",
      province: order.shippingAddress?.province || "",
      postalCode: order.shippingAddress?.postalCode || "",
      country: order.shippingAddress?.country || "Canada",
    },
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    taxAmount: order.taxAmount,
    total: order.total,
    currency: order.currency || "CAD",
    shippingMethod: order.shippingMethod,
  };
}

export async function resendOrderConfirmationEmail(orderId: string) {
  await requireAdmin();
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return { success: false as const, error: "Order not found" };

  const customerName =
    `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() ||
    "Customer";
  const payload = orderEmailPayload(order, customerName);

  try {
    if (order.paymentMethod === "interac") {
      const settings = await getSiteSettings();
      const interacEmail =
        settings.data?.email ||
        process.env.ADMIN_EMAIL ||
        process.env.SMTP_USER ||
        "dazzleglamcollection@gmail.com";
      await sendInteracOrderConfirmationEmail({
        to: order.email,
        interacEmail,
        ...payload,
      });
    } else {
      await sendOrderConfirmationEmail({
        to: order.email,
        ...payload,
      });
    }
    return { success: true as const };
  } catch (error) {
    console.error("resendOrderConfirmationEmail:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send confirmation email",
    };
  }
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
