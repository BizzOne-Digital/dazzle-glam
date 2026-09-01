"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { Category } from "@/models/Catalog";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/productSizes";

const NEW_CATALOG_CATEGORIES = [
  { name: CATEGORY_LABELS["for-him"], slug: "for-him", sortOrder: 6 },
  { name: CATEGORY_LABELS["for-pets"], slug: "for-pets", sortOrder: 7 },
] as const;

async function ensureNewCatalogCategories() {
  for (const cat of NEW_CATALOG_CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      {
        $setOnInsert: {
          name: cat.name,
          slug: cat.slug,
          sortOrder: cat.sortOrder,
          isPublished: true,
        },
      },
      { upsert: true }
    );
  }
}

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export type CategoryItemPlain = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isPublished?: boolean;
};

export async function getCategories(): Promise<CategoryItemPlain[]> {
  await requireAdmin();
  await connectDB();
  await ensureNewCatalogCategories();
  const categories = await Category.find()
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return serialize(
    categories.map((category) => ({
      _id: String(category._id),
      name: String(category.name),
      slug: String(category.slug),
      description: category.description
        ? String(category.description)
        : undefined,
      image: category.image ? String(category.image) : undefined,
      sortOrder:
        typeof category.sortOrder === "number" ? category.sortOrder : 0,
      isPublished: category.isPublished !== false,
    }))
  );
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  await requireAdmin();
  await connectDB();

  const slug = (data.slug?.trim() || slugify(data.name)).toLowerCase();
  const parsed = categorySchema.safeParse({
    name: data.name.trim(),
    slug,
    description: data.description?.trim() || undefined,
    image: data.image?.trim() || undefined,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.errors[0]?.message || "Invalid data",
    };
  }

  const existing = await Category.findOne({ slug: parsed.data.slug });
  if (existing) {
    return {
      success: false as const,
      error: "A category with this slug already exists",
    };
  }

  const category = await Category.create(parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true as const, data: serialize(category) };
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    image: string;
    sortOrder: number;
    isPublished: boolean;
  }>
) {
  await requireAdmin();
  await connectDB();

  const existing = await Category.findById(id);
  if (!existing) {
    return { success: false as const, error: "Category not found" };
  }

  const nextSlug =
    data.slug?.trim() ||
    (data.name ? slugify(data.name) : existing.slug);

  const parsed = categorySchema.safeParse({
    name: (data.name ?? existing.name).trim(),
    slug: nextSlug.toLowerCase(),
    description:
      data.description !== undefined
        ? data.description.trim() || undefined
        : existing.description,
    image:
      data.image !== undefined ? data.image.trim() || undefined : existing.image,
    sortOrder: data.sortOrder ?? existing.sortOrder,
    isPublished: data.isPublished ?? existing.isPublished,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.errors[0]?.message || "Invalid data",
    };
  }

  const slugTaken = await Category.findOne({
    slug: parsed.data.slug,
    _id: { $ne: id },
  });
  if (slugTaken) {
    return {
      success: false as const,
      error: "A category with this slug already exists",
    };
  }

  Object.assign(existing, parsed.data);
  await existing.save();
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true as const, data: serialize(existing) };
}
