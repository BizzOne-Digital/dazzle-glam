"use server";

import { connectDB } from "@/lib/db/connect";
import { SizeInquiry } from "@/models";
import { sendSizeAvailableEmail } from "@/lib/email";
import { z } from "zod";
import type { ActionResult } from "@/actions/auth";

const inquirySchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  customerName: z.string().min(2, "Please enter your name"),
  customerEmail: z.string().email("Please enter a valid email"),
  desiredSize: z.string().min(1, "Please select a size"),
  notes: z.string().optional(),
});

/** Customer submits a size inquiry from the product page */
export async function submitSizeInquiry(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await connectDB();

  // Avoid duplicate pending inquiries for same customer + product + size
  const existing = await SizeInquiry.findOne({
    productId: parsed.data.productId,
    customerEmail: parsed.data.customerEmail.toLowerCase(),
    desiredSize: parsed.data.desiredSize,
    status: "pending",
  });

  if (existing) {
    return {
      success: true,
      message:
        "You're already on the list for this size. We'll email you when it's available.",
      data: { id: String(existing._id) },
    };
  }

  const inquiry = await SizeInquiry.create({
    productId: parsed.data.productId,
    productSlug: parsed.data.productSlug,
    productName: parsed.data.productName,
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail.toLowerCase(),
    desiredSize: parsed.data.desiredSize,
    notes: parsed.data.notes,
    status: "pending",
  });

  return {
    success: true,
    message:
      "We've noted your request! We'll email you as soon as this size is available.",
    data: { id: String(inquiry._id) },
  };
}

/** Admin: get all inquiries for a product */
export async function getProductInquiries(
  productId: string
): Promise<{ success: boolean; data: ISizeInquiryPlain[] }> {
  await connectDB();
  const inquiries = await SizeInquiry.find({ productId })
    .sort({ createdAt: -1 })
    .lean();
  return {
    success: true,
    data: inquiries.map((i) => ({
      id: String(i._id),
      customerName: i.customerName,
      customerEmail: i.customerEmail,
      desiredSize: i.desiredSize,
      notes: i.notes,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
    })),
  };
}

export interface ISizeInquiryPlain {
  id: string;
  customerName: string;
  customerEmail: string;
  desiredSize: string;
  notes?: string;
  status: string;
  createdAt: string;
}

/** Admin: notify a specific customer that their size is now available */
export async function notifyCustomerSizeAvailable(
  inquiryId: string,
  siteUrl?: string
): Promise<ActionResult> {
  await connectDB();

  const inquiry = await SizeInquiry.findById(inquiryId);
  if (!inquiry) {
    return { success: false, message: "Inquiry not found" };
  }

  const productUrl = `${siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://dazzleglamjewelry.ca"}/products/${inquiry.productSlug}`;

  try {
    await sendSizeAvailableEmail({
      to: inquiry.customerEmail,
      customerName: inquiry.customerName,
      productName: inquiry.productName,
      size: inquiry.desiredSize,
      productUrl,
    });

    inquiry.status = "notified";
    inquiry.notifiedAt = new Date();
    await inquiry.save();

    return { success: true, message: `Email sent to ${inquiry.customerEmail}` };
  } catch {
    return {
      success: false,
      message: "Failed to send email. Check SMTP settings.",
    };
  }
}

/** Admin: update available sizes for a demo product + auto-notify matching inquiries */
export async function updateProductSizesAndNotify(
  productId: string,
  productSlug: string,
  newSizes: string[],
  siteUrl?: string
): Promise<ActionResult<{ notified: number }>> {
  await connectDB();

  // Persist sizes to MongoDB so the storefront picks them up
  const { ProductSizes } = await import("@/models/ProductSizes");
  await ProductSizes.findOneAndUpdate(
    { productId },
    { productId, productSlug, sizes: newSizes },
    { upsert: true, new: true }
  );

  // Find pending inquiries whose desired size is now available
  const matching = await SizeInquiry.find({
    productId,
    desiredSize: { $in: newSizes },
    status: "pending",
  });

  let notified = 0;
  const url =
    siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://dazzleglamjewelry.ca";

  for (const inquiry of matching) {
    try {
      await sendSizeAvailableEmail({
        to: inquiry.customerEmail,
        customerName: inquiry.customerName,
        productName: inquiry.productName,
        size: inquiry.desiredSize,
        productUrl: `${url}/products/${productSlug}`,
      });
      inquiry.status = "notified";
      inquiry.notifiedAt = new Date();
      await inquiry.save();
      notified++;
    } catch {
      // continue even if one email fails
    }
  }

  return {
    success: true,
    message:
      notified > 0
        ? `Sizes updated. ${notified} customer(s) notified by email.`
        : "Sizes updated. No pending inquiries to notify.",
    data: { notified },
  };
}
