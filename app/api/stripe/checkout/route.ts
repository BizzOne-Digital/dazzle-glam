import { NextResponse } from "next/server";
import Stripe from "stripe";
<<<<<<< HEAD
=======
import {
  calcShippingCost,
  shippingMethodLabel,
  type ShippingMethodId,
} from "@/lib/shipping";
>>>>>>> 7ac483d (fix)

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantLabel?: string;
<<<<<<< HEAD
=======
  sku?: string;
>>>>>>> 7ac483d (fix)
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

<<<<<<< HEAD
    console.log("🔑 Stripe keys check:", {
      hasSecretKey: !!key,
      hasPublishableKey: !!publishableKey,
      secretKeyPrefix: key?.substring(0, 8),
      publishableKeyPrefix: publishableKey?.substring(0, 8),
    });

    if (!key || !publishableKey) {
      console.error("❌ Stripe keys missing");
      return NextResponse.json(
        { error: "Stripe is not configured. Please add your Stripe keys to .env file." },
=======
    if (!key || !publishableKey) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please add your Stripe keys to .env file.",
        },
>>>>>>> 7ac483d (fix)
        { status: 503 }
      );
    }

    const stripe = new Stripe(key);
    const body: CheckoutRequestBody = await req.json();

<<<<<<< HEAD
    console.log("📦 Creating checkout session for:", {
      itemCount: body.items.length,
      total: body.total,
      email: body.customerEmail,
    });

=======
>>>>>>> 7ac483d (fix)
    const {
      items,
      customerEmail,
      customerPhone,
      firstName,
      lastName,
      shippingAddress,
<<<<<<< HEAD
      shippingMethod,
      subtotal,
      tax,
      total,
      shippingCost: rawShippingCost,
    } = body;

    const shippingCost = Math.max(0, Number(rawShippingCost) || 0);

    // Create Stripe checkout session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const sizeLabel = item.variantLabel?.trim();
        const displayName = sizeLabel
          ? `${item.name} (${sizeLabel})`
          : item.name;
=======
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
>>>>>>> 7ac483d (fix)

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
<<<<<<< HEAD
=======
                sku: skuLabel || "",
>>>>>>> 7ac483d (fix)
              },
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        };
      }
    );

<<<<<<< HEAD
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: `Shipping (${shippingMethod === "express" ? "Express" : "Standard"})`,
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const taxAmount = Math.max(0, Number(tax) || 0);
=======
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

>>>>>>> 7ac483d (fix)
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
<<<<<<< HEAD
        shippingMethod: shippingMethod || "standard",
=======
        shippingMethod,
        paymentMethod: "stripe",
>>>>>>> 7ac483d (fix)
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
<<<<<<< HEAD
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
=======
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
>>>>>>> 7ac483d (fix)
      },
      { status: 500 }
    );
  }
}
