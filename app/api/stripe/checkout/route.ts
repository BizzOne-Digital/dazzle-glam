import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  calcShippingCost,
  shippingMethodLabel,
  type ShippingMethodId,
} from "@/lib/shipping";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
  sku?: string;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface CheckoutRequestBody {
  items: CheckoutItem[];
  customerEmail: string;
  customerPhone?: string;
  firstName: string;
  lastName: string;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key || !publishableKey) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add your Stripe keys to .env file.",
        },
        { status: 503 }
      );
    }

    const stripe = new Stripe(key);
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

    const shippingMethod: ShippingMethodId =
      rawMethod === "express" ? "express" : "standard";

    // Recalculate totals server-side so shipping is never skipped
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    const shippingCost = calcShippingCost(subtotal, shippingMethod);
    const taxAmount = Math.round((subtotal + shippingCost) * 0.13 * 100) / 100;
    const total = Math.round((subtotal + shippingCost + taxAmount) * 100) / 100;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const sizeLabel = item.variantLabel?.trim();
        const skuLabel = item.sku?.trim();
        const parts = [item.name];
        if (sizeLabel) parts.push(sizeLabel);
        if (skuLabel) parts.push(`SKU ${skuLabel}`);
        const displayName = parts.join(" · ");

        return {
          price_data: {
            currency: "cad",
            product_data: {
              name: displayName,
              ...(item.image && item.image.startsWith("http")
                ? { images: [item.image] }
                : {}),
              metadata: {
                cartItemId: item.id,
                productId: item.id.includes("::")
                  ? item.id.split("::")[0]
                  : item.id,
                productName: item.name,
                variantLabel: sizeLabel || "",
                sku: skuLabel || "",
              },
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      }
    );

    // Always include shipping so it appears on the Stripe summary
    const methodLabel = shippingMethodLabel(shippingMethod);
    lineItems.push({
      price_data: {
        currency: "cad",
        product_data: {
          name:
            shippingCost === 0
              ? `Shipping (${methodLabel}) — Free`
              : `Shipping (${methodLabel})`,
        },
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });

    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "Tax (HST 13%)",
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["CA"],
      },
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        customerPhone: customerPhone || "",
        firstName: firstName || "",
        lastName: lastName || "",
        shippingMethod,
        paymentMethod: "stripe",
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: taxAmount.toString(),
        total: total.toString(),
        shippingAddressLine1: shippingAddress?.line1 || "",
        shippingAddressLine2: shippingAddress?.line2 || "",
        shippingCity: shippingAddress?.city || "",
        shippingProvince: shippingAddress?.province || "",
        shippingPostalCode: shippingAddress?.postalCode || "",
        shippingCountry: shippingAddress?.country || "Canada",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/checkout`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
