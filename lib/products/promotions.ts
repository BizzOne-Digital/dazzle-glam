import { FUNDRAISING_PRODUCT_NAME_PATTERN } from "@/config/site";

export type ProductPromotionFields = {
  name: string;
  slug: string;
  pinToShopTop?: boolean;
  freeShipping?: boolean;
};

export function matchesFundraisingProductName(
  name?: string | null,
  slug?: string | null
): boolean {
  const n = (name || "").trim();
  const s = (slug || "").trim();
  return (
    (!!n && FUNDRAISING_PRODUCT_NAME_PATTERN.test(n)) ||
    (!!s && FUNDRAISING_PRODUCT_NAME_PATTERN.test(s))
  );
}

export function productPinsToShopTop(p: ProductPromotionFields): boolean {
  return !!p.pinToShopTop || matchesFundraisingProductName(p.name, p.slug);
}

export function productQualifiesForFreeShipping(
  p: ProductPromotionFields
): boolean {
  return (
    !!p.freeShipping || matchesFundraisingProductName(p.name, p.slug)
  );
}

export function cartLineQualifiesForFreeShipping(line: {
  name?: string;
  freeShipping?: boolean;
}): boolean {
  if (line.freeShipping) return true;
  return matchesFundraisingProductName(line.name, undefined);
}

export function cartQualifiesForProductFreeShipping(
  lines: Array<{ name?: string; freeShipping?: boolean }>
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
