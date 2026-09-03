import mongoose, { Schema, models, model } from "mongoose";

export interface ISizeInquiry {
  _id: mongoose.Types.ObjectId;
  productId: string;       // demo product id (e.g. "p1")
  productSlug: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  desiredSize: string;
  notes?: string;
  status: "pending" | "notified" | "fulfilled";
  notifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SizeInquirySchema = new Schema<ISizeInquiry>(
  {
    productId: { type: String, required: true, index: true },
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    desiredSize: { type: String, required: true },
    notes: String,
    status: {
      type: String,
      enum: ["pending", "notified", "fulfilled"],
      default: "pending",
    },
    notifiedAt: Date,
  },
  { timestamps: true }
);

export const SizeInquiry =
  models.SizeInquiry || model<ISizeInquiry>("SizeInquiry", SizeInquirySchema);
