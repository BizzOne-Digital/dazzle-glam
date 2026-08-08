/** Shared product category + size presets (rings / bracelets). */

export const PRODUCT_CATEGORIES = [
  "rings",
  "bracelets",
  "earrings",
  "necklaces",
  "accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"] as const;

export const BRACELET_SIZES = ["Small", "Medium", "Large"] as const;

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

/** Rings and bracelets use ProductSizes + size inquiry / notify. */
export function categoryNeedsSizes(category?: string | null): boolean {
  return category === "rings" || category === "bracelets";
}

export function getSizePresetsForCategory(
  category?: string | null
): readonly string[] {
  if (category === "bracelets") return BRACELET_SIZES;
  if (category === "rings") return RING_SIZES;
  return [];
}

export function sizeLabel(size: string, category?: string | null): string {
  if (category === "bracelets") return size;
  // Ring numbers: "Size 7"
  if (/^\d+$/.test(size)) return `Size ${size}`;
  return size;
}
