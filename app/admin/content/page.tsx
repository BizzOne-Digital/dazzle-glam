"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getAllPageContents, updatePageContent } from "@/actions/pageContent";

interface PageContentData {
  _id: string;
  pageKey: string;
  sections: Record<string, unknown>;
  seo: {
    title: string;
    description: string;
    keywords?: string[];
  };
  isPublished: boolean;
}

const PAGE_TEMPLATES = {
  home: {
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
  about: {
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
  contact: {
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
  faq: {
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
  shipping: {
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
  returns: {
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
  privacy: {
    hero: {
      title: "Privacy Policy",
      subtitle: "Your Privacy Matters",
      description: "Learn how we collect, use, and protect your personal information.",
      image: "/products/product-1.png",
    },
    lastUpdated: "January 2024",
    content: "At Dazzle Glam, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.",
  },
  terms: {
    hero: {
      title: "Terms of Service",
      subtitle: "Terms & Conditions",
      description: "Please read these terms carefully before using our website or purchasing our products.",
      image: "/products/product-1.png",
    },
    lastUpdated: "January 2024",
    content: "By accessing and using the Dazzle Glam website, you agree to be bound by these terms of service and all applicable laws and regulations.",
  },
  accessibility: {
    hero: {
      title: "Accessibility Statement",
      subtitle: "Committed to Accessibility",
      description: "We're dedicated to making our website accessible to everyone.",
      image: "/products/product-1.png",
    },
    content: "Dazzle Glam is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.",
  },
  gallery: {
    hero: {
      title: "Gallery",
      subtitle: "Statement Jewelry in Action",
      description: "Explore our collection and see how Dazzle Glam jewelry transforms every look.",
    },
  },
  shop: {
    hero: {
      title: "Shop All",
      subtitle: "Bold Jewelry for Bold Women",
      description: "Explore our full collection of statement rings designed to turn heads and own the room.",
    },
  },
};

export default function ContentManagementPage() {
  const [pages, setPages] = useState<PageContentData[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>("home");
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [seo, setSeo] = useState<{ title: string; description: string; keywords?: string[] }>({ title: "", description: "", keywords: [] });
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      loadPageContent(selectedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage, pages]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const data = await getAllPageContents();
      setPages(data);
    } catch (error) {
      console.error("Failed to load pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const loadPageContent = (pageKey: string) => {
    const page = pages.find((p) => p.pageKey === pageKey);
    if (page) {
      setContent(page.sections || {});
      setSeo(page.seo || { title: "", description: "", keywords: [] });
      setIsPublished(page.isPublished);
    } else {
      // Load from template if page doesn't exist
      const template = PAGE_TEMPLATES[pageKey as keyof typeof PAGE_TEMPLATES];
      if (template) {
        setContent(template);
        setSeo({
          title: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} | Dazzle Glam`,
          description: "",
          keywords: [],
        });
        setIsPublished(true);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePageContent(selectedPage, {
        sections: content,
        seo,
        isPublished,
      });

      if (result.success) {
        toast.success("Content saved successfully!");
        await loadPages();
      } else {
        toast.error(result.error || "Failed to save content");
      }
    } catch (error) {
      console.error("Failed to save content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (sectionKey: string, field: string, value: string) => {
    setContent((prev: Record<string, unknown>) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] as Record<string, unknown> || {}),
        [field]: value,
      },
    }));
  };

  const updateArrayItem = (sectionKey: string, index: number, field: string, value: string) => {
    setContent((prev: Record<string, unknown>) => {
      const section = (prev[sectionKey] as unknown[]) || [];
      const newSection = [...section];
      newSection[index] = {
        ...(newSection[index] as Record<string, unknown>),
        [field]: value,
      };
      return {
        ...prev,
        [sectionKey]: newSection,
      };
    });
  };

  const addArrayItem = (sectionKey: string, template: Record<string, unknown>) => {
    setContent((prev: Record<string, unknown>) => ({
      ...prev,
      [sectionKey]: [...((prev[sectionKey] as unknown[]) || []), template],
    }));
  };

  const removeArrayItem = (sectionKey: string, index: number) => {
    setContent((prev: Record<string, unknown>) => {
      const section = (prev[sectionKey] as unknown[]) || [];
      return {
        ...prev,
        [sectionKey]: section.filter((_: unknown, i: number) => i !== index),
      };
    });
  };

  const renderContentEditor = () => {
    if (!content || Object.keys(content).length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-white/60">No content sections found for this page.</p>
          <Button className="mt-4" onClick={() => setContent({})}>
            Create Content
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {Object.entries(content).map(([sectionKey, sectionData]: [string, unknown]) => (
          <div key={sectionKey} className="rounded-lg border border-white/10 bg-charcoal/30 p-6">
            <h3 className="mb-4 font-heading text-xl text-white capitalize">
              {sectionKey.replace(/([A-Z])/g, " $1").trim()}
            </h3>

            {Array.isArray(sectionData) ? (
              <div className="space-y-4">
                {sectionData.map((item: unknown, index: number) => (
                  <div
                    key={index}
                    className="rounded border border-white/5 bg-black/20 p-4 space-y-3"
                  >
                    {Object.entries(item as Record<string, unknown>).map(([field, value]: [string, unknown]) => (
                      <div key={field}>
                        <label className="mb-1 block text-sm text-white/70 capitalize">
                          {field}
                        </label>
                        <Input
                          value={String(value || "")}
                          onChange={(e) =>
                            updateArrayItem(sectionKey, index, field, e.target.value)
                          }
                          placeholder={`Enter ${field}`}
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => removeArrayItem(sectionKey, index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() =>
                    addArrayItem(sectionKey, (sectionData[0] as Record<string, unknown>) || { title: "", description: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(sectionData as Record<string, unknown>).map(([field, value]: [string, unknown]) => (
                  <div key={field}>
                    <label className="mb-1 block text-sm text-white/70 capitalize">
                      {field}
                    </label>
                    {typeof value === "string" && value.length > 100 ? (
                      <textarea
                        value={value}
                        onChange={(e) => updateSection(sectionKey, field, e.target.value)}
                        placeholder={`Enter ${field}`}
                        className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-3 text-white placeholder:text-white/40 focus:border-fuchsia focus:outline-none"
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={String(value || "")}
                        onChange={(e) => updateSection(sectionKey, field, e.target.value)}
                        placeholder={`Enter ${field}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl text-white">Content Management</h1>
            <p className="mt-1 text-sm text-white/60">
              Manage all website content from one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={loadPages} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setIsPublished(!isPublished)}
            >
              {isPublished ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {isPublished ? "Published" : "Draft"}
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Page Selector */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-white/10 bg-charcoal/50 p-4">
              <h2 className="mb-4 font-heading text-lg text-white">Pages</h2>
              <div className="space-y-1">
                {Object.keys(PAGE_TEMPLATES).map((pageKey) => (
                  <button
                    key={pageKey}
                    onClick={() => setSelectedPage(pageKey)}
                    className={`w-full rounded px-3 py-2 text-left text-sm capitalize transition ${
                      selectedPage === pageKey
                        ? "bg-fuchsia text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {pageKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-white/10 bg-charcoal/50 p-6">
              {/* SEO Section */}
              <div className="mb-8 rounded-lg border border-white/10 bg-black/30 p-6">
                <h3 className="mb-4 font-heading text-xl text-white">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Meta Title</label>
                    <Input
                      value={seo.title}
                      onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                      placeholder="Enter page title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-white/70">Meta Description</label>
                    <textarea
                      value={seo.description}
                      onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                      placeholder="Enter page description"
                      className="w-full rounded-lg border border-white/10 bg-charcoal px-4 py-3 text-white placeholder:text-white/40 focus:border-fuchsia focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              {renderContentEditor()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
