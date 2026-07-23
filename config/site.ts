export const brand = {
  name: "Dazzle Glam Jewelry Collection",
  shortName: "Dazzle Glam",
  tagline: "Bold Jewelry. Unforgettable Energy.",
  phone: "(416) 305-7500",
  email: "dazzleglamcollection@gmail.com",
  website: "https://dazzleglamjewelry.ca",
  instagram: "@dazzleglamcollection",
  instagramUrl: "https://www.instagram.com/dazzleglamcollection?igsh=MWNnaXJwM2M3Ymk1dA==",
  facebook: "@dazzleglamcollection",
  facebookUrl: "https://www.facebook.com/profile.php?id=61591817804914",
  clientName: "Karleen",
} as const;

export const colors = {
  black: "#000000",
  charcoal: "#0a0a0a",
  graphite: "#1a1a1a",
  silver: "#c0c0c0",
  silverLight: "#e8e8e8",
  white: "#ffffff",
  fuchsia: "#FF1493",
  fuchsiaDeep: "#C71585",
  fuchsiaGlow: "#FF69B4",
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export const announcementDefaults = [
  "Summer special! - 10% on all orders over $65.00",
  "Free shipping on orders over $100",
  "New statement pieces just dropped",
  "Secure checkout & easy returns",
] as const;

export const marqueeWords = [
  "BOLD",
  "GLAMOROUS",
  "FEARLESS",
  "ICONIC",
  "UNFORGETTABLE",
  "DAZZLE DIFFERENTLY",
] as const;

/** Curated Unsplash jewelry placeholders — replace via admin media library */
export const placeholderImages = {
  hero: [
    "/images/hero/campaign.png",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80",
  ],
  rings: [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80",
    "https://images.unsplash.com/photo-1608042314453-ae338d95c230?w=800&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  ],
  earrings: [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80",
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80",
    "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80",
    "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&q=80",
  ],
  necklaces: [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&q=80",
  ],
  bracelets: [
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80",
  ],
  gallery: [
    "/images/gallery/product-ring-boho-1.png",
    "/images/gallery/product-ring-bow-tie-1.png",
    "/images/gallery/product-ring-sapphire-1.png",
    "/images/gallery/product-ring-cluster-1.png",
    "/images/gallery/product-ring-signet-1.png",
    "/images/gallery/product-bridal-set-1.png",
    "/images/gallery/lifestyle-night-out-1.png",
    "/images/gallery/lifestyle-bridal-glow-1.png",
  ],
  lifestyle: [
    "/images/gallery/lifestyle-night-out-1.png",
    "/images/gallery/lifestyle-bridal-glow-1.png",
    "/images/gallery/lifestyle-everyday-stack-1.png",
    "/images/gallery/lifestyle-date-night-1.png",
  ],
  editorial: [
    "/images/gallery/editorial-campaign-1.png",
    "/images/gallery/editorial-campaign-2.png",
    "/images/gallery/editorial-flatlay-1.png",
    "/images/gallery/editorial-detail-shot-1.png",
  ],
} as const;
