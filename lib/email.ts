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

const FROM = process.env.EMAIL_FROM || "noreply@dazzleglamjewelry.ca";

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
    from: `"Dazzle Glam" <${FROM}>`,
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
    from: `"Dazzle Glam Contact Form" <${FROM}>`,
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
