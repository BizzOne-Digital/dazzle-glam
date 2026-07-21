export type UserRole = "admin" | "customer";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partial"
  | "fulfilled"
  | "returned";

export type DiscountType =
  | "percentage"
  | "fixed"
  | "free_shipping";

export type ProductStatus = "draft" | "published" | "archived";

export type MediaType = "image" | "video";

export interface MediaItem {
  url: string;
  publicId?: string;
  alt?: string;
  type: MediaType;
  sortOrder?: number;
}

export interface ProductVariantInput {
  name: string;
  sku?: string;
  color?: string;
  colorHex?: string;
  material?: string;
  size?: string;
  price?: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Hotspot {
  x: number;
  y: number;
  productId: string;
  label?: string;
}

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  visible?: boolean;
  children?: NavItem[];
}

export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
  variantLabel?: string;
}
