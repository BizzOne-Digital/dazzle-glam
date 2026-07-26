import { Schema, models, model } from "mongoose";

export interface IProductSizes {
  productId: string;
  productSlug: string;
  /** Sizes shown as available on the storefront */
  sizes: string[];
  /**
   * Admin-only inventory notes per size (never sent to the storefront).
   * e.g. { "5": 3, "6": 0, "7": 3 }
   */
  sizeStock: Record<string, number>;
  updatedAt: Date;
}

const ProductSizesSchema = new Schema<IProductSizes>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    productSlug: { type: String, required: true },
    sizes: [String],
    sizeStock: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

export const ProductSizes =
  models.ProductSizes || model<IProductSizes>("ProductSizes", ProductSizesSchema);
