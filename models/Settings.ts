import mongoose, { Schema, models, model } from "mongoose";

export interface ISiteSettings {
  _id: mongoose.Types.ObjectId;
  general: {
    businessName: string;
    logo: string;
    favicon: string;
    phone: string;
    email: string;
    address: string;
    businessHours: string;
    currency: string;
    timezone: string;
    language: string;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    headingFont: string;
    bodyFont: string;
    buttonStyle: string;
    borderRadius: string;
    visualIntensity: number;
  };
  social: {
    instagram: string;
    facebook: string;
    tiktok: string;
    pinterest: string;
    youtube: string;
  };
  ecommerce: {
    currency: string;
    taxRate: number;
    freeShippingThreshold: number;
    lowStockLimit: number;
    orderPrefix: string;
    inventoryBehaviour: string;
  };
  integrations: {
    stripePublishableKey?: string;
    cloudinaryCloudName?: string;
    analyticsId?: string;
    metaPixelId?: string;
    gtmId?: string;
    emailProvider?: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
    robotsIndex: boolean;
  };
  maintenance: {
    enabled: boolean;
    comingSoon: boolean;
    storeNotice: string;
    message: string;
  };
  homepage: {
    sectionOrder: string[];
    sectionVisibility: Record<string, boolean>;
    featuredProductId?: string;
    announcements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    general: {
      businessName: { type: String, default: "Dazzle Glam Jewelry Collection" },
      logo: { type: String, default: "/brand/logo.png" },
      favicon: { type: String, default: "/brand/favicon.svg" },
      phone: { type: String, default: "(416) 305-7500" },
      email: { type: String, default: "dazzleglamcollection@gmail.com" },
      address: { type: String, default: "Toronto, Ontario, Canada" },
      businessHours: {
        type: String,
        default: "Mon–Fri 10am–6pm EST · Sat 11am–4pm",
      },
      currency: { type: String, default: "CAD" },
      timezone: { type: String, default: "America/Toronto" },
      language: { type: String, default: "en" },
    },
    branding: {
      primaryColor: { type: String, default: "#FF1493" },
      secondaryColor: { type: String, default: "#C0C0C0" },
      accentColor: { type: String, default: "#FF69B4" },
      backgroundColor: { type: String, default: "#000000" },
      headingFont: { type: String, default: "Cormorant Garamond" },
      bodyFont: { type: String, default: "Outfit" },
      buttonStyle: { type: String, default: "metallic" },
      borderRadius: { type: String, default: "0.5rem" },
      visualIntensity: { type: Number, default: 80 },
    },
    social: {
      instagram: {
        type: String,
        default: "https://instagram.com/dazzleglamcollection",
      },
      facebook: String,
      tiktok: String,
      pinterest: String,
      youtube: String,
    },
    ecommerce: {
      currency: { type: String, default: "CAD" },
      taxRate: { type: Number, default: 0.13 },
      freeShippingThreshold: { type: Number, default: 150 },
      lowStockLimit: { type: Number, default: 5 },
      orderPrefix: { type: String, default: "DG" },
      inventoryBehaviour: { type: String, default: "deny" },
    },
    integrations: {
      stripePublishableKey: String,
      cloudinaryCloudName: String,
      analyticsId: String,
      metaPixelId: String,
      gtmId: String,
      emailProvider: String,
    },
    seo: {
      defaultTitle: {
        type: String,
        default: "Dazzle Glam Jewelry Collection | Bold Statement Jewelry",
      },
      defaultDescription: {
        type: String,
        default:
          "Eye-popping jewelry that commands attention. Shop rings, earrings, necklaces and statement pieces from Dazzle Glam.",
      },
      keywords: {
        type: [String],
        default: ["jewelry", "rings", "statement jewelry", "dazzle glam"],
      },
      ogImage: String,
      robotsIndex: { type: Boolean, default: true },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      comingSoon: { type: Boolean, default: false },
      storeNotice: String,
      message: {
        type: String,
        default: "We're polishing something spectacular. Check back soon.",
      },
    },
    homepage: {
      sectionOrder: {
        type: [String],
        default: [
          "announcement",
          "hero",
          "marquee",
          "collections",
          "newArrivals",
          "manifesto",
          "featured",
          "shopTheLook",
          "bestSellers",
          "transformation",
          "gallery",
          "testimonials",
          "newsletter",
          "finalCta",
        ],
      },
      sectionVisibility: {
        type: Schema.Types.Mixed,
        default: {
          announcement: true,
          hero: true,
          marquee: true,
          collections: true,
          newArrivals: true,
          manifesto: true,
          featured: true,
          shopTheLook: true,
          bestSellers: true,
          transformation: true,
          gallery: true,
          testimonials: true,
          newsletter: true,
          finalCta: true,
        },
      },
      featuredProductId: String,
      announcements: {
        type: [String],
        default: [
          "Free shipping on qualifying orders",
          "New statement pieces just dropped",
          "Glam it up — shop the latest collection",
          "Secure checkout and Canada-wide delivery",
        ],
      },
    },
  },
  { timestamps: true }
);

export const SiteSettings =
  models.SiteSettings || model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export interface IShippingMethod {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShippingMethodSchema = new Schema<IShippingMethod>(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    estimatedDays: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ShippingMethod =
  models.ShippingMethod ||
  model<IShippingMethod>("ShippingMethod", ShippingMethodSchema);

export interface ITaxSetting {
  _id: mongoose.Types.ObjectId;
  name: string;
  region: string;
  rate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxSettingSchema = new Schema<ITaxSetting>(
  {
    name: { type: String, required: true },
    region: { type: String, required: true },
    rate: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TaxSetting =
  models.TaxSetting || model<ITaxSetting>("TaxSetting", TaxSettingSchema);

export interface INotification {
  _id: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification =
  models.Notification || model<INotification>("Notification", NotificationSchema);

export interface IActivityLog {
  _id: mongoose.Types.ObjectId;
  admin: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    details: String,
    ip: String,
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
