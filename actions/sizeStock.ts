"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { ProductSizes } from "@/models/ProductSizes";
import { BRACELET_SIZES, RING_SIZES } from "@/lib/productSizes";

const ALLOWED_SIZES = new Set<string>([...RING_SIZES, ...BRACELET_SIZES]);

function toStockRecord(
  raw: unknown,
  sizeKeys: readonly string[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const size of sizeKeys) out[size] = 0;

  if (!raw) return out;

  const apply = (key: string, value: unknown) => {
    if (!sizeKeys.includes(key) || !ALLOWED_SIZES.has(key)) return;
    out[key] = Math.max(0, Number(value) || 0);
  };

  if (raw instanceof Map) {
    for (const [k, v] of raw.entries()) apply(String(k), v);
    return out;
  }

  if (typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      apply(k, v);
    }
  }

  return out;
}

/** Admin-only: load per-size stock for internal inventory notes */
export async function getProductSizeStock(
  productId: string,
  sizeKeys?: string[]
) {
  await requireAdmin();
  await connectDB();
  const keys =
    sizeKeys && sizeKeys.length
      ? sizeKeys.filter((s) => ALLOWED_SIZES.has(s))
      : [...RING_SIZES];
  const doc = await ProductSizes.findOne({ productId }).lean();
  const rawStock =
    doc && typeof doc === "object" && "sizeStock" in doc
      ? (doc as { sizeStock?: unknown }).sizeStock
      : undefined;
  return {
    success: true as const,
    sizeStock: toStockRecord(rawStock, keys),
  };
}

/** Admin-only: save per-size stock (not shown on storefront) */
export async function updateProductSizeStock(
  productId: string,
  productSlug: string,
  sizeStock: Record<string, number>,
  sizeKeys?: string[]
) {
  await requireAdmin();
  await connectDB();

  const keys =
    sizeKeys && sizeKeys.length
      ? sizeKeys.filter((s) => ALLOWED_SIZES.has(s))
      : [...RING_SIZES];

  const clean: Record<string, number> = {};
  for (const size of keys) {
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
