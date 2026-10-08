"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Plus, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { getAllPageContents, updatePageContent } from "@/actions/pageContent";
import { defaultPageContent } from "@/lib/content/defaults";

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

const PAGE_TEMPLATES = defaultPageContent as Record<string, Record<string, unknown>>;

const MANAGED_PAGES = ["home", "shop", "gallery", "about", "contact", "faq", "shipping", "returns", "privacy", "terms", "accessibility"];

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
    const template = (PAGE_TEMPLATES[pageKey] || {}) as Record<string, unknown>;
    const page = pages.find((p) => p.pageKey === pageKey);

    if (page) {
      // Merge template so new default sections (e.g. showcase) appear in admin
      const saved = (page.sections || {}) as Record<string, unknown>;
      const merged: Record<string, unknown> = { ...template };
      for (const [key, value] of Object.entries(saved)) {
        const base = template[key];
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
          merged[key] = value;
        }
      }
      setContent(merged);
      setSeo(page.seo || { title: "", description: "", keywords: [] });
      setIsPublished(page.isPublished);
    } else if (template && Object.keys(template).length) {
      setContent(template);
      setSeo({
        title: `${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} | Dazzle Glam`,
        description: "",
        keywords: [],
      });
      setIsPublished(true);
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
                {Object.entries(sectionData as Record<string, unknown>).map(([field, value]: [string, unknown]) => {
                  const isImageField = /image/i.test(field);
                  return (
                  <div key={field}>
                    <label className="mb-1 block text-sm text-white/70 capitalize">
                      {field}
                    </label>
                    {isImageField ? (
                      <LocalImageField
                        folder="pages"
                        value={String(value || "")}
                        onChange={(url) => updateSection(sectionKey, field, url)}
                      />
                    ) : typeof value === "string" && value.length > 100 ? (
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
                  );
                })}
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
                {MANAGED_PAGES.map((pageKey) => (
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
