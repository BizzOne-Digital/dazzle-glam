"use server";

import { connectDB } from "@/lib/db/connect";
import { SiteSettings, type ISiteSettings } from "@/models/SiteSettings";
import type { ActionResult } from "@/actions/auth";
import { z } from "zod";

const settingsSchema = z.object({
  // General
  businessName: z.string().min(1, "Business name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email required"),
  address: z.string().default(""),
  businessHours: z.string().default(""),
  currency: z.string().default("CAD"),
  timezone: z.string().default("America/Toronto"),
  
  // Social
  instagramUrl: z.string().default(""),
  facebookUrl: z.string().default(""),
  tiktokUrl: z.string().default(""),
  pinterestUrl: z.string().default(""),
  youtubeUrl: z.string().default(""),
  
  // E-commerce
  taxRate: z.number().min(0).max(1).default(0.13),
  freeShippingThreshold: z.number().min(0).default(100),
  standardShippingCost: z.number().min(0).default(8),
  expressShippingCost: z.number().min(0).default(15),
  discountThreshold: z.number().min(0).default(65),
  discountPercentage: z.number().min(0).max(100).default(10),
  
  // SEO & Store notice
  defaultTitle: z.string().default(""),
  defaultDescription: z.string().default(""),
  ogImageUrl: z.string().default(""),
  storeNotice: z.string().default(""),
});

export interface SiteSettingsData {
  businessName: string;
  phone: string;
  email: string;
  address?: string;
  businessHours?: string;
  currency: string;
  timezone: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  pinterestUrl?: string;
  youtubeUrl?: string;
  taxRate: number;
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  discountThreshold: number;
  discountPercentage: number;
  defaultTitle?: string;
  defaultDescription?: string;
  ogImageUrl?: string;
  storeNotice?: string;
}

/** Get current site settings */
export async function getSiteSettings(): Promise<ActionResult<SiteSettingsData>> {
  try {
    await connectDB();
    
    let settings = await SiteSettings.findOne().lean<ISiteSettings>();
    
    // Create default settings if none exist
    if (!settings) {
      const newSettings = await SiteSettings.create({
        businessName: "Dazzle Glam Jewelry Collection",
        phone: "(416) 905-7500",
        email: "dazzleglamcollection@gmail.com",
        address: "Toronto, Ontario, Canada",
        businessHours: "Mon–Fri 9am–9pm · Sat–Sun 9am–6pm",
        currency: "CAD",
        timezone: "America/Toronto",
        instagramUrl: "https://www.instagram.com/dazzleglamcollection",
        facebookUrl: "https://www.facebook.com/dazzleglamcollection",
        taxRate: 0.13,
        freeShippingThreshold: 100,
        standardShippingCost: 8,
        expressShippingCost: 15,
        discountThreshold: 65,
        discountPercentage: 10,
      });
      // Fetch the newly created settings as lean
      settings = await SiteSettings.findById(newSettings._id).lean<ISiteSettings>();
    }

    if (!settings) {
      throw new Error("Failed to create or retrieve settings");
    }
    
    return {
      success: true,
      message: "Settings loaded successfully",
      data: {
        businessName: settings.businessName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        businessHours: settings.businessHours,
        currency: settings.currency,
        timezone: settings.timezone,
        instagramUrl: settings.instagramUrl,
        facebookUrl: settings.facebookUrl,
        tiktokUrl: settings.tiktokUrl,
        pinterestUrl: settings.pinterestUrl,
        youtubeUrl: settings.youtubeUrl,
        taxRate: settings.taxRate,
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingCost: settings.standardShippingCost,
        expressShippingCost: settings.expressShippingCost,
        discountThreshold: settings.discountThreshold,
        discountPercentage: settings.discountPercentage,
        defaultTitle: settings.defaultTitle,
        defaultDescription: settings.defaultDescription,
        ogImageUrl: settings.ogImageUrl,
        storeNotice: settings.storeNotice,
      },
    };
  } catch (error) {
    console.error("Failed to get site settings:", error);
    return {
      success: false,
      message: "Failed to load settings",
    };
  }
}

/** Update site settings */
export async function updateSiteSettings(
  input: unknown
): Promise<ActionResult> {
  try {
    console.log("=== UPDATE SITE SETTINGS (SERVER) ===");
    console.log("Input received:", JSON.stringify(input, null, 2));
    
    const parsed = settingsSchema.safeParse(input);
    
    if (!parsed.success) {
      console.error("❌ Validation failed!");
      console.error("Validation errors:", parsed.error.flatten());
      return {
        success: false,
        message: "Invalid settings data",
        errors: parsed.error.flatten().fieldErrors,
      };
    }
    
    console.log("✓ Validation passed");
    console.log("Parsed data:", JSON.stringify(parsed.data, null, 2));
    
    console.log("Connecting to database...");
    await connectDB();
    console.log("✓ Connected to database");
    
    console.log("Updating settings in database...");
    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $set: parsed.data },
      { upsert: true, new: true }
    );
    
    console.log("✅ Settings updated successfully!");
    console.log("Updated phone:", updated.phone);
    console.log("Updated email:", updated.email);
    console.log("Updated Instagram:", updated.instagramUrl);
    
    return {
      success: true,
      message: "Settings saved successfully",
    };
  } catch (error) {
    console.error("❌ Failed to update site settings");
    console.error("Error:", error);
    return {
      success: false,
      message: `Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
