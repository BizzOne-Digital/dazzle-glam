/** Shared shipping rules for cart + checkout (matches admin defaults). */

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_COST = 8;
export const EXPRESS_SHIPPING_COST = 15;

export type ShippingMethodId = "standard" | "express";

export function calcShippingCost(
  subtotal: number,
  method: ShippingMethodId = "standard"
): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return method === "express" ? EXPRESS_SHIPPING_COST : STANDARD_SHIPPING_COST;
}

export function shippingMethodLabel(method: ShippingMethodId): string {
  return method === "express" ? "Express" : "Standard";
}
