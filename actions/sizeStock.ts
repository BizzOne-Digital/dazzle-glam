"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { ProductSizes } from "@/models/ProductSizes";
import { BRACELET_SIZES, RING_SIZES } from "@/lib/productSizes";
import {
  parseWidthSizeStockMap,
  parseWidthSizesMap,
} from "@/lib/productWidthSizes";

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
  sizeKeys?: string[],
  widths?: string[]
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

  const result: {
    success: true;
    sizeStock: Record<string, number>;
    widthSizeStock?: Record<string, Record<string, number>>;
  } = {
    success: true,
    sizeStock: toStockRecord(rawStock, keys),
  };

  if (widths?.length) {
    const rawWidthStock =
      doc && typeof doc === "object" && "widthSizeStock" in doc
        ? (doc as { widthSizeStock?: unknown }).widthSizeStock
        : undefined;
    result.widthSizeStock = parseWidthSizeStockMap(rawWidthStock, widths, keys);
  }

  return result;
}

/** Admin-only: save per-size stock (not shown on storefront) */
export async function updateProductSizeStock(
  productId: string,
  productSlug: string,
  sizeStock: Record<string, number>,
  sizeKeys?: string[],
  widthSizeStock?: Record<string, Record<string, number>>
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

  const update: Record<string, unknown> = {
    productId,
    productSlug,
    sizeStock: clean,
  };

  if (widthSizeStock) {
    const cleanWidth: Record<string, Record<string, number>> = {};
    for (const [width, row] of Object.entries(widthSizeStock)) {
      const cleanRow: Record<string, number> = {};
      for (const size of keys) {
        cleanRow[size] = Math.max(0, Math.floor(Number(row?.[size]) || 0));
      }
      cleanWidth[width] = cleanRow;
    }
    update.widthSizeStock = cleanWidth;
  }

  await ProductSizes.findOneAndUpdate(
    { productId },
    {
      $set: update,
      $setOnInsert: {
        sizes: [],
        widthSizes: {},
      },
    },
    { upsert: true, new: true }
  );

  revalidatePath(`/admin/products/${productId}`);
  return { success: true as const, message: "Size stock saved (admin only)" };
}

/** Admin-only: load per-width sizes map */
export async function getProductWidthSizes(productId: string) {
  await requireAdmin();
  await connectDB();
  const doc = (await ProductSizes.findOne({ productId }).lean()) as
    | { sizes?: string[]; widthSizes?: unknown }
    | null;
  return {
    success: true as const,
    widthSizes: parseWidthSizesMap(doc?.widthSizes),
    sizes: doc?.sizes ?? [],
  };
}
