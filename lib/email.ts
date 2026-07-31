import nodemailer from "nodemailer";

function createTransport() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file"
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function fromAddress(label = "Dazzle Glam") {
  // Gmail SMTP requires the From address to match the authenticated account
  const address =
    process.env.SMTP_USER ||
    process.env.EMAIL_FROM ||
    "noreply@dazzleglamjewelry.ca";
  return `"${label}" <${address}>`;
}

function formatMoney(amount: number, currency = "CAD") {
  return `$${amount.toFixed(2)} ${currency}`;
}

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
  total: number;
  variantLabel?: string;
  sku?: string;
};

type OrderEmailAddress = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

type OrderEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderEmailItem[];
  shippingAddress: OrderEmailAddress;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency?: string;
  shippingMethod?: string;
};

function orderItemsHtml(items: OrderEmailItem[], currency: string) {
  return items
    .map((item) => {
      const size = item.variantLabel?.trim();
      const sku = item.sku?.trim();
      const meta = [size && `Variant: ${size}`, sku && `SKU: ${sku}`]
        .filter(Boolean)
        .join(" · ");
      return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #333;color:#fff">
          <div style="font-weight:600">${item.name}</div>
          ${
            meta
              ? `<div style="color:#ff1493;font-size:12px;margin-top:4px">${meta}</div>`
              : ""
          }
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #333;color:#aaa;text-align:center">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #333;color:#fff;text-align:right">${formatMoney(item.total, currency)}</td>
      </tr>`;
    })
    .join("");
}

function addressHtml(address: OrderEmailAddress) {
  return `
    ${address.name}<br>
    ${address.line1}<br>
    ${address.line2 ? `${address.line2}<br>` : ""}
    ${address.city}, ${address.province} ${address.postalCode}<br>
    ${address.country}
  `;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  customerName,
  items,
  shippingAddress,
  subtotal,
  shippingAmount,
  taxAmount,
  total,
  currency = "CAD",
}: OrderEmailPayload & { to: string }) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject: `Thank you for your order ${orderNumber} — Dazzle Glam`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#ff1493;font-size:28px;margin:0">Dazzle Glam</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0">Order Confirmation</p>
        </div>

        <h2 style="font-size:22px;margin:0 0 12px">Thank you for your order!</h2>
        <p style="color:#ccc;line-height:1.6;margin:0 0 20px">
          Hi ${customerName || "there"}, thank you for shopping with Dazzle Glam.
          We've received your order and will start preparing it shortly.
        </p>

        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0;color:#888;font-size:12px">Order Number</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:bold;color:#ff1493">${orderNumber}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr>
              <th style="text-align:left;color:#888;font-size:12px;padding-bottom:8px">Ring / Item</th>
              <th style="text-align:center;color:#888;font-size:12px;padding-bottom:8px">Qty</th>
              <th style="text-align:right;color:#888;font-size:12px;padding-bottom:8px">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml(items, currency)}
          </tbody>
        </table>

        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px;display:flex;justify-content:space-between"><span style="color:#888">Subtotal</span><span>${formatMoney(subtotal, currency)}</span></p>
          <p style="margin:0 0 8px;display:flex;justify-content:space-between"><span style="color:#888">Shipping</span><span>${shippingAmount > 0 ? formatMoney(shippingAmount, currency) : "Free"}</span></p>
          <p style="margin:0 0 8px;display:flex;justify-content:space-between"><span style="color:#888">Tax</span><span>${formatMoney(taxAmount, currency)}</span></p>
          <p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #333;display:flex;justify-content:space-between;font-size:16px;font-weight:bold"><span>Total</span><span style="color:#ff1493">${formatMoney(total, currency)}</span></p>
        </div>

        <p style="color:#888;font-size:12px;margin:0 0 6px">Shipping Address</p>
        <p style="color:#ccc;line-height:1.6;margin:0 0 24px">${addressHtml(shippingAddress)}</p>

        <p style="color:#ccc;line-height:1.6">
          Questions about your order? Reply to this email or contact us at dazzleglamcollection@gmail.com.
          We'll send another email when your order ships.
        </p>
        <p style="color:#666;font-size:12px;text-align:center;margin-top:32px">
          With love,<br>Dazzle Glam Jewelry Collection<br>dazzleglamjewelry.ca
        </p>
      </div>
    `,
  });
}

