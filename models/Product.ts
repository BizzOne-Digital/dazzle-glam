import mongoose, { Schema, models, model } from "mongoose";
import type { MediaItem, ProductStatus, SeoFields } from "@/types";

export interface IProductVariant {
  _id: mongoose.Types.ObjectId;
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

export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  lowStockLimit: number;
  status: ProductStatus;
  media: MediaItem[];
  variants: IProductVariant[];
  materials: string[];
  colors: string[];
  sizes: string[];
  dimensions?: string;
  weight?: string;
  careInstructions?: string;
  shippingDetails?: string;
  categories: mongoose.Types.ObjectId[];
  collections: mongoose.Types.ObjectId[];
  tags: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  relatedProducts: mongoose.Types.ObjectId[];
  seo: SeoFields;
  publishedAt?: Date;
  scheduledAt?: Date;
  salesCount: number;
  averageRating: number;
  reviewCount: number;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    type: { type: String, enum: ["image", "video"], default: "image" },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    name: { type: String, required: true },
    sku: String,
    color: String,
    colorHex: String,
    material: String,
    size: String,
    price: Number,
    compareAtPrice: Number,
    stock: { type: Number, default: 0 },
    image: String,
  },
  { _id: true }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, index: true },
    barcode: String,
    description: { type: String, required: true },
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: Number,
    cost: Number,
    stock: { type: Number, default: 0 },
    lowStockLimit: { type: Number, default: 5 },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    media: [MediaSchema],
    variants: [VariantSchema],
    materials: [String],
    colors: [String],
    sizes: [String],
    dimensions: String,
    weight: String,
    careInstructions: String,
    shippingDetails: String,
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      noIndex: Boolean,
    },
    publishedAt: Date,
    scheduledAt: Date,
    salesCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    archivedAt: Date,
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ price: 1, status: 1 });
ProductSchema.index({ isFeatured: 1, isBestSeller: 1, isNewArrival: 1 });

export const Product =
  models.Product || model<IProduct>("Product", ProductSchema);
