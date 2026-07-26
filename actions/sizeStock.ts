"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { ProductSizes } from "@/models/ProductSizes";

const ALL_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"] as const;

function toStockRecord(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  for (const size of ALL_SIZES) out[size] = 0;

  if (!raw) return out;

  if (raw instanceof Map) {
    for (const [k, v] of raw.entries()) {
      const key = String(k);
      if (ALL_SIZES.includes(key as (typeof ALL_SIZES)[number])) {
        out[key] = Math.max(0, Number(v) || 0);
      }
    }
    return out;
  }

  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (ALL_SIZES.includes(k as (typeof ALL_SIZES)[number])) {
        out[k] = Math.max(0, Number(v) || 0);
      }
    }
  }

  return out;
}

/** Admin-only: load per-size stock for internal inventory notes */
export async function getProductSizeStock(productId: string) {
  await requireAdmin();
  await connectDB();
    const doc = await ProductSizes.findOne({ productId }).lean();
    const rawStock =
      doc && typeof doc === "object" && "sizeStock" in doc
        ? (doc as { sizeStock?: unknown }).sizeStock
        : undefined;
    return {
      success: true as const,
      sizeStock: toStockRecord(rawStock),
    };
}

/** Admin-only: save per-size stock (not shown on storefront) */
export async function updateProductSizeStock(
  productId: string,
  productSlug: string,
  sizeStock: Record<string, number>
) {
  await requireAdmin();
  await connectDB();

  const clean: Record<string, number> = {};
  for (const size of ALL_SIZES) {
    clean[size] = Math.max(0, Math.floor(Number(sizeStock[size]) || 0));
  }

  await ProductSizes.findOneAndUpdate(
    { productId },
    {
      $set: {
        productId,
        productSlug,
        sizeStock: clean,
      },
      $setOnInsert: {
        sizes: [],
      },
    },
    { upsert: true, new: true }
  );

  revalidatePath(`/admin/products/${productId}`);
  return { success: true as const, message: "Size stock saved (admin only)" };
}