export async function sendNewOrderAdminEmail({
  to,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  items,
  shippingAddress,
  subtotal,
  shippingAmount,
  taxAmount,
  total,
  currency = "CAD",
  shippingMethod,
}: OrderEmailPayload & { to: string }) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: fromAddress("Dazzle Glam Orders"),
    to,
    replyTo: customerEmail,
    subject: `New order placed — ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#ff1493;font-size:28px;margin:0">Dazzle Glam</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0">New Order Notification</p>
        </div>

        <h2 style="font-size:22px;margin:0 0 12px;color:#ff1493">A new order was placed</h2>
        <p style="color:#ccc;line-height:1.6;margin:0 0 20px">
          Order <strong>${orderNumber}</strong> needs processing in the admin panel.
        </p>

        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:0 0 20px">
          <p style="margin:0 0 10px"><span style="color:#888">Customer:</span> ${customerName}</p>
          <p style="margin:0 0 10px"><span style="color:#888">Email:</span> <a href="mailto:${customerEmail}" style="color:#ff1493;text-decoration:none">${customerEmail}</a></p>
          <p style="margin:0 0 10px"><span style="color:#888">Phone:</span> ${customerPhone || "N/A"}</p>
          <p style="margin:0"><span style="color:#888">Shipping method:</span> ${shippingMethod || "standard"}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr>
              <th style="text-align:left;color:#888;font-size:12px;padding-bottom:8px">Ring / Item</th>
              <th style="text-align:center;color:#888;font-size:12px;padding-bottom:8px">Qty</th>
              <th style="text-align:right;color:#888;font-size:12px;padding-bottom:8px">Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml(items, currency)}
          </tbody>
        </table>

        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px"><span style="color:#888">Subtotal:</span> ${formatMoney(subtotal, currency)}</p>
          <p style="margin:0 0 8px"><span style="color:#888">Shipping:</span> ${shippingAmount > 0 ? formatMoney(shippingAmount, currency) : "Free"}</p>
          <p style="margin:0 0 8px"><span style="color:#888">Tax:</span> ${formatMoney(taxAmount, currency)}</p>
          <p style="margin:12px 0 0;padding-top:12px;border-top:1px solid #333;font-size:16px;font-weight:bold"><span style="color:#888">Total:</span> <span style="color:#ff1493">${formatMoney(total, currency)}</span></p>
        </div>

        <p style="color:#888;font-size:12px;margin:0 0 6px">Shipping Address</p>
        <p style="color:#ccc;line-height:1.6;margin:0">${addressHtml(shippingAddress)}</p>
      </div>
    `,
  });
}

export async function sendSizeAvailableEmail({
  to,
  customerName,
  productName,
  size,
  productUrl,
}: {
  to: string;
  customerName: string;
  productName: string;
  size: string;
  productUrl: string;
}) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: fromAddress(),
    to,
    subject: `Great news! Your size is now available — ${productName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#ff1493;font-size:28px;margin:0">Dazzle Glam</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0">Jewelry Collection</p>
        </div>
        <h2 style="font-size:22px;margin:0 0 16px">Hi ${customerName} 💎</h2>
        <p style="color:#ccc;line-height:1.6">
          Great news — size <strong style="color:#ff1493">${size}</strong> is now available for:
        </p>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:16px;font-weight:bold">${productName}</p>
        </div>
        <div style="text-align:center;margin:28px 0">
          <a href="${productUrl}"
             style="background:#ff1493;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:14px;font-weight:bold;letter-spacing:0.1em;display:inline-block">
            SHOP NOW
          </a>
        </div>
        <p style="color:#666;font-size:12px;text-align:center;margin-top:32px">
          You received this because you inquired about size availability on dazzleglamjewelry.ca
        </p>
      </div>
    `,
  });
}

export async function sendContactNotificationEmail({
  customerName,
  customerEmail,
  customerPhone,
  inquiryType,
  orderNumber,
  message,
  adminEmail,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  inquiryType?: string;
  orderNumber?: string;
  message: string;
  adminEmail: string;
}) {
  const transporter = createTransport();

  await transporter.sendMail({
    from: fromAddress("Dazzle Glam Contact Form"),
    to: adminEmail,
    replyTo: customerEmail,
    subject: `New Contact Form Submission from ${customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#ff1493;font-size:28px;margin:0">Dazzle Glam</h1>
          <p style="color:#888;font-size:12px;margin:4px 0 0">Contact Form Submission</p>
        </div>
        
        <h2 style="font-size:20px;margin:0 0 20px;color:#ff1493">New Message Received</h2>
        
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:20px;margin:20px 0">
          <div style="margin-bottom:16px">
            <p style="color:#888;font-size:12px;margin:0 0 4px">Customer Name</p>
            <p style="color:#fff;font-size:16px;margin:0;font-weight:bold">${customerName}</p>
          </div>
          
          <div style="margin-bottom:16px">
            <p style="color:#888;font-size:12px;margin:0 0 4px">Email</p>
            <p style="color:#fff;font-size:16px;margin:0">
              <a href="mailto:${customerEmail}" style="color:#ff1493;text-decoration:none">${customerEmail}</a>
            </p>
          </div>
          
          ${customerPhone ? `
          <div style="margin-bottom:16px">
            <p style="color:#888;font-size:12px;margin:0 0 4px">Phone</p>
            <p style="color:#fff;font-size:16px;margin:0">${customerPhone}</p>
          </div>
          ` : ''}
          
          ${inquiryType ? `
          <div style="margin-bottom:16px">
            <p style="color:#888;font-size:12px;margin:0 0 4px">Inquiry Type</p>
            <p style="color:#fff;font-size:16px;margin:0">${inquiryType}</p>
          </div>
          ` : ''}
          
          ${orderNumber ? `
          <div style="margin-bottom:16px">
            <p style="color:#888;font-size:12px;margin:0 0 4px">Order Number</p>
            <p style="color:#fff;font-size:16px;margin:0">${orderNumber}</p>
          </div>
          ` : ''}
          
          <div style="margin-bottom:0">
            <p style="color:#888;font-size:12px;margin:0 0 8px">Message</p>
            <p style="color:#ccc;font-size:14px;margin:0;line-height:1.6;white-space:pre-wrap">${message}</p>
          </div>
        </div>
        
        <p style="color:#666;font-size:12px;text-align:center;margin-top:32px">
          Reply directly to this email to respond to ${customerName}
        </p>
      </div>
    `,
  });
}
