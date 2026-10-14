import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillStripeCheckoutSession } from "@/lib/services/stripeOrders";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;

  if (!secret || !key || secret.includes("your_stripe_webhook_secret")) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(key);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== "paid" && session.status !== "complete") {
          console.log("Skipping unpaid checkout session:", session.id);
          break;
        }

        const { order, created } = await fulfillStripeCheckoutSession(
          session,
          stripe
        );

        console.log(
          created
            ? `✅ Order created & emails sent: ${order.orderNumber}`
            : `ℹ️ Order already exists: ${order.orderNumber}`
        );
        break;
      }

      case "payment_intent.succeeded": {
        console.log("✅ Payment succeeded");
        break;
      }

      case "payment_intent.payment_failed": {
        console.log("❌ Payment failed");
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}
