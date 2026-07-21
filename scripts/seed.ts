import { connectDB } from "../lib/db/connect";
import {
  Category,
  Collection,
  Product,
  SiteSettings,
  Testimonial,
  Service,
  GalleryItem,
  PageContent,
  NavigationMenu,
  ShippingMethod,
  Review,
} from "../models";
import { demoProducts, demoTestimonials, demoServices } from "../lib/data/demo";
import { navigation, placeholderImages, brand } from "../config/site";

async function main() {
  await connectDB();
  console.log("Seeding Dazzle Glam…");

  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
    Testimonial.deleteMany({}),
    Service.deleteMany({}),
    GalleryItem.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const [ringsCategory] = await Category.insertMany([
    {
      name: "Rings",
      slug: "rings",
      image: placeholderImages.rings[0],
      sortOrder: 1,
      isPublished: true,
    },
  ]);

  const products = await Product.insertMany(
    demoProducts.map((p) => ({
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      price: p.price,
      stock: p.stock,
      lowStockLimit: 5,
      status: "published",
      publishedAt: new Date(),
      media: p.images.map((url, i) => ({
        url,
        alt: p.name,
        type: "image",
        sortOrder: i,
      })),
      materials: p.materials,
      colors: p.colors,
      careInstructions: p.careInstructions,
      dimensions: p.dimensions,
      categories: [ringsCategory._id],
      collections: [],
      isFeatured: !!p.isFeatured,
      isBestSeller: !!p.isBestSeller,
      isNewArrival: !!p.isNewArrival,
      isOnSale: false,
      seo: {
        title: `${p.name} | ${brand.shortName}`,
        description: p.shortDescription,
      },
    }))
  );

  await Testimonial.insertMany(
    demoTestimonials.map((t, i) => ({
      name: t.name,
      image: t.image,
      rating: t.rating,
      review: t.review,
      productName: t.productName,
      isVerified: t.isVerified,
      isPublished: true,
      sortOrder: i,
    }))
  );

  await Service.insertMany(
    demoServices.map((s, i) => ({
      title: s.title,
      slug: s.slug,
      description: s.description,
      shortDescription: s.shortDescription,
      image: s.image,
      features: s.features,
      priceLabel: s.priceLabel,
      isPublished: true,
      sortOrder: i,
    }))
  );

  await GalleryItem.insertMany(
    placeholderImages.gallery.map((image, i) => ({
      title: `Gallery ${i + 1}`,
      caption: "Dazzle Glam look",
      image,
      category: i % 2 === 0 ? "product" : "lifestyle",
      sortOrder: i,
      isPublished: true,
    }))
  );

  await ShippingMethod.deleteMany({});
  await ShippingMethod.insertMany([
    {
      name: "Standard",
      description: "3–6 business days",
      price: 12,
      estimatedDays: "3-6",
      isActive: true,
    },
    {
      name: "Express",
      description: "1–3 business days",
      price: 24,
      estimatedDays: "1-3",
      isActive: true,
    },
  ]);

  await SiteSettings.deleteMany({});
  await SiteSettings.create({});

  await NavigationMenu.deleteMany({});
  await NavigationMenu.create({
    location: "header",
    items: navigation.map((n) => ({
      label: n.label,
      href: n.href,
      visible: true,
    })),
  });

  await PageContent.deleteMany({});
  await PageContent.create({
    key: "homepage",
    title: "Homepage",
    content: {
      heroEyebrow: "DAZZLE GLAM JEWELRY COLLECTION",
      heroHeadline: "Turn Heads. Own the Room.",
    },
    isPublished: true,
  });

  const sample = products.slice(0, 5);
  await Review.insertMany(
    sample.map((p, i) => ({
      product: p._id,
      name: demoTestimonials[i % demoTestimonials.length].name,
      rating: 5,
      comment: demoTestimonials[i % demoTestimonials.length].review,
      isVerified: true,
      isApproved: true,
      isFeatured: i < 2,
    }))
  );

  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
