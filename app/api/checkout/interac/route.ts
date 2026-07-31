import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/connect";
import {
  sendNewOrderAdminEmail,
  sendOrderConfirmationEmail,
} from "@/lib/email";
import { createOrderNumber } from "@/lib/services/orders";
import {
  calcShippingCost,
  type ShippingMethodId,
} from "@/lib/shipping";
import { getSiteSettings } from "@/actions/settings";
import { Order } from "@/models/Commerce";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
  sku?: string;
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
  customerEmail: string;
  customerPhone?: string;
  firstName: string;
  lastName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
}

function resolveProductId(raw?: string | null) {
  if (!raw) return undefined;
  const productId = raw.includes("::") ? raw.split("::")[0] : raw;
  return mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;
}

export async function POST(req: Request) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const {
      items,
      customerEmail,
      customerPhone,
      firstName,
      lastName,
      shippingAddress,
      shippingMethod: rawMethod,
    } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customerEmail?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!shippingAddress?.line1 || !shippingAddress?.city) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    const shippingMethod: ShippingMethodId =
      rawMethod === "express" ? "express" : "standard";

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const shippingAmount = calcShippingCost(subtotal, shippingMethod);
    const taxAmount = Math.round((subtotal + shippingAmount) * 0.13 * 100) / 100;
    const total = Math.round((subtotal + shippingAmount + taxAmount) * 100) / 100;

    await connectDB();

    const orderNumber = await createOrderNumber();
    const address = {
      firstName: firstName || "",
      lastName: lastName || "",
      line1: shippingAddress.line1,
      line2: shippingAddress.line2 || "",
      city: shippingAddress.city,
      province: shippingAddress.province,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || "Canada",
      phone: customerPhone || "",
    };

    const order = await Order.create({
      orderNumber,
      email: customerEmail.toLowerCase().trim(),
      phone: customerPhone || "",
      items: items.map((item) => ({
        product: resolveProductId(item.id),
        name: item.name,
        sku: item.sku || undefined,
        image: item.image || "",
        variantLabel: item.variantLabel || undefined,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      shippingAddress: address,
      billingAddress: address,
      subtotal,
      discountAmount: 0,
      shippingAmount,
      taxAmount,
      total,
      currency: "CAD",
      status: "pending",
      paymentStatus: "pending",
      fulfillmentStatus: "unfulfilled",
      shippingMethod,
      paymentMethod: "interac",
      notes: "Awaiting Interac e-Transfer payment",
    });

    const settings = await getSiteSettings();
    const interacEmail =
      settings.data?.email ||
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      "dazzleglamcollection@gmail.com";

    const customerName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || "Customer";

    const payload = {
      orderNumber,
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
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        country: address.country,
      },
      subtotal,
      shippingAmount,
      taxAmount,
      total,
      currency: "CAD",
      shippingMethod,
    };

    try {
      await sendOrderConfirmationEmail({
        to: order.email,
        ...payload,
      });
    } catch (error) {
      console.error("Interac customer email failed:", error);
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (adminEmail) {
      try {
        await sendNewOrderAdminEmail({
          to: adminEmail,
          ...payload,
        });
      } catch (error) {
        console.error("Interac admin email failed:", error);
      }
    }

    return NextResponse.json({
      orderNumber,
      orderId: String(order._id),
      total,
      interacEmail,
      message: "Order placed. Complete payment via Interac e-Transfer.",
    });
  } catch (error) {
    console.error("Interac checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to place Interac order",
      },
      { status: 500 }
    );
  }
}
