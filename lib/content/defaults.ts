import { getPageContent } from "@/actions/pageContent";

export type PageSections = Record<string, Record<string, unknown>>;

export const defaultPageContent: Record<string, PageSections> = {
  home: {
    hero: {
      eyebrow: "Dazzle Glam Jewelry Collection",
      title: "Turn Heads.",
      scriptTitle: "Own the Room.",
      description:
        "Eye-popping jewelry designed to command attention, amplify your confidence and transform every look into a bold statement.",
      image: "/images/hero/campaign.png",
      primaryCta: "Shop New Arrivals",
      primaryHref: "/shop?sort=new",
      secondaryCta: "Explore Products",
      secondaryHref: "/shop",
    },
    swipeProducts: {
      title: "New Arrivals",
      description: "Statement rings curated to turn heads",
    },
    manifesto: {
      eyebrow: "Brand Manifesto",
      title: "Jewelry Should Never Whisper",
      description:
        "We design pieces that amplify character, command attention, and transform every look into a bold statement.",
    },
    showcase: {
      label: "Our work in motion",
      body: "Dazzle Glam turns everyday looks into *statement moments* — bold pieces designed to amplify confidence and own every room.",
      feature1Title: "Statement Design",
      feature1Description: "Pieces that command attention from across the room.",
      feature2Title: "Everyday Glam",
      feature2Description: "High-fashion energy made for real life.",
    },
    featured: {
      eyebrow: "Featured",
      title: "Spotlight Piece",
    },
    bestSellers: {
      title: "Best Sellers",
      description: "Our most-loved statement pieces",
    },
    gallery: {
      title: "Gallery",
      description: "Campaign moments and customer glam",
    },
    testimonials: {
      title: "Loved by Glam Girls",
      description: "Real reviews from real dazzle moments",
    },
    newsletter: {
      title: "Join the Glam List",
      description:
        "Be first to discover new drops, exclusive offers and styling inspiration.",
    },
    finalCta: {
      title: "Your Next Statement Starts Here",
      description: "Shop the collection and own every room you walk into.",
    },
  },
  shop: {
    hero: {
      eyebrow: "Boutique",
      title: "Shop All Jewelry",
      description: "Eighteen statement rings — bold energy, luminous finish.",
      image: "/images/hero/products-campaign.png",
    },
  },
  gallery: {
    hero: {
      eyebrow: "Portfolio",
      title: "Gallery",
      description:
        "Customer looks, product close-ups, and campaign moments — scroll, filter, and feel the glam.",
      image: "/images/hero/gallery-campaign.png",
    },
  },
  about: {
    hero: {
      eyebrow: "Our Story",
      title: "Jewelry That Breaks the Mold",
      description: "",
      image: "/images/hero/about-campaign.png",
    },
    mission: {
      eyebrow: "Mission",
      title: "Amplify Character. Own the Room.",
      description:
        "We believe jewelry should break the mold, amplify character, and transform everyday moments into bold statements of artistic confidence.",
      content:
        "Founded by Karleen, Dazzle Glam Jewelry Collection was built for women between 15 and 50 who want eye-popping pieces that command attention from across the room — without whispering.",
      scriptLine: "So glam it up!",
    },
    founder: {
      eyebrow: "Founder",
      title: "Karleen",
      description:
        "With a passion for statement jewelry and modern feminine glamour, Karleen curates pieces that feel like a high-fashion campaign — ready for real life.",
      image: "",
    },
  },
  contact: {
    hero: {
      eyebrow: "Connect",
      title: "Contact Us",
      description: "Questions, custom orders, styling — we're here.",
    },
    info: {
      title: "Let's talk glam",
      description: "Reach out for product questions, orders, or styling help.",
      phone: "(416) 305-7500",
      email: "dazzleglamcollection@gmail.com",
      hoursTitle: "Studio hours",
      weekday: "Monday – Friday: 9am – 9pm",
      weekend: "Saturday – Sunday: 9am – 6pm",
      address: "Toronto, Ontario, Canada",
      instagram: "@dazzleglamcollection",
    },
  },
};

export async function getPageSections(pageKey: string): Promise<PageSections> {
  const content = await getPageContent(pageKey);
  const defaults = defaultPageContent[pageKey] || {};
  if (!content?.sections) return defaults;

  const merged: PageSections = { ...defaults };
  for (const [key, value] of Object.entries(content.sections)) {
    const base = defaults[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base &&
      typeof base === "object" &&
      !Array.isArray(base)
    ) {
      merged[key] = {
        ...(base as Record<string, unknown>),
        ...(value as Record<string, unknown>),
      };
    } else {
      merged[key] = value as PageSections[string];
    }
  }
  return merged;
}

/**
 * Resolve CMS image URLs for Vercel.
 * Legacy `/uploads/...` paths were written to disk (read-only on Vercel) and break.
 * New uploads use `/api/uploads/{folder}/{file}` (MongoDB).
 */
export function resolveContentImage(
  url: string | undefined | null,
  fallback: string
): string {
  if (!url || !String(url).trim()) return fallback;
  const value = String(url).trim();

  if (value.startsWith("/api/uploads/")) return value;

  // Old local filesystem uploads — not available on Vercel
  if (value.startsWith("/uploads/")) {
    return fallback;
  }

  return value;
}

export function sectionText(
  sections: PageSections,
  key: string,
  field: string,
  fallback = ""
): string {
  const value = sections?.[key]?.[field];
  return typeof value === "string" && value.length ? value : fallback;
}

export function sectionImage(
  sections: PageSections,
  key: string,
  field: string,
  fallback: string
): string {
  return resolveContentImage(sectionText(sections, key, field, fallback), fallback);
}
