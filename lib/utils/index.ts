import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "CAD",
  locale = "en-CA"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateDiscount(
  subtotal: number,
  type: "percentage" | "fixed" | "free_shipping",
  value: number
) {
  if (type === "percentage") {
    return Math.min(subtotal, (subtotal * value) / 100);
  }
  if (type === "fixed") {
    return Math.min(subtotal, value);
  }
  return 0;
}

export function getDiscountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return `${str.slice(0, length).trim()}…`;
}

export function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
