import type { CartLine } from "@/types";
import {
  calculateQuantityBreakTotal,
  type QuantityPriceBreak,
} from "@/lib/pricing/quantityBreaks";

export type PricedCartLine = Pick<
  CartLine,
  "price" | "quantity" | "quantityPriceBreaks"
>;

export function getCartLineTotal(line: PricedCartLine): number {
  return calculateQuantityBreakTotal(
    line.price,
    line.quantity,
    line.quantityPriceBreaks
  );
}

export function cartSubtotal(
  lines: Array<PricedCartLine & { quantity: number }>
): number {
  const sum = lines.reduce((acc, line) => acc + getCartLineTotal(line), 0);
  return Math.round(sum * 100) / 100;
}

export function hasQuantityBreakPricing(
  breaks?: QuantityPriceBreak[] | null
): boolean {
  return !!breaks?.length;
}
