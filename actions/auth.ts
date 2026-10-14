"use server";

import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db/connect";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import { Customer } from "@/models";

export type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function registerCustomer(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const limited = rateLimit(`register:${parsed.data.email}`, {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many registration attempts. Please try again later.",
    };
  }

  await connectDB();

  const email = parsed.data.email.toLowerCase();
  const existing = await Customer.findOne({ email }).lean();
  if (existing) {
    return {
      success: false,
      message: "An account with this email already exists",
      errors: { email: ["Email is already registered"] },
    };
  }

  const password = await hashPassword(parsed.data.password);
  const customer = await Customer.create({
    name: parsed.data.name,
    email,
    password,
    phone: parsed.data.phone,
    role: "customer",
  });

  return {
    success: true,
    message: "Account created successfully",
    data: { id: String(customer._id) },
  };
}

/**
 * Stub: generates a reset token and stores it on the customer.
 * Wire email delivery (SMTP) when ready — token is returned only in development.
 */
export async function requestPasswordReset(
  emailInput: string
): Promise<ActionResult<{ token?: string }>> {
  const email = emailInput?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Valid email is required" };
  }

  const limited = rateLimit(`password-reset:${email}`, {
    limit: 3,
    windowMs: 15 * 60_000,
  });
  if (!limited.success) {
    return {
      success: false,
      message: "Too many reset requests. Please try again later.",
    };
  }

  await connectDB();

  const customer = await Customer.findOne({ email, isDisabled: false });
  // Always return a generic success to avoid email enumeration
  if (!customer) {
    return {
      success: true,
      message: "If an account exists, a reset link will be sent shortly.",
    };
  }

  const token = randomBytes(32).toString("hex");
  customer.resetToken = token;
  customer.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await customer.save();

  // TODO: send email with reset link using SMTP env vars
  // absoluteUrl(`/reset-password?token=${token}`)

  return {
    success: true,
    message: "If an account exists, a reset link will be sent shortly.",
    data:
      process.env.NODE_ENV === "development" ? { token } : undefined,
  };
}
