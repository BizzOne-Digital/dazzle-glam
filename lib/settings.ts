import { getSiteSettings, type SiteSettingsData } from "@/actions/settings";

let cachedSettings: SiteSettingsData | null = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 1 minute

/**
 * Get site settings with caching to avoid excessive database queries
 * Use this on server components and API routes
 */
export async function getSettings(): Promise<SiteSettingsData> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (cachedSettings && now - lastFetch < CACHE_DURATION) {
    return cachedSettings;
  }
  
  // Fetch fresh settings
  const result = await getSiteSettings();
  
  if (result.success && result.data) {
    cachedSettings = result.data;
    lastFetch = now;
    return result.data;
  }
  
  // Return default settings if fetch fails
  return {
    businessName: "Dazzle Glam Jewelry Collection",
    phone: "(416) 305-7500",
    email: "dazzleglamcollection@gmail.com",
    address: "Toronto, Ontario, Canada",
    businessHours: "Mon–Fri 9am–9pm · Sat–Sun 9am–6pm",
    currency: "CAD",
    timezone: "America/Toronto",
    instagramUrl: "https://www.instagram.com/dazzleglamcollection",
    facebookUrl: "https://www.facebook.com/profile.php?id=61591817804914",
    taxRate: 0.13,
    freeShippingThreshold: 100,
    standardShippingCost: 8,
    expressShippingCost: 15,
    discountThreshold: 65,
    discountPercentage: 10,
  };
}

/**
 * Clear the settings cache - call this after updating settings
 */
export function clearSettingsCache() {
  cachedSettings = null;
  lastFetch = 0;
}
