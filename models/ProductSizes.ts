import { Schema, models, model } from "mongoose";

export interface IProductSizes {
  productId: string;   // matches DemoProduct.id  (e.g. "p1")
  productSlug: string;
  sizes: string[];
  updatedAt: Date;
}

const ProductSizesSchema = new Schema<IProductSizes>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    productSlug: { type: String, required: true },
    sizes: [String],
  },
  { timestamps: true }
);

export const ProductSizes =
  models.ProductSizes || model<IProductSizes>("ProductSizes", ProductSizesSchema);
