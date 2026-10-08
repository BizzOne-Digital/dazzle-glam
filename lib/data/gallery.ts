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

const autoItems: GalleryItem[] = files.map((file, i) => {
  const cat: GalleryCategory = file.startsWith("product-")
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

/** Manually added images — gallery-1.png … gallery-7.png */
const newItems: GalleryItem[] = [
  {
    src: "/images/gallery/gallery-1.png",
    cat: "product",
    caption: "Halo Ring",
    tall: false,
  },
  {
    src: "/images/gallery/gallery-2.png",
    cat: "product",
    caption: "Vintage Solitaire",
    tall: true,
  },
  {
    src: "/images/gallery/gallery-3.png",
    cat: "lifestyle",
    caption: "Golden Hour",
    tall: false,
  },
  {
    src: "/images/gallery/gallery-4.png",
    cat: "lifestyle",
    caption: "Bridal Morning",
    tall: true,
  },
  {
    src: "/images/gallery/gallery-5.png",
    cat: "editorial",
    caption: "Campaign III",
    tall: false,
  },
  {
    src: "/images/gallery/gallery-6.png",
    cat: "product",
    caption: "Eternity Band",
    tall: false,
  },
  {
    src: "/images/gallery/gallery-7.png",
    cat: "editorial",
    caption: "Lookbook",
    tall: true,
  },
  {
    src: "/images/gallery/gallery-8.png",
    cat: "lifestyle",
    caption: "Statement Look",
    tall: false,
  },
];

export const galleryItems: GalleryItem[] = [...autoItems, ...newItems];

export const galleryImagePaths = galleryItems.map((g) => g.src);
