import mongoose from "mongoose";
import Stripe from "stripe";
import { connectDB } from "@/lib/db/connect";
import {
  sendNewOrderAdminEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";
import { createOrderNumber } from "@/lib/services/orders";
import { Order, type IOrder } from "@/models/Commerce";

function money(centsOrMeta: string | number | null | undefined, fallback = 0) {
  if (typeof centsOrMeta === "number" && Number.isFinite(centsOrMeta)) {
    return centsOrMeta;
  }
  const n = parseFloat(String(centsOrMeta ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

function resolveProductId(raw?: string | null) {
  if (!raw) return undefined;
  const productId = raw.includes("::") ? raw.split("::")[0] : raw;
  return mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;
}

function extractSizeFromDescription(description?: string | null) {
  if (!description) return undefined;
  const match = description.match(/\((Size\s+[^)]+)\)/i);
  return match?.[1]?.trim();
}

function cleanProductName(description?: string | null, fallback = "Item") {
  if (!description) return fallback;
  return description.replace(/\s*\((Size\s+[^)]+)\)\s*$/i, "").trim() || fallback;
}

export async function fulfillStripeCheckoutSession(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<{ order: IOrder; created: boolean }> {
  await connectDB();

  const existing = (await Order.findOne({
    stripeSessionId: session.id,
  }).lean()) as IOrder | null;

  if (existing) {
    return { order: existing, created: false };
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    expand: ["data.price.product"],
  });

  const firstName = session.metadata?.firstName || "";
  const lastName = session.metadata?.lastName || "";
  const email = (
    session.customer_email ||
    session.customer_details?.email ||
    ""
  ).toLowerCase();
  const phone =
    session.customer_details?.phone ||
    session.metadata?.customerPhone ||
    "";

  const items = lineItems.data
    .filter((item) => {
      const name = item.description?.toLowerCase() || "";
      return !name.includes("shipping") && !name.includes("tax");
    })
    .map((item) => {
      const product = item.price?.product as Stripe.Product | string | undefined;
      const productObj =
        product && typeof product === "object" ? product : undefined;
      const cartId =
        productObj?.metadata?.cartItemId || productObj?.metadata?.productId;
      const qty = item.quantity || 1;
      const lineTotal = (item.amount_total || 0) / 100;
      const unitPrice = qty > 0 ? lineTotal / qty : lineTotal;

      return {
        product: resolveProductId(cartId),
        name:
          productObj?.metadata?.productName ||
          cleanProductName(item.description, productObj?.name || "Item"),
        image: productObj?.images?.[0] || "",
        quantity: qty,
        price: unitPrice,
        total: lineTotal,
        variantLabel:
          productObj?.metadata?.variantLabel ||
          extractSizeFromDescription(item.description) ||
          undefined,
      };
    });

  const shippingAddress = {
    firstName,
    lastName,
    line1: session.metadata?.shippingAddressLine1 || "",
    line2: session.metadata?.shippingAddressLine2 || "",
    city: session.metadata?.shippingCity || "",
    province: session.metadata?.shippingProvince || "",
    postalCode: session.metadata?.shippingPostalCode || "",
    country: session.metadata?.shippingCountry || "Canada",
    phone,
  };

  const subtotal = money(session.metadata?.subtotal, (session.amount_subtotal || 0) / 100);
  const shippingAmount = money(session.metadata?.shippingCost, 0);
  const taxAmount = money(session.metadata?.tax, 0);
  const total = (session.amount_total || 0) / 100 || money(session.metadata?.total);

  const order = (await Order.create({
    orderNumber: await createOrderNumber(),
    email,
    phone,
    items,
    shippingAddress,
    billingAddress: shippingAddress,
    subtotal,
    discountAmount: 0,
    shippingAmount,
    taxAmount,
    total,
    currency: session.currency?.toUpperCase() || "CAD",
    status: "confirmed",
    paymentStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    shippingMethod: session.metadata?.shippingMethod || "standard",
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
  })) as IOrder;

  await sendOrderEmails(order);

  return { order, created: true };
}

export async function sendOrderEmails(order: IOrder) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  const customerName =
    [order.shippingAddress?.firstName, order.shippingAddress?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Customer";

  const payload = {
    orderNumber: order.orderNumber,
    customerName,
    customerEmail: order.email,
    customerPhone: order.phone,
    items: (order.items || []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total ?? item.price * item.quantity,
      variantLabel: item.variantLabel,
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

  if (order.email) {
    try {
      await sendOrderConfirmationEmail({
        to: order.email,
        ...payload,
      });
    } catch (error) {
      console.error("Failed to send customer order confirmation:", error);
    }
  }

  if (adminEmail) {
    try {
      await sendNewOrderAdminEmail({
        to: adminEmail,
        ...payload,
      });
    } catch (error) {
      console.error("Failed to send admin order notification:", error);
    }
  }
}
