import { NextResponse } from "next/server";
import Stripe from "stripe";

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
        { status: 503 }
      );
    }

    const stripe = new Stripe(key);
    const body: CheckoutRequestBody = await req.json();

    console.log("📦 Creating checkout session for:", {
      itemCount: body.items.length,
      total: body.total,
      email: body.customerEmail,
    });

    const {
      items,
      customerEmail,
      customerPhone,
      firstName,
      lastName,
      shippingAddress,
      shippingMethod,
      subtotal,
      tax,
      total,
    } = body;

    // Temporary: shipping disabled for Stripe testing
    const shippingCost = 0;

    // Create Stripe checkout session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: "cad",
          product_data: {
            name: item.name,
            ...(item.image && item.image.startsWith("http")
              ? { images: [item.image] }
              : {}),
            metadata: {
              cartItemId: item.id,
              productId: item.id.includes("::")
                ? item.id.split("::")[0]
                : item.id,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: `Shipping (${shippingMethod})`,
          },
          unit_amount: Math.round(shippingCost * 100),
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
        shippingMethod: shippingMethod || "standard",
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString(),
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
    const errorMessage = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
