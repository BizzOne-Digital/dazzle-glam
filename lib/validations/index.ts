import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

const seoSchema = z
  .object({
    title: z.string().max(120).optional(),
    description: z.string().max(320).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional().or(z.literal("")),
    noIndex: z.boolean().optional(),
  })
  .partial();

const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2).default("CA"),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  portal: z.enum(["admin", "customer"]).optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("Valid email required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string().min(8),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const productVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  image: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: slugSchema,
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  stock: z.number().int().min(0).default(0),
  lowStockLimit: z.number().int().min(0).default(5),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        alt: z.string().optional(),
        type: z.enum(["image", "video"]).default("image"),
        sortOrder: z.number().int().optional(),
      })
    )
    .default([]),
  variants: z.array(productVariantSchema).default([]),
  materials: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  careInstructions: z.string().optional(),
  shippingDetails: z.string().optional(),
  categories: z.array(objectId).default([]),
  collections: z.array(objectId).default([]),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  relatedProducts: z.array(objectId).default([]),
  seo: seoSchema.optional(),
  publishedAt: z.coerce.date().optional(),
  scheduledAt: z.coerce.date().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  inquiryType: z.string().optional(),
  orderNumber: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().max(100).optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  shippingMethodId: objectId.optional(),
  discountCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const reviewSchema = z.object({
  productId: objectId,
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(5).max(2000),
  images: z.array(z.string().url()).max(5).default([]),
});

export const discountSchema = z.object({
  code: z.string().min(2).max(40).optional(),
  name: z.string().min(1).max(120),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().min(0),
  minPurchase: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  perCustomerLimit: z.number().int().min(1).optional(),
  productIds: z.array(objectId).default([]),
  collectionIds: z.array(objectId).default([]),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isAutomatic: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  image: z.string().optional(),
  parent: objectId.optional().nullable(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
  seo: seoSchema.optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema,
  description: z.string().max(2000).optional(),
  heroImage: z.string().optional(),
  image: z.string().optional(),
  products: z.array(objectId).default([]),
  ruleBased: z.boolean().default(false),
  rules: z
    .array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
  seo: seoSchema.optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(1).max(160),
  slug: slugSchema,
  description: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  features: z.array(z.string()).default([]),
  priceLabel: z.string().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  seo: seoSchema.optional(),
});

export const siteSettingsGeneralSchema = z
  .object({
    businessName: z.string().min(1),
    logo: z.string(),
    favicon: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    businessHours: z.string(),
    currency: z.string().min(3).max(3),
    timezone: z.string(),
    language: z.string(),
  })
  .partial();

export const siteSettingsBrandingSchema = z
  .object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    accentColor: z.string(),
    backgroundColor: z.string(),
    headingFont: z.string(),
    bodyFont: z.string(),
    buttonStyle: z.string(),
    borderRadius: z.string(),
    visualIntensity: z.number().min(0).max(100),
  })
  .partial();

export const siteSettingsSocialSchema = z
  .object({
    instagram: z.string(),
    facebook: z.string(),
    tiktok: z.string(),
    pinterest: z.string(),
    youtube: z.string(),
  })
  .partial();

export const siteSettingsEcommerceSchema = z
  .object({
    currency: z.string().min(3).max(3),
    taxRate: z.number().min(0).max(1),
    freeShippingThreshold: z.number().min(0),
    lowStockLimit: z.number().int().min(0),
    orderPrefix: z.string().min(1).max(10),
    inventoryBehaviour: z.string(),
  })
  .partial();

export const siteSettingsIntegrationsSchema = z
  .object({
    stripePublishableKey: z.string().optional(),
    cloudinaryCloudName: z.string().optional(),
    analyticsId: z.string().optional(),
    metaPixelId: z.string().optional(),
    gtmId: z.string().optional(),
    emailProvider: z.string().optional(),
  })
  .partial();

export const siteSettingsSeoSchema = z
  .object({
    defaultTitle: z.string(),
    defaultDescription: z.string(),
    keywords: z.array(z.string()),
    ogImage: z.string(),
    robotsIndex: z.boolean(),
  })
  .partial();

export const siteSettingsMaintenanceSchema = z
  .object({
    enabled: z.boolean(),
    comingSoon: z.boolean(),
    storeNotice: z.string(),
    message: z.string(),
  })
  .partial();

export const siteSettingsHomepageSchema = z
  .object({
    sectionOrder: z.array(z.string()),
    sectionVisibility: z.record(z.boolean()),
    featuredProductId: z.string().optional(),
    announcements: z.array(z.string()),
  })
  .partial();

export const siteSettingsSchema = z
  .object({
    general: siteSettingsGeneralSchema,
    branding: siteSettingsBrandingSchema,
    social: siteSettingsSocialSchema,
    ecommerce: siteSettingsEcommerceSchema,
    integrations: siteSettingsIntegrationsSchema,
    seo: siteSettingsSeoSchema,
    maintenance: siteSettingsMaintenanceSchema,
    homepage: siteSettingsHomepageSchema,
  })
  .partial();

export const cartItemInputSchema = z.object({
  productId: objectId,
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const applyDiscountSchema = z.object({
  code: z.string().min(1).max(40),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type DiscountInput = z.infer<typeof discountSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
