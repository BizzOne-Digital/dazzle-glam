/** Shared shipping rules for cart + checkout (matches admin defaults). */

export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING_COST = 8;
export const EXPRESS_SHIPPING_COST = 15;

export type ShippingMethodId = "standard" | "express";

<<<<<<< HEAD
=======
export const SHIPPING_ETA = {
  standard: "4–7 days",
  express: "2–4 business days",
} as const;

>>>>>>> 7ac483d (fix)
export function calcShippingCost(
  subtotal: number,
  method: ShippingMethodId = "standard"
): number {
  if (subtotal <= 0) return 0;
  // Free shipping only applies to Standard — Express is always paid
  if (method === "express") return EXPRESS_SHIPPING_COST;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING_COST;
}

export function shippingMethodLabel(method: ShippingMethodId): string {
  return method === "express" ? "Express" : "Standard";
}
<<<<<<< HEAD
=======

export function shippingEta(method: ShippingMethodId): string {
  return SHIPPING_ETA[method];
}
>>>>>>> 7ac483d (fix)
