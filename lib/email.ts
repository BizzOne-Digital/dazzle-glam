import nodemailer from "nodemailer";

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
