"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { Product } from "@/models/Product";
import { deleteLocalUpload } from "@/lib/upload/local";
import { mapMongoProduct, type MongoProductLike } from "@/lib/products/map";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function updateProductAdmin(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    stock?: number;
    images?: string[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    status?: "draft" | "published" | "archived";
    careInstructions?: string;
  }
) {
  await requireAdmin();
  await connectDB();

  const product = await Product.findById(id);
  if (!product) return { success: false, error: "Product not found" };

  if (data.name !== undefined) product.name = data.name;
  if (data.slug !== undefined) product.slug = slugify(data.slug) || product.slug;
  if (data.description !== undefined) product.description = data.description;
  if (data.shortDescription !== undefined) {
    product.shortDescription = data.shortDescription;
  }
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.stock !== undefined) product.stock = Number(data.stock);
  if (data.careInstructions !== undefined) {
    product.careInstructions = data.careInstructions;
  }
  if (data.isFeatured !== undefined) product.isFeatured = data.isFeatured;
  if (data.isBestSeller !== undefined) product.isBestSeller = data.isBestSeller;
  if (data.isNewArrival !== undefined) product.isNewArrival = data.isNewArrival;
  if (data.status !== undefined) product.status = data.status;

  if (data.images) {
    const images = data.images.filter(Boolean).slice(0, 3);
    if (images.length < 1) {
      return { success: false, error: "At least 1 image is required" };
    }
    const prev = (product.media || []).map((m: { url: string }) => m.url);
    for (const url of prev) {
      if (!images.includes(url)) await deleteLocalUpload(url);
    }
    product.media = images.map((url, i) => ({
      url,
      alt: product.name,
      type: "image" as const,
      sortOrder: i,
    }));
  }

  await product.save();
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);

  return {
    success: true,
    data: mapMongoProduct(product.toObject() as unknown as MongoProductLike),
  };
}

export async function deleteProductAdmin(id: string) {
  await requireAdmin();
  await connectDB();
  const product = await Product.findById(id);
  if (!product) return { success: false, error: "Product not found" };

  for (const m of product.media || []) {
    await deleteLocalUpload(m.url);
  }
  await product.deleteOne();
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function createProductAdmin(data: {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock?: number;
  images: string[];
}) {
  await requireAdmin();
  await connectDB();
  const images = (data.images || []).filter(Boolean).slice(0, 3);
  if (images.length < 1) {
    return { success: false, error: "At least 1 image is required" };
  }

  const slug = slugify(data.slug || data.name);
  const exists = await Product.findOne({ slug });
  if (exists) return { success: false, error: "Slug already exists" };

  const product = await Product.create({
    name: data.name,
    slug,
    description: data.description,
    shortDescription: data.description.slice(0, 120),
    price: Number(data.price),
    stock: Number(data.stock ?? 0),
    status: "published",
    publishedAt: new Date(),
    media: images.map((url, i) => ({
      url,
      alt: data.name,
      type: "image",
      sortOrder: i,
    })),
    materials: [],
    colors: [],
    sizes: [],
    careInstructions: "Wipe with a soft cloth after wear.",
  });

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");
  return {
    success: true,
    data: mapMongoProduct(
      (product.toObject ? product.toObject() : product) as unknown as MongoProductLike
    ),
  };
}
