/** Shared product category + size presets (rings / bracelets). */

export const PRODUCT_CATEGORIES = [
  "rings",
  "bracelets",
  "earrings",
  "necklaces",
  "accessories",
  "for-him",
  "for-pets",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  rings: "Rings",
  bracelets: "Bracelets",
  earrings: "Earrings",
  necklaces: "Necklaces",
  accessories: "Accessories",
  "for-him": "For Him",
  "for-pets": "For Pets",
};

export const RING_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12", "13"] as const;

export const BRACELET_SIZES = ["Small", "Medium", "Large"] as const;

/** Optional ring band widths — not all rings use these. */
export const RING_WIDTH_PRESETS = ["4mm", "6mm", "8mm"] as const;

export type RingWidth = (typeof RING_WIDTH_PRESETS)[number];

export interface WidthVariant {
  width: string;
  image?: string;
}

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export function getCategoryLabel(category: string): string {
  if (category === "all") return "All";
  if (isProductCategory(category)) return CATEGORY_LABELS[category];
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
