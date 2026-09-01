import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function saveLocalUpload(
  file: File,
  folder: "gallery" | "products" | "pages" | "misc" | "categories" = "misc"
): Promise<{ url: string; filename: string; size: number }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, or GIF images are allowed");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8MB");
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const fullPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  return {
    url: `/uploads/${folder}/${filename}`,
    filename,
    size: buffer.length,
  };
}

export async function deleteLocalUpload(url?: string | null) {
  if (!url || !url.startsWith("/uploads/")) return;
  const relative = url.replace(/^\//, "");
  const fullPath = path.join(process.cwd(), "public", relative);
  try {
    await unlink(fullPath);
  } catch {
    // ignore missing files
  }
}
