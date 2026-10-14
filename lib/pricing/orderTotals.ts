/** Client-safe order money helpers (no DB / mongoose). */

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeLineTotal(price: number, quantity: number): number {
  return roundMoney(price * quantity);
}

export function computeOrderTotals(
  subtotal: number,
  discountAmount: number,
  shippingAmount: number,
  taxRate: number
): { subtotal: number; taxAmount: number; total: number } {
  const normalizedSubtotal = roundMoney(subtotal);
  const discount = roundMoney(Math.max(0, discountAmount));
  const shipping = roundMoney(Math.max(0, shippingAmount));
  const taxableBase = Math.max(0, normalizedSubtotal - discount);
  const taxAmount = roundMoney(taxableBase * taxRate);
  const total = roundMoney(taxableBase + shipping + taxAmount);
  return { subtotal: normalizedSubtotal, taxAmount, total };
}
