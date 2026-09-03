import mongoose, { Schema, models, model } from "mongoose";
import type { SeoFields } from "@/types";

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  sortOrder: number;
  isPublished: boolean;
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    image: String,
    parent: { type: Schema.Types.ObjectId, ref: "Category" },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

export interface ICollection {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  image?: string;
  products: mongoose.Types.ObjectId[];
  ruleBased: boolean;
  rules?: {
    field: string;
    operator: string;
    value: string;
  }[];
  sortOrder: number;
  isPublished: boolean;
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    heroImage: String,
    image: String,
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    ruleBased: { type: Boolean, default: false },
    rules: [
      {
        field: String,
        operator: String,
        value: String,
      },
    ],
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
  },
  { timestamps: true }
);

export const Collection =
  models.Collection || model<ICollection>("Collection", CollectionSchema);
