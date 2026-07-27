import type { DemoProduct } from "@/lib/data/demo";

export type MongoProductLike = {
  _id: { toString(): string } | string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  stock: number;
  materials?: string[];
  colors?: string[];
  sizes?: string[];
  media?: Array<{ url: string; sortOrder?: number }>;
  careInstructions?: string;
  dimensions?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isComingSoon?: boolean;
  status?: string;
};

export function mapMongoProduct(p: MongoProductLike): DemoProduct {
  const images = [...(p.media || [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => m.url)
    .filter(Boolean);

  return {
    id: typeof p._id === "string" ? p._id : p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription || p.description.slice(0, 120),
    price: p.price,
    stock: p.stock,
    category: "rings",
    materials: p.materials || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    images: images.length ? images.slice(0, 3) : ["/images/products/placeholder.png"],
    isFeatured: !!p.isFeatured,
    isBestSeller: !!p.isBestSeller,
    isNewArrival: !!p.isNewArrival,
    isComingSoon: !!p.isComingSoon,
    badge: p.isComingSoon
      ? "coming soon"
      : p.isBestSeller
        ? "bestseller"
        : p.isNewArrival
          ? "new"
          : undefined,
    careInstructions: p.careInstructions || "Wipe with a soft cloth after wear.",
    dimensions: p.dimensions,
  };
}

export function toCardFromMongo(p: MongoProductLike) {
  const mapped = mapMongoProduct(p);
  const comingSoon = !!mapped.isComingSoon;
  return {
    id: mapped.id,
    name: mapped.name,
    slug: mapped.slug,
    price: mapped.price,
    image: mapped.images[0],
    hoverImage: mapped.images[1],
    badge: mapped.badge,
    isComingSoon: comingSoon,
    inStock: mapped.stock > 0 && !comingSoon,
  };
}
