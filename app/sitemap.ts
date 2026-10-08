import type { MetadataRoute } from "next";
import { demoProducts } from "@/lib/data/demo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/gallery",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/shipping",
    "/returns",
    "/accessibility",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const products = demoProducts.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...products];
}
