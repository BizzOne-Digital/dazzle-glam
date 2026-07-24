import { connectDB } from "../lib/db/connect";
import { PageContent } from "../models/Content";

const pageContents = [
  {
    pageKey: "home",
    sections: {
      hero: {
        title: "Dazzle Glam Jewelry Collection",
        subtitle: "Turn Heads. Own the Room.",
        description: "Eye-popping jewelry designed to command attention, amplify your confidence and transform every look into a bold statement.",
        image: "/hero/hero-1.png",
      },
      swipeProducts: {
        title: "New Arrivals",
        description: "Statement Rings Curated To Turn Heads",
      },
      bestSellers: {
        title: "Best Sellers",
        description: "Our most-loved pieces",
      },
    },
    seo: {
      title: "Dazzle Glam Jewelry Collection | Bold Statement Rings",
      description: "Eye-popping jewelry designed to command attention. Shop statement rings for women who refuse to blend in.",
      keywords: ["statement rings", "bold jewelry", "women's rings", "dazzle glam"],
    },
    isPublished: true,
  },
  {
    pageKey: "about",
    sections: {
      hero: {
        title: "About Us",
        subtitle: "Bold Jewelry for Women Who Refuse to Blend In",
        description: "At Dazzle Glam, we believe jewelry should do more than accessorize—it should amplify your presence, command attention, and make every room yours.",
        image: "/products/product-1.png",
      },
      story: {
        title: "Our Story",
        content: "Founded on the belief that confidence is the best accessory, Dazzle Glam creates statement jewelry for women who own their space. Each piece is crafted to turn heads, spark conversations, and elevate your style to iconic status.",
      },
      mission: {
        title: "Our Mission",
        content: "To empower bold women with jewelry that's as fearless as they are. We design pieces that don't just complement your outfit—they define it.",
      },
    },
    seo: {
      title: "About Us | Dazzle Glam Jewelry Collection",
      description: "Learn about Dazzle Glam - bold jewelry for women who refuse to blend in.",
      keywords: ["about dazzle glam", "jewelry brand", "statement jewelry"],
    },
    isPublished: true,
  },
  {
    pageKey: "contact",
    sections: {
      hero: {
        title: "Get in Touch",
        subtitle: "We'd love to hear from you",
        description: "Whether you have a question about our products, need assistance, or just want to say hello, our team is here to help.",
        image: "/products/product-1.png",
      },
      hours: {
        title: "Studio Hours",
        weekday: "Monday – Friday: 9am – 9pm",
        weekend: "Saturday – Sunday: 9am – 6pm",
      },
    },
    seo: {
      title: "Contact Us | Dazzle Glam",
      description: "Get in touch with Dazzle Glam. We're here to help with any questions.",
      keywords: ["contact", "customer service", "support"],
    },
    isPublished: true,
  },
  {
    pageKey: "faq",
    sections: {
      hero: {
        title: "Frequently Asked Questions",
        subtitle: "Everything You Need to Know",
        description: "Find answers to common questions about our products, shipping, returns, and more.",
      },
      items: [
        {
          question: "What materials are used in your jewelry?",
          answer: "Our jewelry is crafted from high-quality materials including sterling silver, gold-plated brass, and premium crystals. Each product listing includes specific material details.",
        },
        {
          question: "How do I determine my ring size?",
          answer: "We offer sizes 5-12 for all our rings. If you're unsure of your size or need a size that's currently unavailable, you can submit a size inquiry on the product page, and we'll notify you when it becomes available.",
        },
        {
          question: "What is your return policy?",
          answer: "We accept returns within 30 days of purchase for unworn, undamaged items in their original packaging. Please visit our Returns & Refunds page for complete details.",
        },
        {
          question: "Do you offer international shipping?",
          answer: "Currently, we ship within Canada only. Standard shipping is $8, and express 4-day shipping is available for $15. Orders over $100 qualify for free shipping.",
        },
        {
          question: "How do I care for my jewelry?",
          answer: "Store your jewelry in a cool, dry place away from direct sunlight. Clean with a soft, lint-free cloth. Avoid contact with water, perfumes, and harsh chemicals to maintain the finish.",
        },
      ],
    },
    seo: {
      title: "FAQ | Dazzle Glam",
      description: "Frequently asked questions about Dazzle Glam jewelry, shipping, returns, and more.",
      keywords: ["faq", "questions", "help", "support"],
    },
    isPublished: true,
  },
  {
    pageKey: "shipping",
    sections: {
      hero: {
        title: "Shipping Policy",
        subtitle: "Fast & Reliable Delivery",
        description: "We offer multiple shipping options to get your jewelry to you quickly and safely.",
        image: "/products/product-1.png",
      },
      options: [
        {
          title: "Standard Shipping",
          description: "$8 flat rate, 5-7 business days",
        },
        {
          title: "Express Shipping",
          description: "$15, 4 business days",
        },
        {
          title: "Free Shipping",
          description: "On orders over $100",
        },
      ],
      content: "All orders are processed within 1-2 business days. You'll receive a tracking number once your order ships. We currently ship within Canada only.",
    },
    seo: {
      title: "Shipping Policy | Dazzle Glam",
      description: "Learn about our shipping options, rates, and delivery times.",
      keywords: ["shipping", "delivery", "shipping policy"],
    },
    isPublished: true,
  },
  {
    pageKey: "returns",
    sections: {
      hero: {
        title: "Returns & Refunds",
        subtitle: "Hassle-Free Returns",
        description: "Not completely satisfied? We offer easy returns within 30 days.",
        image: "/products/product-1.png",
      },
      policy: {
        title: "Return Policy",
        content: "We accept returns within 30 days of purchase for items that are unworn, undamaged, and in their original packaging with all tags attached. Refunds are processed to the original payment method within 5-10 business days of receiving the returned item.",
      },
      process: [
        {
          step: "1",
          title: "Contact Us",
          description: "Email us at dazzleglamcollection@gmail.com with your order number and reason for return.",
        },
        {
          step: "2",
          title: "Ship It Back",
          description: "Securely package the item and ship it to the address provided. Customers are responsible for return shipping costs.",
        },
        {
          step: "3",
          title: "Get Your Refund",
          description: "Once we receive and inspect your return, we'll process your refund within 5-10 business days.",
        },
      ],
    },
    seo: {
      title: "Returns & Refunds | Dazzle Glam",
      description: "Learn about our hassle-free return policy and refund process.",
      keywords: ["returns", "refunds", "return policy"],
    },
    isPublished: true,
  },
  {
    pageKey: "privacy",
    sections: {
      hero: {
        title: "Privacy Policy",
        subtitle: "Your Privacy Matters",
        description: "Learn how we collect, use, and protect your personal information.",
        image: "/products/product-1.png",
      },
      lastUpdated: "January 2024",
      content: "At Dazzle Glam, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.",
    },
    seo: {
      title: "Privacy Policy | Dazzle Glam",
      description: "Read our privacy policy to learn how we protect your personal information.",
      keywords: ["privacy", "privacy policy", "data protection"],
    },
    isPublished: true,
  },
  {
    pageKey: "terms",
    sections: {
      hero: {
        title: "Terms of Service",
        subtitle: "Terms & Conditions",
        description: "Please read these terms carefully before using our website or purchasing our products.",
        image: "/products/product-1.png",
      },
      lastUpdated: "January 2024",
      content: "By accessing and using the Dazzle Glam website, you agree to be bound by these terms of service and all applicable laws and regulations.",
    },
    seo: {
      title: "Terms of Service | Dazzle Glam",
      description: "Read our terms of service and conditions.",
      keywords: ["terms", "terms of service", "conditions"],
    },
    isPublished: true,
  },
  {
    pageKey: "accessibility",
    sections: {
      hero: {
        title: "Accessibility Statement",
        subtitle: "Committed to Accessibility",
        description: "We're dedicated to making our website accessible to everyone.",
        image: "/products/product-1.png",
      },
      content: "Dazzle Glam is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.",
    },
    seo: {
      title: "Accessibility | Dazzle Glam",
      description: "Learn about our commitment to digital accessibility.",
      keywords: ["accessibility", "wcag", "digital accessibility"],
    },
    isPublished: true,
  },
  {
    pageKey: "gallery",
    sections: {
      hero: {
        title: "Gallery",
        subtitle: "Statement Jewelry in Action",
        description: "Explore our collection and see how Dazzle Glam jewelry transforms every look.",
      },
    },
    seo: {
      title: "Gallery | Dazzle Glam",
      description: "View our jewelry gallery and see statement rings in action.",
      keywords: ["gallery", "jewelry photos", "lookbook"],
    },
    isPublished: true,
  },
  {
    pageKey: "shop",
    sections: {
      hero: {
        title: "Shop All",
        subtitle: "Bold Jewelry for Bold Women",
        description: "Explore our full collection of statement rings designed to turn heads and own the room.",
      },
    },
    seo: {
      title: "Shop All | Dazzle Glam",
      description: "Shop our complete collection of bold statement rings.",
      keywords: ["shop", "buy rings", "statement jewelry"],
    },
    isPublished: true,
  },
];

async function seedPageContent() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Seeding page content...");
    
    for (const page of pageContents) {
      await PageContent.findOneAndUpdate(
        { pageKey: page.pageKey },
        page,
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded: ${page.pageKey}`);
    }

    console.log("\n✅ Page content seeding completed successfully!");
    console.log(`Total pages seeded: ${pageContents.length}`);
  } catch (error) {
    console.error("❌ Error seeding page content:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPageContent()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedPageContent };
