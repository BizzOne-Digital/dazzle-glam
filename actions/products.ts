"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { getSession, requireAdmin } from "@/lib/auth/session";
import { Product } from "@/models/Product";
import { deleteLocalUpload } from "@/lib/upload/local";
import { mapMongoProduct, type MongoProductLike } from "@/lib/products/map";
import { MAX_PRODUCT_IMAGES } from "@/config/site";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function assertAdminAction() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session.user;
}

function revalidateProductPaths(id: string, slug: string) {
  try {
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
  } catch (err) {
    console.error("revalidatePath failed:", err);
  }
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
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isComingSoon?: boolean;
    isOnSale?: boolean;
    compareAtPrice?: number;
    sku?: string;
    supplier?: string;
    category?: string;
    colors?: string[];
    materials?: string[];
    sizeOptions?: string[];
    widthVariants?: Array<{ width: string; image?: string }>;
    status?: "draft" | "published" | "archived";
    careInstructions?: string;
  }
) {
  try {
    const admin = await assertAdminAction();
    if (!admin) return { success: false, error: "Unauthorized" };

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
    if (data.sku !== undefined) product.sku = data.sku.trim() || undefined;
    if (data.supplier !== undefined) {
      product.supplier = data.supplier.trim() || undefined;
    }
    if (data.category !== undefined) {
      const cat = data.category.trim().toLowerCase();
      if (
        ["rings", "bracelets", "earrings", "necklaces", "accessories"].includes(
          cat
        )
      ) {
        product.category = cat;
      }
    }
    if (data.colors !== undefined) {
      product.colors = data.colors
        .map((c) => c.trim())
        .filter(Boolean);
    }
    if (data.materials !== undefined) {
      product.materials = data.materials
        .map((m) => m.trim())
        .filter(Boolean);
    }
    if (data.sizeOptions !== undefined) {
      product.sizeOptions = data.sizeOptions
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (data.widthVariants !== undefined) {
      product.widthVariants = data.widthVariants
        .filter((w) => w.width?.trim())
        .map((w) => ({
          width: w.width.trim(),
          image: w.image?.trim() || undefined,
        }));
    }
    if (data.compareAtPrice !== undefined) {
      product.compareAtPrice = Number(data.compareAtPrice) || undefined;
    }
    if (data.isOnSale !== undefined) {
      product.isOnSale = !!data.isOnSale;
    }
    if (product.isOnSale && (product.compareAtPrice || 0) <= product.price) {
      product.isOnSale = false;
      product.compareAtPrice = undefined;
    }
    if (data.careInstructions !== undefined) {
      product.careInstructions = data.careInstructions;
    }
    if (
      data.isBestSeller !== undefined ||
      data.isNewArrival !== undefined ||
      data.isComingSoon !== undefined
    ) {
      // Enforce single flag
      const comingSoon = !!data.isComingSoon;
      const bestSeller = !comingSoon && !!data.isBestSeller;
      const newArrival = !comingSoon && !bestSeller && !!data.isNewArrival;
      product.isComingSoon = comingSoon;
      product.isBestSeller = bestSeller;
      product.isNewArrival = newArrival;
    }
    if (data.status !== undefined) product.status = data.status;

    if (data.images) {
      const images = data.images.filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
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

    // Ensure flag fields persist even if an older in-memory schema missed them
    await Product.collection.updateOne(
      { _id: product._id },
      {
        $set: {
          isComingSoon: !!product.isComingSoon,
          isBestSeller: !!product.isBestSeller,
          isNewArrival: !!product.isNewArrival,
          isOnSale: !!product.isOnSale,
          compareAtPrice: product.compareAtPrice || null,
          sku: product.sku || null,
          supplier: product.supplier || null,
          category: product.category || "rings",
          colors: product.colors || [],
          materials: product.materials || [],
          sizeOptions: product.sizeOptions || [],
        },
      }
    );

    const fresh = await Product.findById(id).lean();
    revalidateProductPaths(id, product.slug);

    return {
      success: true,
      data: mapMongoProduct(
        (fresh || product.toObject()) as unknown as MongoProductLike
      ),
    };
  } catch (err) {
    console.error("updateProductAdmin failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Update failed",
    };
  }
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

/** Duplicate a product with media, flags, sizes availability, and size stock */
export async function duplicateProductAdmin(id: string) {
  await requireAdmin();
  await connectDB();

  const source = await Product.findById(id).lean();
  if (!source) return { success: false, error: "Product not found" };

  const baseName = `${source.name} (Copy)`;
  const baseSlug = slugify(`${source.slug}-copy`);
  let candidate = baseSlug;
  let n = 2;
  while (await Product.exists({ slug: candidate })) {
    candidate = `${baseSlug}-${n}`;
    n += 1;
  }

  const src = source as Record<string, unknown>;
  const media = Array.isArray(src.media)
    ? (src.media as Array<Record<string, unknown>>).map((m, i) => ({
        url: String(m.url || ""),
        publicId: m.publicId,
        alt: String(m.alt || baseName),
        type: (m.type as "image" | "video") || "image",
        sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : i,
      }))
    : [];

  const variants = Array.isArray(src.variants)
    ? (src.variants as Array<Record<string, unknown>>).map((v) => ({
        name: String(v.name || "Variant"),
        sku: v.sku,
        color: v.color,
        colorHex: v.colorHex,
        material: v.material,
        size: v.size,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stock: Number(v.stock ?? 0),
        image: v.image,
      }))
    : [];

  const created = await Product.create({
    name: baseName,
    slug: candidate,
    sku: src.sku ? `${String(src.sku)}-COPY` : undefined,
    supplier: typeof src.supplier === "string" ? src.supplier : undefined,
    barcode: src.barcode,
    description: source.description,
    shortDescription: source.shortDescription,
    price: source.price,
    compareAtPrice: source.compareAtPrice,
    cost: src.cost,
    stock: source.stock,
    lowStockLimit: source.lowStockLimit ?? 5,
    status: source.status || "published",
    media,
    variants,
    category:
      typeof src.category === "string" &&
      ["rings", "bracelets", "earrings", "necklaces", "accessories"].includes(
        src.category
      )
        ? src.category
        : "rings",
    materials: source.materials || [],
    colors: source.colors || [],
    sizeOptions: (src.sizeOptions as string[]) || [],
    sizes: source.sizes || [],
    dimensions: source.dimensions,
    weight: src.weight,
    careInstructions: source.careInstructions,
    shippingDetails: src.shippingDetails,
    categories: source.categories || [],
    collections: source.collections || [],
    tags: source.tags || [],
    isFeatured: false,
    isBestSeller: !!source.isBestSeller,
    isNewArrival: !!source.isNewArrival,
    isComingSoon: !!(source as { isComingSoon?: boolean }).isComingSoon,
    isOnSale: !!source.isOnSale,
    relatedProducts: [],
    seo: source.seo || {},
    publishedAt: source.status === "published" ? new Date() : undefined,
    salesCount: 0,
    averageRating: 0,
    reviewCount: 0,
  });

  // Copy available sizes + admin size stock notes
  const { ProductSizes } = await import("@/models/ProductSizes");
  const sizeDoc = (await ProductSizes.findOne({
    $or: [{ productId: id }, { productSlug: source.slug }],
  }).lean()) as {
    sizes?: string[];
    sizeStock?: Map<string, number> | Record<string, number>;
  } | null;

  if (sizeDoc) {
    const sizeStockRaw =
      sizeDoc.sizeStock instanceof Map
        ? Object.fromEntries(sizeDoc.sizeStock.entries())
        : { ...(sizeDoc.sizeStock || {}) };

    await ProductSizes.findOneAndUpdate(
      { productId: String(created._id) },
      {
        $set: {
          productId: String(created._id),
          productSlug: candidate,
          sizes: sizeDoc.sizes || [],
          sizeStock: sizeStockRaw,
        },
      },
      { upsert: true, new: true }
    );
  }

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/products");

  return {
    success: true,
    data: mapMongoProduct(
      (created.toObject ? created.toObject() : created) as unknown as MongoProductLike
    ),
  };
}

export async function createProductAdmin(data: {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock?: number;
  images: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isComingSoon?: boolean;
  isOnSale?: boolean;
  compareAtPrice?: number;
  sku?: string;
  supplier?: string;
  category?: string;
  colors?: string[];
  materials?: string[];
  sizeOptions?: string[];
  widthVariants?: Array<{ width: string; image?: string }>;
}) {
  try {
    const admin = await assertAdminAction();
    if (!admin) return { success: false, error: "Unauthorized" };

    await connectDB();
    const images = (data.images || []).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
    if (images.length < 1) {
      return { success: false, error: "At least 1 image is required" };
    }

    const slug = slugify(data.slug || data.name);
    const exists = await Product.findOne({ slug });
    if (exists) return { success: false, error: "Slug already exists" };

    const saleActive =
      !!data.isOnSale && Number(data.compareAtPrice || 0) > Number(data.price);

    const category =
      data.category &&
      ["rings", "bracelets", "earrings", "necklaces", "accessories"].includes(
        data.category
      )
        ? data.category
        : "rings";
    const colors = (data.colors || []).map((c) => c.trim()).filter(Boolean);
    const materials = (data.materials || [])
      .map((m) => m.trim())
      .filter(Boolean);
    const sizeOptions = (data.sizeOptions || [])
      .map((s) => s.trim())
      .filter(Boolean);
    const widthVariants = (data.widthVariants || [])
      .filter((w) => w.width?.trim())
      .map((w) => ({
        width: w.width.trim(),
        image: w.image?.trim() || undefined,
      }));

    const product = await Product.create({
      name: data.name,
      slug,
      sku: data.sku?.trim() || undefined,
      supplier: data.supplier?.trim() || undefined,
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
      category,
      materials,
      colors,
      sizeOptions,
      widthVariants,
      sizes: [],
      careInstructions: "Wipe with a soft cloth after wear.",
      isComingSoon: !!data.isComingSoon,
      isBestSeller: !data.isComingSoon && !!data.isBestSeller,
      isNewArrival: !data.isComingSoon && !data.isBestSeller && !!data.isNewArrival,
      isOnSale: saleActive,
      compareAtPrice: saleActive ? Number(data.compareAtPrice) : undefined,
      isFeatured: false,
    });

    await Product.collection.updateOne(
      { _id: product._id },
      {
        $set: {
          isComingSoon: !!product.isComingSoon,
          isBestSeller: !!product.isBestSeller,
          isNewArrival: !!product.isNewArrival,
          isOnSale: !!product.isOnSale,
          compareAtPrice: product.compareAtPrice || null,
          sku: product.sku || null,
          supplier: product.supplier || null,
          category,
          colors,
          materials,
          sizeOptions,
          widthVariants,
        },
      }
    );

    const fresh = await Product.findById(product._id).lean();
    revalidateProductPaths(String(product._id), slug);
    return {
      success: true,
      data: mapMongoProduct(
        (fresh ||
          (product.toObject ? product.toObject() : product)) as unknown as MongoProductLike
      ),
    };
  } catch (err) {
    console.error("createProductAdmin failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Create failed",
    };
  }
}
