import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models/Commerce";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;

  if (!secret || !key) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
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
        
        // Connect to database
        await connectDB();

        // Get line items to extract product details
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product']
        });

        // Create order in database
        const orderData = {
          orderNumber: `ORD-${Date.now()}`,
          customer: {
            email: session.customer_email || session.customer_details?.email || "",
            firstName: session.metadata?.firstName || "",
            lastName: session.metadata?.lastName || "",
            phone: session.customer_details?.phone || session.metadata?.customerPhone || "",
          },
          items: lineItems.data
            .filter(item => !item.description?.includes("Shipping"))
            .map((item) => {
              const product = item.price?.product as Stripe.Product | undefined;
              return {
                productId: product?.id || "",
                name: item.description || "",
                price: (item.amount_total || 0) / 100 / (item.quantity || 1),
                quantity: item.quantity || 1,
                image: product?.images?.[0] || "",
              };
            }),
          shipping: {
            name: `${session.metadata?.firstName || ""} ${session.metadata?.lastName || ""}`.trim(),
            line1: session.metadata?.shippingAddressLine1 || "",
            line2: session.metadata?.shippingAddressLine2 || "",
            city: session.metadata?.shippingCity || "",
            province: session.metadata?.shippingProvince || "",
            postalCode: session.metadata?.shippingPostalCode || "",
            country: session.metadata?.shippingCountry || "CA",
            phone: session.customer_details?.phone || session.metadata?.customerPhone || "",
          },
          billing: {
            name: `${session.metadata?.firstName || ""} ${session.metadata?.lastName || ""}`.trim(),
            line1: session.metadata?.shippingAddressLine1 || "",
            line2: session.metadata?.shippingAddressLine2 || "",
            city: session.metadata?.shippingCity || "",
            province: session.metadata?.shippingProvince || "",
            postalCode: session.metadata?.shippingPostalCode || "",
            country: session.metadata?.shippingCountry || "CA",
          },
          payment: {
            method: "stripe",
            status: "paid",
            paidAt: new Date(),
          },
          subtotal: parseFloat(session.metadata?.subtotal || "0"),
          shippingCost: parseFloat(session.metadata?.shippingCost || "0"),
          tax: parseFloat(session.metadata?.tax || "0"),
          total: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || "CAD",
          status: "pending",
          shippingMethod: session.metadata?.shippingMethod || "standard",
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
        };

        const order = await Order.create(orderData);

        // Send email to customer
        const customerEmail = session.customer_email || session.customer_details?.email;
        if (customerEmail) {
          await sendEmail({
            to: customerEmail,
            subject: "Thank You For Your Order - Dazzle Glam",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ff1493;">Thank You For Your Order!</h1>
                <p>Hi ${session.metadata?.firstName || ""},</p>
                <p>Thank you for shopping with Dazzle Glam! We've received your order and will process it shortly.</p>
                
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Total:</strong> $${orderData.total.toFixed(2)} CAD</p>
                
                <h3>Items Ordered:</h3>
                <ul>
                  ${orderData.items.map((item) => `
                    <li>${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                  `).join("")}
                </ul>
                
                <h3>Shipping Address:</h3>
                <p>
                  ${orderData.shipping.name}<br>
                  ${orderData.shipping.line1}<br>
                  ${orderData.shipping.line2 ? `${orderData.shipping.line2}<br>` : ""}
                  ${orderData.shipping.city}, ${orderData.shipping.province} ${orderData.shipping.postalCode}<br>
                  ${orderData.shipping.country}
                </p>
                
                <p>We'll send you a shipping confirmation email with tracking information once your order ships.</p>
                
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>Dazzle Glam Team</strong>
                </p>
              </div>
            `,
          });
        }

        // Send email to admin/owner
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New Order Received - ${order.orderNumber}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ff1493;">New Order Received!</h1>
                
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Customer:</strong> ${session.metadata?.firstName || ""} ${session.metadata?.lastName || ""}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Phone:</strong> ${session.customer_details?.phone || session.metadata?.customerPhone || "N/A"}</p>
                <p><strong>Total:</strong> $${orderData.total.toFixed(2)} CAD</p>
                
                <h3>Items:</h3>
                <ul>
                  ${orderData.items.map((item) => `
                    <li>${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                  `).join("")}
                </ul>
                
                <h3>Shipping Address:</h3>
                <p>
                  ${orderData.shipping.name}<br>
                  ${orderData.shipping.line1}<br>
                  ${orderData.shipping.line2 ? `${orderData.shipping.line2}<br>` : ""}
                  ${orderData.shipping.city}, ${orderData.shipping.province} ${orderData.shipping.postalCode}<br>
                  ${orderData.shipping.country}
                </p>
                
                <h3>Shipping Method:</h3>
                <p>${session.metadata?.shippingMethod || "standard"}</p>
                
                <p style="margin-top: 30px;">
                  <strong>Please process this order from the admin panel.</strong>
                </p>
              </div>
            `,
          });
        }

        console.log("✅ Order created:", order.orderNumber);
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
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
