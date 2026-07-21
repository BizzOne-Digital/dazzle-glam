/** Local gallery assets in /public/images/gallery */

export type GalleryCategory = "product" | "lifestyle" | "editorial";

export type GalleryItem = {
  src: string;
  cat: GalleryCategory;
  caption: string;
  tall?: boolean;
};

function captionFromFile(name: string) {
  return name
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const files = [
  "product-ring-boho-1.png",
  "product-ring-bow-tie-1.png",
  "product-ring-sapphire-1.png",
  "product-ring-cluster-1.png",
  "product-ring-signet-1.png",
  "product-bridal-set-1.png",
  "lifestyle-night-out-1.png",
  "lifestyle-bridal-glow-1.png",
  "lifestyle-everyday-stack-1.png",
  "lifestyle-date-night-1.png",
  "lifestyle-party-ready-1.png",
  "lifestyle-soft-glam-1.png",
  "editorial-campaign-1.png",
  "editorial-campaign-2.png",
  "editorial-flatlay-1.png",
  "editorial-detail-shot-1.png",
] as const;

export const galleryItems: GalleryItem[] = files.map((file, i) => {
  const cat = file.startsWith("product-")
    ? "product"
    : file.startsWith("lifestyle-")
      ? "lifestyle"
      : "editorial";
  const base = file.replace(/\.png$/i, "");
  return {
    src: `/images/gallery/${file}`,
    cat,
    caption: captionFromFile(base),
    tall: cat === "editorial" ? i % 2 === 0 : i % 3 === 0,
  };
});

export const galleryImagePaths = galleryItems.map((g) => g.src);
