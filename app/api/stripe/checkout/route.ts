import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key || !publishableKey) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add your Stripe keys to .env file." },
        { status: 503 }
      );
    }

    const stripe = new Stripe(key);
    const body = await req.json();

    const {
      items,
      customerEmail,
      customerPhone,
      firstName,
      lastName,
      shippingAddress,
      shippingMethod,
      subtotal,
      shippingCost,
      tax,
      total,
    } = body;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "cad",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: item.description || "",
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      // Add shipping as a line item
      ...(shippingCost > 0 && {
        line_items: [
          ...items.map((item: any) => ({
            price_data: {
              currency: "cad",
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: `Shipping (${shippingMethod})`,
              },
              unit_amount: Math.round(shippingCost * 100),
            },
            quantity: 1,
          },
        ],
      }),
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
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
