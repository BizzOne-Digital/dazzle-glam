import { Schema, models, model } from "mongoose";

export interface IProductSizes {
  productId: string;
  productSlug: string;
  /** Sizes shown as available on the storefront (when no width variants) */
  sizes: string[];
  /**
   * Per band-width ring sizes, e.g. { "4mm": ["5","6"], "6mm": ["7","8"] }
   */
  widthSizes: Record<string, string[]>;
  /**
   * Admin-only inventory notes per size (never sent to the storefront).
   * e.g. { "5": 3, "6": 0, "7": 3 }
   */
  sizeStock: Record<string, number>;
  /**
   * Admin-only inventory notes per width + size.
   * e.g. { "4mm": { "5": 3 }, "6mm": { "7": 1 } }
   */
  widthSizeStock: Record<string, Record<string, number>>;
  updatedAt: Date;
}

const ProductSizesSchema = new Schema<IProductSizes>(
  {
    productId: { type: String, required: true, unique: true, index: true },
    productSlug: { type: String, required: true },
    sizes: [String],
    widthSizes: {
      type: Map,
      of: [String],
      default: {},
    },
    sizeStock: {
      type: Map,
      of: Number,
      default: {},
    },
    widthSizeStock: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const ProductSizes =
  models.ProductSizes || model<IProductSizes>("ProductSizes", ProductSizesSchema);
