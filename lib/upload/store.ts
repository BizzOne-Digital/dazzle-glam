import { randomBytes } from "crypto";
import { connectDB } from "@/lib/db/connect";
import {
  StoredUpload,
  type UploadFolder,
} from "@/models/Upload";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extFor(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * Store uploads in MongoDB under logical folders
 * (gallery | products | pages | misc). Works on Vercel
 * where the filesystem is read-only.
 */
export async function saveFolderUpload(
  file: File,
  folder: UploadFolder = "misc"
): Promise<{ url: string; filename: string; size: number; folder: UploadFolder }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8MB");
  }

  await connectDB();

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${extFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await StoredUpload.create({
    folder,
    filename,
    mimeType: file.type,
    size: buffer.length,
    data: buffer,
  });

  return {
    url: `/api/uploads/${folder}/${filename}`,
    filename,
    size: buffer.length,
    folder,
  };
}

export async function getFolderUpload(folder: string, filename: string) {
  await connectDB();
  return StoredUpload.findOne({ folder, filename }).lean();
}

export async function deleteFolderUpload(url?: string | null) {
  if (!url?.startsWith("/api/uploads/")) return;
  const parts = url.replace(/^\/api\/uploads\//, "").split("/");
  if (parts.length !== 2) return;
  const [folder, filename] = parts;
  await connectDB();
  await StoredUpload.deleteOne({ folder, filename });
}
