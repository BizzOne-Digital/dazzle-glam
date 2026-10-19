import {
  normalizeQuantityPriceBreaks,
  resolveExactBundlePrice,
} from "@/lib/pricing/quantityBreaks";
import {
  effectiveQuantityPriceBreaks,
  productUsesBundleOnlyPricing,
} from "@/lib/products/promotions";

export const PACK_SELECTION_ERROR =
  "Please select a pack option (2 for $5.50 or 4 for $10.00) before checkout.";

type BundleLineFields = {
  name: string;
  sku?: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  bundleOnlyPricing?: boolean;
  quantityPriceBreaks?: Array<{ quantity: number; price: number }>;
  fixedLineTotal?: number;
};

export function cartLineUsesBundleOnlyPricing(line: BundleLineFields): boolean {
  if (line.bundleOnlyPricing) return true;
  return productUsesBundleOnlyPricing({
    name: line.name,
    slug: "",
    sku: line.sku,
    quantityPriceBreaks: line.quantityPriceBreaks,
  });
}

export function validateCartBundleSelection(
  line: BundleLineFields
): string | null {
  if (!cartLineUsesBundleOnlyPricing(line)) return null;

  const breaks = effectiveQuantityPriceBreaks({
    name: line.name,
    slug: "",
    sku: line.sku,
    quantityPriceBreaks: normalizeQuantityPriceBreaks(line.quantityPriceBreaks),
  });
  if (!breaks.length) return null;

  const exact = resolveExactBundlePrice(line.quantity, breaks);
  const hasPackVariant = (line.variantId || "").includes("pack:");
  const hasPackLabel = /for \$/i.test(line.variantLabel || "");

  if (exact === null) {
    return `${PACK_SELECTION_ERROR} (${line.name})`;
  }
  if (
    typeof line.fixedLineTotal === "number" &&
    Math.abs(line.fixedLineTotal - exact) > 0.01
  ) {
    return `${PACK_SELECTION_ERROR} (${line.name})`;
  }
  if (!hasPackVariant && !hasPackLabel && line.fixedLineTotal == null) {
    return `${PACK_SELECTION_ERROR} (${line.name})`;
  }

  return null;
}

export function validateCartItemsForCheckout(
  items: BundleLineFields[]
): string | null {
  for (const item of items) {
    const err = validateCartBundleSelection(item);
    if (err) return err;
  }
  return null;
}

export function validatePricedCheckoutLines(
  lines: Array<{
    name: string;
    quantity: number;
    quantityPriceBreaks?: Array<{ quantity: number; price: number }>;
    bundleOnly: boolean;
    lineTotal: number;
  }>
): string | null {
  for (const line of lines) {
    if (!line.bundleOnly) continue;
    const breaks = normalizeQuantityPriceBreaks(line.quantityPriceBreaks);
    const exact = resolveExactBundlePrice(line.quantity, breaks);
    if (exact === null || line.lineTotal <= 0) {
      return `${PACK_SELECTION_ERROR} (${line.name})`;
    }
  }
  return null;
}
