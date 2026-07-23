import mongoose, { Schema, models, model } from "mongoose";
import type { Hotspot, MediaType, NavItem, SeoFields } from "@/types";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    name: { type: String, required: true },
    email: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    comment: { type: String, required: true },
    images: [String],
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    adminResponse: String,
  },
  { timestamps: true }
);

export const Review = models.Review || model<IReview>("Review", ReviewSchema);

export interface ITestimonial {
  _id: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  rating: number;
  review: string;
  productName?: string;
  product?: mongoose.Types.ObjectId;
  isVerified: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    image: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    review: { type: String, required: true },
    productName: String,
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    isVerified: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial =
  models.Testimonial || model<ITestimonial>("Testimonial", TestimonialSchema);

export interface IGalleryItem {
  _id: mongoose.Types.ObjectId;
  title?: string;
  caption?: string;
  image: string;
  videoUrl?: string;
  category?: string;
  productTags: mongoose.Types.ObjectId[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    title: String,
    caption: String,
    image: { type: String, required: true },
    videoUrl: String,
    category: String,
    productTags: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GalleryItem =
  models.GalleryItem || model<IGalleryItem>("GalleryItem", GalleryItemSchema);

export interface IService {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  icon?: string;
  features: string[];
  priceLabel?: string;
  isPublished: boolean;
  sortOrder: number;
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    image: String,
    icon: String,
    features: [String],
    priceLabel: String,
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

export const Service =
  models.Service || model<IService>("Service", ServiceSchema);

export interface IContactSubmission {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  inquiryType?: string;
  orderNumber?: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    inquiryType: { type: String, default: "general" },
    orderNumber: String,
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactSubmission =
  models.ContactSubmission ||
  model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);

export interface INewsletterSubscriber {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  isActive: boolean;
  consentedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    consentedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const NewsletterSubscriber =
  models.NewsletterSubscriber ||
  model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);

export interface ILook {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  image: string;
  hotspots: Hotspot[];
  products: mongoose.Types.ObjectId[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const LookSchema = new Schema<ILook>(
  {
    title: { type: String, required: true },
    description: String,
    image: { type: String, required: true },
    hotspots: [
      {
        x: Number,
        y: Number,
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        label: String,
      },
    ],
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Look = models.Look || model<ILook>("Look", LookSchema);

export interface IMediaAsset {
  _id: mongoose.Types.ObjectId;
  url: string;
  publicId?: string;
  filename: string;
  alt?: string;
  type: MediaType;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  folder?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    url: { type: String, required: true },
    publicId: String,
    filename: { type: String, required: true },
    alt: String,
    type: { type: String, enum: ["image", "video"], default: "image" },
    mimeType: String,
    size: Number,
    width: Number,
    height: Number,
    folder: String,
  },
  { timestamps: true }
);

MediaAssetSchema.index({ filename: "text", alt: "text" });

export const MediaAsset =
  models.MediaAsset || model<IMediaAsset>("MediaAsset", MediaAssetSchema);

export interface IPageContent {
  _id: mongoose.Types.ObjectId;
  key: string;
  title?: string;
  content: Record<string, unknown>;
  seo: SeoFields;
  isPublished: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const PageContentSchema = new Schema<IPageContent>(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: String,
    content: { type: Schema.Types.Mixed, default: {} },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      noIndex: Boolean,
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PageContent =
  models.PageContent || model<IPageContent>("PageContent", PageContentSchema);

export interface INavigationMenu {
  _id: mongoose.Types.ObjectId;
  location: "header" | "footer" | "mobile";
  items: NavItem[];
  updatedAt: Date;
  createdAt: Date;
}

const NavItemSchema = new Schema(
  {
    label: String,
    href: String,
    external: Boolean,
    visible: { type: Boolean, default: true },
    children: [
      {
        label: String,
        href: String,
        external: Boolean,
        visible: { type: Boolean, default: true },
      },
    ],
  },
  { _id: false }
);

const NavigationMenuSchema = new Schema<INavigationMenu>(
  {
    location: {
      type: String,
      enum: ["header", "footer", "mobile"],
      required: true,
      unique: true,
    },
    items: [NavItemSchema],
  },
  { timestamps: true }
);

export const NavigationMenu =
  models.NavigationMenu ||
  model<INavigationMenu>("NavigationMenu", NavigationMenuSchema);
