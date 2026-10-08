import { NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillStripeCheckoutSession } from "@/lib/services/stripeOrders";

/**
 * Fallback order fulfillment when Stripe webhooks aren't reachable (local/dev)
 * or haven't fired yet. Idempotent via stripeSessionId.
 */
export async function POST(req: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const { sessionId } = (await req.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    const { order, created } = await fulfillStripeCheckoutSession(
      session,
      stripe
    );

    return NextResponse.json({
      orderNumber: order.orderNumber,
      created,
      email: order.email,
    });
  } catch (error) {
    console.error("Stripe confirm error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to confirm order",
      },
      { status: 500 }
    );
  }
}
