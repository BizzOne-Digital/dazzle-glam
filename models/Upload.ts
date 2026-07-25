import mongoose, { Schema, models, model } from "mongoose";

export type UploadFolder = "gallery" | "products" | "pages" | "misc";

export interface IStoredUpload {
  _id: mongoose.Types.ObjectId;
  folder: UploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const StoredUploadSchema = new Schema<IStoredUpload>(
  {
    folder: {
      type: String,
      enum: ["gallery", "products", "pages", "misc"],
      required: true,
      index: true,
    },
    filename: { type: String, required: true, index: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });

export const StoredUpload =
  models.StoredUpload ||
  model<IStoredUpload>("StoredUpload", StoredUploadSchema);
