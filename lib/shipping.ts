/** Shared shipping rules for cart + checkout (matches admin defaults). */

export const FREE_SHIPPING_THRESHOLD = 50;
export const STANDARD_SHIPPING_COST = 6.99;
export const USA_STANDARD_SHIPPING_COST = 10.99;
export const EXPRESS_SHIPPING_COST = 15;
export const CANADA_TAX_RATE = 0.13;

export type ShippingCountry = "CA" | "US";
export type ShippingMethodId = "standard" | "express" | "standard_usa";

export const SHIPPING_ETA = {
  standard: "4–7 days",
  express: "2–4 business days",
  standard_usa: "5–10 business days",
} as const;

export const CANADA_PROVINCES = [
  { label: "Alberta", value: "AB" },
  { label: "British Columbia", value: "BC" },
  { label: "Manitoba", value: "MB" },
  { label: "New Brunswick", value: "NB" },
  { label: "Newfoundland and Labrador", value: "NL" },
  { label: "Northwest Territories", value: "NT" },
  { label: "Nova Scotia", value: "NS" },
  { label: "Nunavut", value: "NU" },
  { label: "Ontario", value: "ON" },
  { label: "Prince Edward Island", value: "PE" },
  { label: "Quebec", value: "QC" },
  { label: "Saskatchewan", value: "SK" },
  { label: "Yukon", value: "YT" },
] as const;

export const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "District of Columbia", value: "DC" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
] as const;

export function normalizeShippingCountry(country?: string): ShippingCountry {
  const normalized = (country || "").trim().toUpperCase();
  if (
    normalized === "US" ||
    normalized === "USA" ||
    normalized === "UNITED STATES" ||
    normalized === "UNITED STATES OF AMERICA"
  ) {
    return "US";
  }
  return "CA";
}

export function countryLabel(country: ShippingCountry): string {
  return country === "US" ? "United States" : "Canada";
}

export function resolveShippingMethod(
  rawMethod: string | undefined,
  country: ShippingCountry
): ShippingMethodId {
  if (country === "US") return "standard_usa";
  if (rawMethod === "express") return "express";
  return "standard";
}

export function calcShippingCost(
  subtotal: number,
  method: ShippingMethodId = "standard",
  country: ShippingCountry = "CA"
): number {
  if (subtotal <= 0) return 0;

  if (method === "standard_usa" || country === "US") {
    return USA_STANDARD_SHIPPING_COST;
  }

  // Free shipping only applies to Canadian Standard — Express is always paid
  if (method === "express") return EXPRESS_SHIPPING_COST;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING_COST;
}

export function calcTaxAmount(
  subtotal: number,
  shippingCost: number,
  country: ShippingCountry = "CA"
): number {
  if (country === "US") return 0;
  return Math.round((subtotal + shippingCost) * CANADA_TAX_RATE * 100) / 100;
}

export function shippingMethodLabel(method: ShippingMethodId): string {
  if (method === "standard_usa") return "Standard Shipping to USA";
  if (method === "express") return "Express";
  return "Standard";
}

export function shippingEta(method: ShippingMethodId): string {
  return SHIPPING_ETA[method];
}
