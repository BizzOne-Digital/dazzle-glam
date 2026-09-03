"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { GalleryItem } from "@/models/Content";
import { deleteLocalUpload } from "@/lib/upload/local";
import { galleryItems as staticGallery } from "@/lib/data/gallery";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getGalleryItems(publishedOnly = true) {
  try {
    await connectDB();
    const filter = publishedOnly ? { isPublished: true } : {};
    const items = await GalleryItem.find(filter).sort({ sortOrder: 1, createdAt: -1 }).lean();

    // Prefer full static catalog when DB is empty or incomplete (e.g. only 8 of 24 seeded)
    if (publishedOnly && items.length < staticGallery.length) {
      return staticGallery.map((g, i) => ({
        _id: `static-${i}`,
        title: g.caption,
        caption: g.caption,
        image: g.src,
        category: g.cat,
        tall: !!g.tall,
        sortOrder: i,
        isPublished: true,
      }));
    }

    return serialize(items);
  } catch (error) {
    console.error("getGalleryItems:", error);
    return staticGallery.map((g, i) => ({
      _id: `static-${i}`,
      title: g.caption,
      caption: g.caption,
      image: g.src,
      category: g.cat,
      tall: !!g.tall,
      sortOrder: i,
      isPublished: true,
    }));
  }
}

export async function createGalleryItem(data: {
  title?: string;
  caption?: string;
  image: string;
  category?: string;
  tall?: boolean;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  await requireAdmin();
  await connectDB();
  const item = await GalleryItem.create({
    title: data.title || data.caption || "Gallery image",
    caption: data.caption || data.title || "",
    image: data.image,
    category: data.category || "product",
    tall: !!data.tall,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
  });
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true, data: serialize(item) };
}

export async function updateGalleryItem(
  id: string,
  data: Partial<{
    title: string;
    caption: string;
    image: string;
    category: string;
    tall: boolean;
    sortOrder: number;
    isPublished: boolean;
  }>
) {
  await requireAdmin();
  await connectDB();
  const existing = await GalleryItem.findById(id);
  if (!existing) return { success: false, error: "Not found" };

  if (data.image && data.image !== existing.image) {
    await deleteLocalUpload(existing.image);
  }

  Object.assign(existing, data);
  await existing.save();
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true, data: serialize(existing) };
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  await connectDB();
  const existing = await GalleryItem.findByIdAndDelete(id);
  if (existing?.image) await deleteLocalUpload(existing.image);
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function seedGalleryFromStatic() {
  await requireAdmin();
  await connectDB();
  const count = await GalleryItem.countDocuments();

  // Replace incomplete seeds so all static images appear in admin + storefront
  if (count > 0 && count < staticGallery.length) {
    await GalleryItem.deleteMany({});
  } else if (count >= staticGallery.length) {
    return { success: true, message: `Gallery already has ${count} items` };
  }

  await GalleryItem.insertMany(
    staticGallery.map((g, i) => ({
      title: g.caption,
      caption: g.caption,
      image: g.src,
      category: g.cat,
      tall: !!g.tall,
      sortOrder: i,
      isPublished: true,
    }))
  );
  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/gallery");
  return { success: true, message: `Seeded ${staticGallery.length} gallery items` };
}
