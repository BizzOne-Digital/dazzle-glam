import mongoose, { Schema, model, models } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  // General
  businessName: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  currency: string;
  timezone: string;
  
  // Social
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  pinterestUrl?: string;
  youtubeUrl?: string;
  
  // E-commerce
  taxRate: number;
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  discountThreshold: number;
  discountPercentage: number;
  
  // SEO
  defaultTitle?: string;
  defaultDescription?: string;
  ogImageUrl?: string;
  
  // Store notice
  storeNotice?: string;
  
  // Timestamps
  updatedAt: Date;
  createdAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    // General
    businessName: { type: String, required: true, default: "Dazzle Glam Jewelry Collection" },
    phone: { type: String, required: true, default: "(416) 905-7500" },
    email: { type: String, required: true, default: "dazzleglamcollection@gmail.com" },
    address: { type: String, default: "Toronto, Ontario, Canada" },
    businessHours: { type: String, default: "Mon–Fri 9am–9pm · Sat–Sun 9am–6pm" },
    currency: { type: String, default: "CAD" },
    timezone: { type: String, default: "America/Toronto" },
    
    // Social
    instagramUrl: { type: String, default: "https://www.instagram.com/dazzleglamcollection" },
    facebookUrl: { type: String, default: "https://www.facebook.com/dazzleglamcollection" },
    tiktokUrl: String,
    pinterestUrl: String,
    youtubeUrl: String,
    
    // E-commerce
    taxRate: { type: Number, default: 0.13 },
    freeShippingThreshold: { type: Number, default: 100 },
    standardShippingCost: { type: Number, default: 8 },
    expressShippingCost: { type: Number, default: 15 },
    discountThreshold: { type: Number, default: 65 },
    discountPercentage: { type: Number, default: 10 },
  },
  { timestamps: true }
);

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
