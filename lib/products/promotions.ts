import {
  FUNDRAISING_DEFAULT_QUANTITY_BREAKS,
  FUNDRAISING_PRODUCT_NAME_PATTERN,
  FUNDRAISING_PRODUCT_SKUS,
} from "@/config/site";
import {
  normalizeQuantityPriceBreaks,
  type QuantityPriceBreak,
} from "@/lib/pricing/quantityBreaks";

export type ProductPromotionFields = {
  name: string;
  slug: string;
  sku?: string;
  materials?: string[];
  pinToShopTop?: boolean;
  freeShipping?: boolean;
  quantityPriceBreaks?: QuantityPriceBreak[];
};

const FUNDRAISING_SKU_SET = new Set(
  FUNDRAISING_PRODUCT_SKUS.map((s) => s.toUpperCase())
);

export function matchesFundraisingProduct(
  fields: Pick<ProductPromotionFields, "name" | "slug" | "sku" | "materials">
): boolean {
  const sku = (fields.sku || "").trim().toUpperCase();
  if (sku && FUNDRAISING_SKU_SET.has(sku)) return true;

  const n = (fields.name || "").trim();
  const s = (fields.slug || "").trim();
  if (n && FUNDRAISING_PRODUCT_NAME_PATTERN.test(n)) return true;
  if (s && FUNDRAISING_PRODUCT_NAME_PATTERN.test(s)) return true;

  return (fields.materials || []).some((m) => /silicone/i.test(m));
}

export function productPinsToShopTop(p: ProductPromotionFields): boolean {
  return !!p.pinToShopTop || matchesFundraisingProduct(p);
}

export function productQualifiesForFreeShipping(
  p: ProductPromotionFields
): boolean {
  return !!p.freeShipping || matchesFundraisingProduct(p);
}

/** Fundraising / pack-only products: customer must pick an exact bundle tier. */
export function productUsesBundleOnlyPricing(
  p: ProductPromotionFields & { bundleOnlyPricing?: boolean }
): boolean {
  if (p.bundleOnlyPricing) return true;
  if (!matchesFundraisingProduct(p)) return false;
  return effectiveQuantityPriceBreaks(p).length > 0;
}

export function effectiveQuantityPriceBreaks(
  p: ProductPromotionFields
): QuantityPriceBreak[] {
  const saved = normalizeQuantityPriceBreaks(p.quantityPriceBreaks);
  if (saved.length) return saved;
  if (matchesFundraisingProduct(p)) {
    return [...FUNDRAISING_DEFAULT_QUANTITY_BREAKS];
  }
  return [];
}

export function cartLineQualifiesForFreeShipping(line: {
  name?: string;
  sku?: string;
  freeShipping?: boolean;
}): boolean {
  if (line.freeShipping) return true;
  return matchesFundraisingProduct({
    name: line.name || "",
    slug: "",
    sku: line.sku,
  });
}

export function cartQualifiesForProductFreeShipping(
  lines: Array<{ name?: string; sku?: string; freeShipping?: boolean }>
): boolean {
  return lines.some(cartLineQualifiesForFreeShipping);
}

/** Pinned products first; preserve relative order within each group. */
export function sortProductsForShop<T extends ProductPromotionFields>(
  products: T[]
): T[] {
  const pinned: T[] = [];
  const rest: T[] = [];
  for (const p of products) {
    if (productPinsToShopTop(p)) pinned.push(p);
    else rest.push(p);
  }
  return [...pinned, ...rest];
}

export function fundraisingProductMongoQuery() {
  return {
    $or: [
      { sku: { $in: [...FUNDRAISING_PRODUCT_SKUS] } },
      { name: FUNDRAISING_PRODUCT_NAME_PATTERN },
      { slug: FUNDRAISING_PRODUCT_NAME_PATTERN },
      { materials: /silicone/i },
    ],
  };
}
