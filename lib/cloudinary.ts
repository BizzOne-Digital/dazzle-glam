import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

export interface UploadImageResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary(): boolean {
  if (!isConfigured()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
}

export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    filename?: string;
    mimeType?: string;
  }
): Promise<UploadImageResult | null> {
  try {
    return await uploadImageOrThrow(file, options);
  } catch (error) {
    console.error("[cloudinary] uploadImage failed", error);
    return null;
  }
}

export async function uploadImageOrThrow(
  file: string | Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    filename?: string;
    mimeType?: string;
  }
): Promise<UploadImageResult> {
  if (!configureCloudinary()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel env vars."
    );
  }

  const payload =
    typeof file === "string"
      ? file
      : `data:${options?.mimeType || "image/jpeg"};base64,${file.toString("base64")}`;

  const result: UploadApiResponse = await cloudinary.uploader.upload(payload, {
    folder: options?.folder ?? "dazzle-glam",
    public_id: options?.publicId,
    resource_type: "image",
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function uploadFileToCloudinary(
  file: File,
  folder: string
): Promise<UploadImageResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadImageOrThrow(buffer, {
    folder: `dazzle-glam/${folder}`,
    mimeType: file.type || "image/jpeg",
  });
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  if (!configureCloudinary()) {
    console.warn(
      "[cloudinary] Credentials missing — deleteImage skipped gracefully"
    );
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("[cloudinary] deleteImage failed", error);
    return false;
  }
}

export function cloudinaryConfigured(): boolean {
  return isConfigured();
}
