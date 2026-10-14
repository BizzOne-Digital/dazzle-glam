"use server";

import { headers } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, newsletterSchema } from "@/lib/validations";
import { ContactSubmission, NewsletterSubscriber } from "@/models";
import { sendContactNotificationEmail } from "@/lib/email";
import type { ActionResult } from "@/actions/auth";

async function clientKey(prefix: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

export async function submitContact(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const limited = rateLimit(await clientKey("contact"), {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many messages. Please try again later.",
    };
  }

  await connectDB();

  const submission = await ContactSubmission.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    inquiryType: parsed.data.inquiryType,
    orderNumber: parsed.data.orderNumber,
    message: parsed.data.message,
  });

  // Send email notification to admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
  if (adminEmail) {
    try {
      await sendContactNotificationEmail({
        customerName: parsed.data.name,
        customerEmail: parsed.data.email,
        customerPhone: parsed.data.phone,
        inquiryType: parsed.data.inquiryType,
        orderNumber: parsed.data.orderNumber,
        message: parsed.data.message,
        adminEmail,
      });
    } catch (emailError) {
      console.error("Failed to send contact notification email:", emailError);
      // Don't fail the submission if email fails
    }
  }

  return {
    success: true,
    message: "Thanks for reaching out — we'll get back to you soon.",
    data: { id: String(submission._id) },
  };
}

export async function subscribeNewsletter(
  input: unknown
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please enter a valid email",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const limited = rateLimit(await clientKey("newsletter"), {
    limit: 8,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many subscription attempts. Please try again later.",
    };
  }

  await connectDB();

  const email = parsed.data.email.toLowerCase();
  const existing = await NewsletterSubscriber.findOne({ email });

  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      existing.consentedAt = new Date();
      if (parsed.data.name) existing.name = parsed.data.name;
      await existing.save();
    }
    return {
      success: true,
      message: "You're already on the list — welcome back.",
    };
  }

  await NewsletterSubscriber.create({
    email,
    name: parsed.data.name,
    isActive: true,
    consentedAt: new Date(),
  });

  return {
    success: true,
    message: "You're subscribed. Glam updates are on the way.",
  };
}
