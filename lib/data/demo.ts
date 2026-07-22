import { placeholderImages } from "@/config/site";

export interface DemoProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  stock: number;
  category: string;
  materials: string[];
  colors: string[];
  /** Available ring sizes. Empty array = no sizes set yet (triggers inquiry flow) */
  sizes: string[];
  images: string[];
  badge?: "new" | "bestseller";
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  careInstructions: string;
  dimensions?: string;
}

/** Local product photos in /public/images/products — basename without -1/-2/-3/-4 */
function productImgs(base: string): string[] {
  return [
    `/images/products/${base}-1.png`,
    `/images/products/${base}-2.png`,
    `/images/products/${base}-3.png`,
    `/images/products/${base}-4.png`,
  ];
}

const DEFAULT_SIZES: string[] = []; // Client will set sizes from admin panel

/** Exact catalogue from client product sheet — 18 rings only */
export const demoProducts: DemoProduct[] = [
  {
    id: "p1",
    name: "Beautiful Stunning Women's White and Rose Gold Boho Style Engagement Ring",
    slug: "white-rose-gold-boho-engagement-ring",
    description:
      "A romantic boho engagement ring blending white and rose gold tones with dazzling sparkle.",
    shortDescription: "White & rose gold boho engagement ring",
    price: 65,
    stock: 24,
    category: "rings",
    materials: ["Rose Gold Tone", "White Tone", "Cubic Zirconia"],
    colors: ["Rose Gold", "White"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-White-and-Rose"),
    isNewArrival: true,
    badge: "new",
    careInstructions: "Avoid water and chemicals. Store in a soft pouch.",
  },
  {
    id: "p2",
    name: "Beautiful Women's Bow-Tie Style Square Engagement Ring",
    slug: "bow-tie-square-engagement-ring",
    description:
      "A refined square-cut ring with a bow-tie silhouette — bold geometry meets feminine glam.",
    shortDescription: "Bow-tie square engagement ring",
    price: 39.99,
    stock: 30,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Beautiful-Womens-Bow-Tie"),
    isNewArrival: true,
    careInstructions: "Wipe with a soft cloth after wear.",
  },
  {
    id: "p3",
    name: "Brilliant Women's Sapphire Birthstone Birthday and Promise Ring",
    slug: "sapphire-birthstone-promise-ring",
    description:
      "An oval sapphire-inspired center stone framed by a luminous halo — perfect for birthdays and promises.",
    shortDescription: "Sapphire birthstone promise ring",
    price: 65,
    stock: 18,
    category: "rings",
    materials: ["Silver Tone", "Sapphire CZ"],
    colors: ["Blue", "Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Brilliant-Womens-Sapphire"),
    isFeatured: true,
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Keep dry. Polish gently with jewelry cloth.",
  },
  {
    id: "p4",
    name: "Exquisite Princess Cut Women's Engagement Ring",
    slug: "princess-cut-engagement-ring",
    description:
      "Classic princess-cut brilliance on a sleek band for timeless glam.",
    shortDescription: "Princess cut engagement ring",
    price: 65,
    stock: 22,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Exquisite-Princess"),
    careInstructions: "Remove before swimming or showering.",
  },
  {
    id: "p5",
    name: "Exquisite White Cluster Zirconia Round Women's Engagement Ring",
    slug: "white-cluster-zirconia-round-ring",
    description:
      "A show-stopping round cluster of white zirconia that catches light from every angle.",
    shortDescription: "White cluster round engagement ring",
    price: 65,
    stock: 15,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["White", "Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Exquisite-White-Cluster"),
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Store separately to avoid scratching.",
  },
  {
    id: "p6",
    name: "Gorgeous Synthetic-Crystal Engagement and Promise Ring",
    slug: "synthetic-crystal-engagement-promise-ring",
    description:
      "Solitaire-inspired elegance with synthetic crystal brilliance.",
    shortDescription: "Synthetic crystal promise ring",
    price: 65,
    stock: 20,
    category: "rings",
    materials: ["Silver Tone", "Synthetic Crystal"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Gorgeous-Synthetic-Crystal"),
    isNewArrival: true,
    careInstructions: "Avoid perfume contact directly on stones.",
  },
  {
    id: "p7",
    name: "His and Hers Stunning Cubic Zirconia Wedding Ring",
    slug: "his-hers-cz-wedding-ring",
    description:
      "Matching silver-toned bands with inlaid stones — designed for couples who dazzle together.",
    shortDescription: "His & hers CZ wedding ring set",
    price: 65,
    stock: 12,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("His-and-Hers-Stunning-Cubic"),
    isFeatured: true,
    careInstructions: "Clean with mild soap and soft brush.",
  },
  {
    id: "p8",
    name: "Men's Boastful Black Stone Signet and Wedding Ring (Gold)",
    slug: "mens-black-stone-signet-ring-gold",
    description:
      "A bold gold-tone signet with a rectangular black stone and sparkling side accents.",
    shortDescription: "Gold black stone signet ring",
    price: 59.99,
    stock: 16,
    category: "rings",
    materials: ["Gold Tone", "Black Stone", "CZ"],
    colors: ["Gold", "Black"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Mens-Boastful-Black-Stone"),
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Wipe dry after wear. Avoid harsh chemicals.",
  },
  {
    id: "p9",
    name: "Men's Boastful Black Stone Signet and Wedding Ring (Silver)",
    slug: "mens-black-stone-signet-ring-silver",
    description:
      "Silver-toned black stone signet — sharp, modern, and built to impress.",
    shortDescription: "Silver black stone signet ring",
    price: 59.99,
    stock: 16,
    category: "rings",
    materials: ["Silver Tone", "Black Stone", "CZ"],
    colors: ["Silver", "Black"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Mens-Boastful-Black-Stone-Signet-silver"),
    careInstructions: "Polish with a silver jewelry cloth.",
  },
  {
    id: "p10",
    name: "Men's Dazzling 925 Sterling Silver Crystal Zircon Signet and Wedding Ring",
    slug: "mens-925-sterling-crystal-signet-ring",
    description:
      "925 sterling silver signet crowned with a round crystal zircon center stone.",
    shortDescription: "925 sterling crystal signet",
    price: 65,
    stock: 14,
    category: "rings",
    materials: ["925 Sterling Silver", "Crystal Zircon"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Mens-Dazzling-925"),
    isNewArrival: true,
    badge: "new",
    careInstructions: "Sterling silver: store in anti-tarnish pouch.",
  },
  {
    id: "p11",
    name: "Men's Stunning 8mm Stainless Steel Cubic Zirconia Inlaid Wedding Band",
    slug: "mens-8mm-stainless-cz-wedding-band",
    description:
      "An 8mm stainless steel band with a full row of inlaid cubic zirconia.",
    shortDescription: "8mm stainless CZ wedding band",
    price: 69.99,
    stock: 20,
    category: "rings",
    materials: ["Stainless Steel", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Mens-Stunning-8mm-Stainless"),
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Stainless steel — wipe clean.",
  },
  {
    id: "p12",
    name: "Stunning Heart-Shaped Two-Tone Cubic Zirconia Engagement and Promise Ring",
    slug: "heart-shaped-two-tone-cz-ring",
    description:
      "A romantic heart-shaped CZ cluster on a two-tone band.",
    shortDescription: "Heart two-tone CZ promise ring",
    price: 65,
    stock: 18,
    category: "rings",
    materials: ["Two-Tone Metal", "Cubic Zirconia"],
    colors: ["Silver", "Rose Gold"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Stunning-Heart-Shaped-Two-Tone"),
    isFeatured: true,
    careInstructions: "Avoid moisture. Soft cloth only.",
  },
  {
    id: "p13",
    name: "Stunning Women's Round Cubic Zirconia Engagement Ring",
    slug: "womens-round-cz-engagement-ring",
    description:
      "A large round center stone wrapped in a stone-encrusted halo.",
    shortDescription: "Round CZ halo engagement ring",
    price: 65,
    stock: 19,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver", "White"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Stunning-Womens-Round"),
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Remove before lotions and workouts.",
  },
  {
    id: "p14",
    name: "Women's Beautiful Black Stone Cubic Zirconia Engagement and Promise Ring",
    slug: "womens-black-stone-cz-promise-ring",
    description:
      "Moody black center stone surrounded by brilliant CZ — dark glam energy.",
    shortDescription: "Black stone CZ promise ring",
    price: 59.99,
    stock: 17,
    category: "rings",
    materials: ["Silver Tone", "Black Stone", "CZ"],
    colors: ["Black", "Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-Beautiful-Black-Stone"),
    careInstructions: "Keep dry and store flat.",
  },
  {
    id: "p15",
    name: "Women's Beautiful Engagement Ring and Wedding Band Set",
    slug: "womens-engagement-wedding-band-set",
    description:
      "A curated bridal duo — engagement sparkle paired with a complementary wedding band.",
    shortDescription: "Engagement & wedding band set",
    price: 65,
    stock: 11,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-Beautiful-Engagement-Ring"),
    isNewArrival: true,
    badge: "new",
    careInstructions: "Clean as a set; store together.",
  },
  {
    id: "p16",
    name: "Women's Luxurious 2pc Cubic Zirconia Engagement Ring and Wedding Band Set",
    slug: "womens-luxurious-2pc-cz-bridal-set",
    description:
      "Luxurious two-piece CZ bridal set with intricate detailing.",
    shortDescription: "Luxurious 2pc bridal set",
    price: 79.99,
    stock: 10,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-Luxurious-2pc-Cubic"),
    isFeatured: true,
    isBestSeller: true,
    badge: "bestseller",
    careInstructions: "Professional clean recommended periodically.",
  },
  {
    id: "p17",
    name: "Women's Luxurious 3pc Cubic Zirconia Engagement Ring and Wedding Band Set",
    slug: "womens-luxurious-3pc-cz-bridal-set",
    description:
      "Triple-stack bridal glam — engagement ring plus dual bands.",
    shortDescription: "Luxurious 3pc bridal stack",
    price: 79.99,
    stock: 9,
    category: "rings",
    materials: ["Silver Tone", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-Luxurious-3pc-Cubic"),
    isNewArrival: true,
    careInstructions: "Stack carefully; avoid friction between bands.",
  },
  {
    id: "p18",
    name: "Women's Luxurious S925 Sterling Silver Promise Ring",
    slug: "womens-s925-sterling-silver-promise-ring",
    description:
      "Delicate S925 sterling silver with a refined square center stone.",
    shortDescription: "S925 sterling silver promise ring",
    price: 69.99,
    stock: 21,
    category: "rings",
    materials: ["S925 Sterling Silver", "Cubic Zirconia"],
    colors: ["Silver"],
    sizes: DEFAULT_SIZES,
    images: productImgs("Womens-Luxurious-S925"),
    isNewArrival: true,
    badge: "new",
    careInstructions: "Sterling: avoid chlorine and store dry.",
  },
];

export const demoTestimonials = [
  {
    id: "t1",
    name: "Aaliyah M.",
    rating: 5,
    review:
      "I wore the round CZ ring to a birthday dinner and literally stopped conversations. Packaging was gorgeous too.",
    productName: "Round Cubic Zirconia Engagement Ring",
    image: placeholderImages.lifestyle[3],
    isVerified: true,
  },
  {
    id: "t2",
    name: "Priya S.",
    rating: 5,
    review:
      "The bridal set looked expensive in photos. Shipping to Toronto was fast and everything arrived pristine.",
    productName: "Luxurious 2pc Bridal Set",
    image: placeholderImages.lifestyle[0],
    isVerified: true,
  },
  {
    id: "t3",
    name: "Jordan K.",
    rating: 5,
    review:
      "Bought the men's black stone signet — bold without trying too hard. Already ordering another piece.",
    productName: "Black Stone Signet (Gold)",
    image: placeholderImages.lifestyle[2],
    isVerified: true,
  },
  {
    id: "t4",
    name: "Maya R.",
    rating: 5,
    review:
      "The sapphire promise ring is my everyday armor. Customer service helped me pick a size — so helpful!",
    productName: "Sapphire Birthstone Promise Ring",
    image: placeholderImages.lifestyle[1],
    isVerified: true,
  },
];

export const demoServices = [
  {
    id: "s1",
    title: "Personal Jewelry Styling",
    slug: "personal-jewelry-styling",
    shortDescription: "One-on-one glam guidance for your wardrobe.",
    description:
      "Work with our stylists to curate pieces that amplify your character. Whether you need everyday stackables or a single statement hero, we map your style, lifestyle, and budget into a lookbook you can shop with confidence.",
    image: placeholderImages.editorial[0],
    features: ["Virtual or in-person consult", "Personalized lookbook", "Budget-friendly options"],
    priceLabel: "From $49",
    details: [
      "Share your vibe, wardrobe, and upcoming events",
      "Get a curated shortlist of rings and pairings",
      "Shop with clarity — no guesswork, just glam",
    ],
  },
  {
    id: "s2",
    title: "Event Styling",
    slug: "event-styling",
    shortDescription: "Wedding, party, and runway-ready looks.",
    description:
      "Full jewelry styling for weddings, galas, and celebrations. We build moodboards, coordinate metals and silhouettes with your outfit, and support fittings so every entrance feels intentional and unforgettable.",
    image: placeholderImages.editorial[1],
    features: ["Moodboard creation", "On-site fitting support", "Return options"],
    priceLabel: "Custom quote",
    details: [
      "Brief your event theme, dress code, and timeline",
      "Receive a styled jewelry plan with alternatives",
      "Optional on-site support for the big day",
    ],
  },
  {
    id: "s3",
    title: "Gift Recommendations",
    slug: "gift-recommendations",
    shortDescription: "Thoughtful sparkle for someone special.",
    description:
      "Tell us about them — personality, metal preference, occasion — and we'll recommend pieces that feel personal and bold. Perfect for birthdays, anniversaries, proposals, and just because moments.",
    image: placeholderImages.editorial[2],
    features: ["Gift consult", "Premium packaging", "Optional handwritten note"],
    priceLabel: "Complimentary",
    details: [
      "Quick consult on recipient taste and budget",
      "Curated gift picks with why-it-works notes",
      "Premium packaging and optional handwritten card",
    ],
  },
  {
    id: "s4",
    title: "Custom Order Inquiries",
    slug: "custom-order-inquiries",
    shortDescription: "Made-to-order glam, just for you.",
    description:
      "Share your vision and we'll explore custom and special-order possibilities — from tweaking a silhouette to sourcing a specific finish. We'll guide materials, timelines, and what is realistically achievable.",
    image: placeholderImages.gallery[0],
    features: ["Design brief review", "Material guidance", "Timeline estimates"],
    priceLabel: "Inquiry based",
    details: [
      "Submit inspiration, sketches, or references",
      "Review feasibility, materials, and pricing",
      "Confirm timeline before production begins",
    ],
  },
  {
    id: "s5",
    title: "Bulk & Party Orders",
    slug: "bulk-party-orders",
    shortDescription: "Glam for the whole squad.",
    description:
      "Bridal parties, birthday crews, and event favors — coordinated sparkle at volume pricing. One dedicated contact keeps sizing, finishes, and delivery aligned so everyone dazzles together.",
    image: placeholderImages.gallery[2],
    features: ["Volume discounts", "Coordinated sets", "Dedicated order manager"],
    priceLabel: "Volume pricing",
    details: [
      "Tell us headcount, budget, and preferred styles",
      "Get coordinated set options with volume pricing",
      "One order manager through delivery",
    ],
  },
  {
    id: "s6",
    title: "Jewelry Consultation",
    slug: "jewelry-consultation",
    shortDescription: "Expert advice before you buy.",
    description:
      "Not sure what metal, stone, or silhouette suits you? Book a short consultation for fit, care, and styling guidance — then shop with confidence knowing every piece works with your look.",
    image: placeholderImages.gallery[4],
    features: ["15–30 min sessions", "Fit & care tips", "Shop-with-you guidance"],
    priceLabel: "From $29",
    details: [
      "Book a 15–30 minute virtual or phone session",
      "Get metal, fit, and care recommendations",
      "Leave with clear next steps for shopping",
    ],
  },
];

export function toCardProduct(p: DemoProduct) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    image: p.images[0],
    hoverImage: p.images[1],
    badge: p.badge,
    inStock: p.stock > 0,
  };
}
