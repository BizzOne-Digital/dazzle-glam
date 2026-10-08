export type QuantityPriceBreak = {
  quantity: number;
  price: number;
};

export function normalizeQuantityPriceBreaks(
  raw: QuantityPriceBreak[] | undefined | null
): QuantityPriceBreak[] {
  if (!raw?.length) return [];
  const byQty = new Map<number, number>();
  for (const row of raw) {
    const quantity = Math.floor(Number(row.quantity));
    const price = Number(row.price);
    if (quantity < 2 || !Number.isFinite(price) || price < 0) continue;
    byQty.set(quantity, Math.round(price * 100) / 100);
  }
  return [...byQty.entries()]
    .map(([quantity, price]) => ({ quantity, price }))
    .sort((a, b) => a.quantity - b.quantity);
}

/** Largest bundle sizes first for greedy pricing. */
function breaksForPricing(breaks: QuantityPriceBreak[]): QuantityPriceBreak[] {
  return [...breaks].sort((a, b) => b.quantity - a.quantity);
}

/**
 * Applies bundle deals: each full group of N costs the bundle price; leftover units
 * use the regular unit price (e.g. 4 for $10 + singles at $2.75).
 */
export function calculateQuantityBreakTotal(
  unitPrice: number,
  quantity: number,
  breaks?: QuantityPriceBreak[] | null
): number {
  const qty = Math.max(0, Math.floor(quantity));
  if (qty <= 0) return 0;

  const normalized = normalizeQuantityPriceBreaks(breaks || []);
  if (!normalized.length) {
    return Math.round(unitPrice * qty * 100) / 100;
  }

  let remaining = qty;
  let total = 0;
  for (const deal of breaksForPricing(normalized)) {
    const groups = Math.floor(remaining / deal.quantity);
    if (groups > 0) {
      total += groups * deal.price;
      remaining -= groups * deal.quantity;
    }
  }
  if (remaining > 0) {
    total += remaining * unitPrice;
  }
  return Math.round(total * 100) / 100;
}

export function formatQuantityBreakLabel(deal: QuantityPriceBreak): string {
  return `${deal.quantity} for $${deal.price.toFixed(2)}`;
}

export function formatQuantityBreaksList(
  breaks: QuantityPriceBreak[] | undefined | null
): string[] {
  return normalizeQuantityPriceBreaks(breaks).map(formatQuantityBreakLabel);
}
