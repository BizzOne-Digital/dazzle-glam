"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { MAX_PRODUCT_IMAGES } from "@/config/site";
import {
  getProductInquiries,
  updateProductSizesAndNotify,
  notifyCustomerSizeAvailable,
  type ISizeInquiryPlain,
} from "@/actions/sizeInquiry";
import {
  getProductSizeStock,
  updateProductSizeStock,
} from "@/actions/sizeStock";
import { deleteProductAdmin, updateProductAdmin } from "@/actions/products";
import type { DemoProduct } from "@/lib/data/demo";
import {
  PRODUCT_CATEGORIES,
  RING_WIDTH_PRESETS,
  categoryNeedsSizes,
  getSizePresetsForCategory,
  getCategoryLabel,
} from "@/lib/productSizes";

const COLOR_PRESETS = [
  "Gold",
  "Silver",
  "Rose Gold",
  "Black",
  "White",
  "Blue",
  "Royal Blue",
  "Red",
  "Green",
  "Pink",
  "Fuchsia",
  "Multicolor",
];
const MATERIAL_PRESETS = [
  "Sterling Silver",
  "925 Sterling Silver",
  "Gold Tone",
  "Silver Tone",
  "Rose Gold Tone",
  "White Tone",
  "Stainless Steel",
  "Cubic Zirconia",
  "Crystal Zircon",
  "Synthetic Crystal",
  "Black Stone",
  "Sapphire CZ",
];
type Tab = "details" | "sizes" | "stock";

function emptyStock(sizeKeys: readonly string[]): Record<string, number> {
  return Object.fromEntries(sizeKeys.map((s) => [s, 0]));
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [tab, setTab] = useState<Tab>("details");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState<string>("rings");
  const [colors, setColors] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);

  const [enabledSizes, setEnabledSizes] = useState<string[]>([]);
  const [sizesLoaded, setSizesLoaded] = useState(false);
  const [sizesLoading, setSizesLoading] = useState(false);
  const [inquiries, setInquiries] = useState<ISizeInquiryPlain[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [widthSizesMap, setWidthSizesMap] = useState<Record<string, string[]>>({});
  const [widthSizeStockMap, setWidthSizeStockMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const [activeWidthTab, setActiveWidthTab] = useState<string>(RING_WIDTH_PRESETS[0]);
  const [hasWidthVariants, setHasWidthVariants] = useState(false);
  const [selectedWidths, setSelectedWidths] = useState<string[]>([]);
  const [widthImages, setWidthImages] = useState<Record<string, string>>({});
  const [stockLoaded, setStockLoaded] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

  const sizePresets = getSizePresetsForCategory(category);
  const needsSizes = categoryNeedsSizes(category);
  const productWidthVariants = product?.widthVariants ?? [];
  const usesWidthVariants = productWidthVariants.length > 0;

  useEffect(() => {
    const load = async () => {
      setLoadingProduct(true);
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        const p = data.product as DemoProduct;
        setProduct(p);
        setName(p.name);
        setSlug(p.slug);
        setSku(p.sku || "");
        setSupplier(p.supplier || "");
        setCategory(p.category || "rings");
        setColors(Array.isArray(p.colors) ? p.colors : []);
        setMaterials(Array.isArray(p.materials) ? p.materials : []);
        const wv = Array.isArray(p.widthVariants) ? p.widthVariants : [];
        setHasWidthVariants(wv.length > 0);
        setSelectedWidths(wv.map((w) => w.width));
        setWidthImages(
          Object.fromEntries(wv.map((w) => [w.width, w.image || ""]))
        );
        if (wv.length > 0) setActiveWidthTab(wv[0].width);
        setPrice(p.price);
        setCompareAtPrice(p.compareAtPrice || 0);
        setIsOnSale(!!p.isOnSale);
        setStock(p.stock);
        setDescription(p.description);
        setImages((p.images || []).slice(0, MAX_PRODUCT_IMAGES));
        // Only one flag allowed — prefer Coming Soon > Bestseller > New
        if (p.isComingSoon) {
          setIsComingSoon(true);
          setIsBestSeller(false);
          setIsNewArrival(false);
        } else if (p.isBestSeller) {
          setIsComingSoon(false);
          setIsBestSeller(true);
          setIsNewArrival(false);
        } else if (p.isNewArrival) {
          setIsComingSoon(false);
          setIsBestSeller(false);
          setIsNewArrival(true);
        } else {
          setIsComingSoon(false);
          setIsBestSeller(false);
          setIsNewArrival(false);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load");
        setProduct(null);
      } finally {
        setLoadingProduct(false);
      }
    };
    void load();
  }, [params.id]);

  useEffect(() => {
    if (tab === "sizes" && product) {
      if (!sizesLoaded) {
        fetch(`/api/products/${product.slug}/sizes`)
          .then((r) => r.json())
          .then((data) => {
            if (data.hasWidthVariants && data.widthSizes) {
              setWidthSizesMap(data.widthSizes);
              const firstWidth =
                product.widthVariants?.[0]?.width || RING_WIDTH_PRESETS[0];
              setActiveWidthTab(firstWidth);
            } else {
              setEnabledSizes(data.sizes ?? []);
            }
            setSizesLoaded(true);
          })
          .catch(() => setSizesLoaded(true));
      }
      void fetchInquiries();
    }
    if (tab === "stock" && product && !stockLoaded) {
      void (async () => {
        try {
          const keys = getSizePresetsForCategory(product.category || category);
          const widths = product.widthVariants?.map((w) => w.width) ?? [];
          const res = await getProductSizeStock(
            product.id,
            [...keys],
            widths.length ? widths : undefined
          );
          if (res.success) {
            setSizeStock(res.sizeStock);
            if (res.widthSizeStock) setWidthSizeStockMap(res.widthSizeStock);
            else setWidthSizeStockMap(
              Object.fromEntries(widths.map((w) => [w, emptyStock(keys)]))
            );
          } else {
            setSizeStock(emptyStock(keys));
          }
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load size stock"
          );
        } finally {
          setStockLoaded(true);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, product]);

  const fetchInquiries = async () => {
    if (!product) return;
    setInquiriesLoading(true);
    try {
      const result = await getProductInquiries(product.id);
      if (result.success) setInquiries(result.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load inquiries"
      );
    } finally {
      setInquiriesLoading(false);
    }
  };

  const setImageAt = (index: number, url: string) => {
    setImages((prev) => {
      const next = [...prev];
      while (next.length < index) next.push("");
      if (!url) {
        next[index] = "";
        // keep slots; trailing empties trimmed on save
        return next.slice(0, MAX_PRODUCT_IMAGES);
      }
      next[index] = url;
      return next.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      while (next.length < MAX_PRODUCT_IMAGES) next.push("");
      if (to < 0 || to > MAX_PRODUCT_IMAGES - 1 || from === to) {
        return next.slice(0, MAX_PRODUCT_IMAGES);
      }
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.slice(0, MAX_PRODUCT_IMAGES);
    });
  };

  const addImageSlot = () => {
    if (
      images.filter(Boolean).length >= MAX_PRODUCT_IMAGES ||
      images.length >= MAX_PRODUCT_IMAGES
    ) {
      toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images per product`);
      return;
    }
    setImages((prev) => [...prev, ""]);
  };

  const onSubmitDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || loading) return;
    // Preserve order; drop empty slots only
    const cleanImages = images.map((u) => u.trim()).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES);
    if (cleanImages.length < 1) {
      toast.error("At least 1 image is required");
      return;
    }
    if (isOnSale && compareAtPrice <= price) {
      toast.error("Original price must be higher than sale price");
      return;
    }
    setLoading(true);
    try {
      const widthVariantsPayload = hasWidthVariants
        ? selectedWidths.map((width) => ({
            width,
            image: widthImages[width]?.trim() || undefined,
          }))
        : [];

      const result = await updateProductAdmin(product.id, {
        name,
        slug,
        sku,
        supplier,
        category,
        colors,
        materials,
        widthVariants: widthVariantsPayload,
        price,
        compareAtPrice: isOnSale ? compareAtPrice : 0,
        isOnSale,
        stock,
        description,
        images: cleanImages,
        isNewArrival,
        isBestSeller,
        isComingSoon,
      });
      if (result.success) {
        toast.success("Product updated");
        if (result.data) {
          setProduct(result.data);
          setPrice(result.data.price);
          setSku(result.data.sku || "");
          setSupplier(result.data.supplier || "");
          setCategory(result.data.category || "rings");
          setColors(result.data.colors || []);
          setMaterials(result.data.materials || []);
          const wv = result.data.widthVariants ?? [];
          setHasWidthVariants(wv.length > 0);
          setSelectedWidths(wv.map((w) => w.width));
          setWidthImages(
            Object.fromEntries(wv.map((w) => [w.width, w.image || ""]))
          );
          setCompareAtPrice(result.data.compareAtPrice || 0);
          setIsOnSale(!!result.data.isOnSale);
          setImages((result.data.images || []).slice(0, MAX_PRODUCT_IMAGES));
          if (result.data.isComingSoon) {
            setIsComingSoon(true);
            setIsBestSeller(false);
            setIsNewArrival(false);
          } else if (result.data.isBestSeller) {
            setIsComingSoon(false);
            setIsBestSeller(true);
            setIsNewArrival(false);
          } else if (result.data.isNewArrival) {
            setIsComingSoon(false);
            setIsBestSeller(false);
            setIsNewArrival(true);
          } else {
            setIsComingSoon(false);
            setIsBestSeller(false);
            setIsNewArrival(false);
          }
        }
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Product update failed:", err);
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleSize = (size: string) => {
    setEnabledSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const addCustomColor = () => {
    const value = customColor.trim();
    if (!value) return;
    setColors((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomColor("");
  };

  const toggleMaterial = (material: string) => {
    setMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const toggleWidth = (width: string) => {
    setSelectedWidths((prev) => {
      const next = prev.includes(width)
        ? prev.filter((w) => w !== width)
        : [...prev, width];
      if (!next.includes(activeWidthTab) && next.length > 0) {
        setActiveWidthTab(next[0]);
      }
      return next;
    });
    setWidthImages((prev) => {
      if (selectedWidths.includes(width)) {
        const next = { ...prev };
        delete next[width];
        return next;
      }
      return prev;
    });
  };

  const toggleWidthSize = (width: string, size: string) => {
    setWidthSizesMap((prev) => {
      const current = prev[width] ?? [];
      const nextList = current.includes(size)
        ? current.filter((s) => s !== size)
        : [...current, size];
      return { ...prev, [width]: nextList };
    });
  };

  const addCustomMaterial = () => {
    const value = customMaterial.trim();
    if (!value) return;
    setMaterials((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomMaterial("");
  };

  const saveSizes = async () => {
    if (!product) return;
    setSizesLoading(true);
    const allowed = new Set(sizePresets);

    if (usesWidthVariants) {
      const cleanedMap: Record<string, string[]> = {};
      for (const width of productWidthVariants.map((w) => w.width)) {
        cleanedMap[width] = (widthSizesMap[width] ?? []).filter((s) =>
          allowed.has(s)
        );
      }
      const result = await updateProductSizesAndNotify(
        product.id,
        product.slug,
        [],
        process.env.NEXT_PUBLIC_SITE_URL,
        cleanedMap
      );
      setSizesLoading(false);
      if (result.success) {
        toast.success(result.message);
        await fetchInquiries();
      } else toast.error(result.message);
      return;
    }

    const cleanSizes = enabledSizes.filter((s) => allowed.has(s));
    const result = await updateProductSizesAndNotify(
      product.id,
      product.slug,
      cleanSizes,
      process.env.NEXT_PUBLIC_SITE_URL
    );
    setSizesLoading(false);
    if (result.success) {
      toast.success(result.message);
      await fetchInquiries();
    } else toast.error(result.message);
  };

  const notifyOne = async (inquiryId: string) => {
    setNotifyingId(inquiryId);
    const result = await notifyCustomerSizeAvailable(
      inquiryId,
      process.env.NEXT_PUBLIC_SITE_URL
    );
    setNotifyingId(null);
    if (result.success) {
      toast.success(result.message);
      await fetchInquiries();
    } else toast.error(result.message);
  };

  const saveSizeStock = async () => {
    if (!product) return;
    setStockLoading(true);
    try {
      const res = await updateProductSizeStock(
        product.id,
        product.slug,
        sizeStock,
        [...sizePresets],
        usesWidthVariants ? widthSizeStockMap : undefined
      );
      if (res.success) toast.success(res.message);
      else toast.error("Failed to save size stock");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setStockLoading(false);
    }
  };

  const onDelete = async () => {
    if (!product) return;
    if (!confirm("Delete this product permanently?")) return;
    const res = await deleteProductAdmin(product.id);
    if (res.success) {
      toast.success("Deleted");
      router.push("/admin/products");
    } else toast.error(res.error || "Delete failed");
  };

  if (loadingProduct) return <p className="text-white/50">Loading product…</p>;
  if (!product) return <p className="text-white/50">Product not found.</p>;

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;
  const imageSlots = images.length ? images : [""];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl">Edit Product</h1>
          <p className="text-sm text-white/50">{product.name}</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void onDelete()}>
          Delete
        </Button>
      </div>

      <div className="flex gap-1 rounded-lg border border-white/10 p-1">
        {(
          [
            { id: "details" as const, label: "Details" },
            ...(needsSizes
              ? ([
                  { id: "sizes" as const, label: "Sizes & Inquiries" },
                  { id: "stock" as const, label: "Size Stock" },
                ] as const)
              : []),
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative flex-1 rounded-md px-1 py-2 text-[11px] font-medium uppercase tracking-[0.08em] transition sm:text-sm sm:tracking-[0.12em] ${
              tab === t.id
                ? "bg-fuchsia/20 text-fuchsia"
                : "text-white/50 hover:text-white"
            }`}
          >
            {t.id === "sizes" ? (
              <>
                {t.label}
                {pendingCount > 0 && (
                  <span className="ml-1 rounded-full bg-fuchsia px-1.5 py-0.5 text-[10px] text-white sm:ml-2">
                    {pendingCount}
                  </span>
                )}
              </>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      {tab === "details" && (
        <form
          onSubmit={onSubmitDetails}
          className="space-y-4 rounded-xl border border-white/10 p-6"
        >
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. DG-RING-001"
            />
            <Input
              label="Supplier name"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Supplier / vendor"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/70">Category</label>
            <select
              value={category}
              onChange={(e) => {
                const next = e.target.value;
                setCategory(next);
                setSizesLoaded(false);
                setStockLoaded(false);
                if (!categoryNeedsSizes(next) && tab !== "details") {
                  setTab("details");
                }
              }}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-fuchsia focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-black">
                  {getCategoryLabel(c)}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-white/40">
              {category === "rings"
                ? "Rings use sizes 5–13 with size inquiry / email notify."
                : category === "bracelets"
                  ? "Bracelets use Small / Medium / Large with size inquiry / email notify."
                  : "This category is a simple product — no size selection or inquiry."}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="mb-1 text-sm text-white/70">Color variants</p>
            <p className="mb-3 text-xs text-white/40">
              Optional colors customers can choose. Leave empty if this piece
              has no color options.
            </p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => {
                const on = colors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      on
                        ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                        : "border-white/15 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
              {colors
                .filter((c) => !COLOR_PRESETS.includes(c))
                .map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className="rounded-lg border border-fuchsia bg-fuchsia/20 px-3 py-1.5 text-sm text-fuchsia"
                  >
                    {color} ×
                  </button>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                label="Custom color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="e.g. Emerald"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomColor();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-6 shrink-0"
                onClick={addCustomColor}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="mb-1 text-sm text-white/70">Materials</p>
            <p className="mb-3 text-xs text-white/40">
              Select materials shown on the product page. Add a custom one if
              needed.
            </p>
            <div className="flex flex-wrap gap-2">
              {MATERIAL_PRESETS.map((material) => {
                const on = materials.includes(material);
                return (
                  <button
                    key={material}
                    type="button"
                    onClick={() => toggleMaterial(material)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      on
                        ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                        : "border-white/15 text-white/70 hover:border-white/30"
                    }`}
                  >
                    {material}
                  </button>
                );
              })}
              {materials
                .filter((m) => !MATERIAL_PRESETS.includes(m))
                .map((material) => (
                  <button
                    key={material}
                    type="button"
                    onClick={() => toggleMaterial(material)}
                    className="rounded-lg border border-fuchsia bg-fuchsia/20 px-3 py-1.5 text-sm text-fuchsia"
                  >
                    {material} ×
                  </button>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                label="Custom material"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                placeholder="e.g. Pearl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomMaterial();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-6 shrink-0"
                onClick={addCustomMaterial}
              >
                Add
              </Button>
            </div>
          </div>
          {category === "rings" && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <label className="mb-3 flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  className="accent-fuchsia"
                  checked={hasWidthVariants}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setHasWidthVariants(on);
                    if (!on) {
                      setSelectedWidths([]);
                      setWidthImages({});
                    }
                  }}
                />
                This ring has width size variants (4mm / 6mm / 8mm)
              </label>
              <p className="mb-3 text-xs text-white/40">
                Optional — only enable for rings sold in multiple band widths.
                Select one or more widths, then upload an image for each.
              </p>
              {hasWidthVariants && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {RING_WIDTH_PRESETS.map((width) => {
                      const on = selectedWidths.includes(width);
                      return (
                        <button
                          key={width}
                          type="button"
                          onClick={() => toggleWidth(width)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                            on
                              ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                              : "border-white/15 text-white/70 hover:border-white/30"
                          }`}
                        >
                          {width}
                        </button>
                      );
                    })}
                  </div>
                  {selectedWidths.length > 0 && (
                    <div className="mt-5 space-y-4">
                      {selectedWidths.map((width) => (
                        <div
                          key={width}
                          className="rounded-lg border border-white/10 p-4"
                        >
                          <p className="mb-3 text-sm font-medium text-white">
                            {width} band — product image
                          </p>
                          <LocalImageField
                            folder="products"
                            value={widthImages[width] || ""}
                            onChange={(url) =>
                              setWidthImages((prev) => ({ ...prev, [width]: url }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
            <Input
              label="Stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className="mb-3 flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                className="accent-fuchsia"
                checked={isOnSale}
                onChange={(e) => setIsOnSale(e.target.checked)}
              />
              Mark as Sale
            </label>
            <Input
              label="Original price (compare at)"
              type="number"
              step="0.01"
              min="0"
              value={compareAtPrice}
              disabled={!isOnSale}
              onChange={(e) => setCompareAtPrice(Number(e.target.value))}
            />
            {isOnSale && compareAtPrice <= price && (
              <p className="mt-2 text-xs text-amber-300">
                Original price should be higher than sale price.
              </p>
            )}
          </div>
          <Textarea
            label="Description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <p className="mb-3 text-sm text-white/70">Product flag (pick one)</p>
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="productFlag"
                  className="accent-fuchsia"
                  checked={!isNewArrival && !isBestSeller && !isComingSoon}
                  onChange={() => {
                    setIsNewArrival(false);
                    setIsBestSeller(false);
                    setIsComingSoon(false);
                  }}
                />
                None
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="productFlag"
                  className="accent-fuchsia"
                  checked={isNewArrival}
                  onChange={() => {
                    setIsNewArrival(true);
                    setIsBestSeller(false);
                    setIsComingSoon(false);
                  }}
                />
                New
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="productFlag"
                  className="accent-fuchsia"
                  checked={isBestSeller}
                  onChange={() => {
                    setIsNewArrival(false);
                    setIsBestSeller(true);
                    setIsComingSoon(false);
                  }}
                />
                Bestseller
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="productFlag"
                  className="accent-fuchsia"
                  checked={isComingSoon}
                  onChange={() => {
                    setIsNewArrival(false);
                    setIsBestSeller(false);
                    setIsComingSoon(true);
                  }}
                />
                Coming Soon
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-white/70">Images (max {MAX_PRODUCT_IMAGES})</p>
                <p className="text-xs text-white/40">
                  Image 1 = main shop / product photo. Use arrows to change order.
                </p>
              </div>
              <Button type="button" size="sm" variant="secondary" onClick={addImageSlot}>
                Add image slot
              </Button>
            </div>
            {imageSlots.map((img, i) => (
              <div
                key={`img-${i}-${img || "empty"}`}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    Image {i + 1}
                    {i === 0 ? (
                      <span className="ml-2 text-xs font-normal text-fuchsia">
                        Main
                      </span>
                    ) : null}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={i === 0}
                      onClick={() => moveImage(i, i - 1)}
                    >
                      ↑ Move up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={i >= imageSlots.length - 1}
                      onClick={() => moveImage(i, i + 1)}
                    >
                      ↓ Move down
                    </Button>
                    {i > 0 && img ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => moveImage(i, 0)}
                      >
                        Set as #1
                      </Button>
                    ) : null}
                  </div>
                </div>
                <LocalImageField
                  folder="products"
                  value={img}
                  onChange={(url) => setImageAt(i, url)}
                />
              </div>
            ))}
          </div>

          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      )}

      {tab === "stock" && needsSizes && (
        <div className="rounded-xl border border-white/10 p-6">
          <h2 className="mb-1 font-heading text-xl text-white">Size Stock</h2>
          <p className="mb-5 text-sm text-white/50">
            Admin-only inventory notes for your reference. Customers never see
            these quantities on the website.{" "}
            {category === "bracelets"
              ? "Bracelet sizes: Small, Medium, Large."
              : "Ring sizes: 5–13."}
          </p>
          {!stockLoaded ? (
            <p className="text-sm text-white/40">Loading size stock…</p>
          ) : usesWidthVariants ? (
            <div className="space-y-8">
              {productWidthVariants.map((wv) => (
                <div key={wv.width}>
                  <h3 className="mb-3 font-heading text-lg text-white">
                    {wv.width} band stock
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-white/10 pb-2 text-[10px] uppercase tracking-wider text-silver">
                      <span>Size</span>
                      <span>Stock qty</span>
                    </div>
                    {sizePresets.map((size) => (
                      <div
                        key={`${wv.width}-${size}`}
                        className="grid grid-cols-[7rem_1fr] items-center gap-3"
                      >
                        <span className="font-medium text-white">
                          {/^\d+$/.test(size) ? `Size ${size}` : size}
                        </span>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={widthSizeStockMap[wv.width]?.[size] ?? 0}
                          onChange={(e) =>
                            setWidthSizeStockMap((prev) => ({
                              ...prev,
                              [wv.width]: {
                                ...(prev[wv.width] ?? emptyStock(sizePresets)),
                                [size]: Math.max(0, Number(e.target.value) || 0),
                              },
                            }))
                          }
                          aria-label={`Stock for ${wv.width} size ${size}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-white/10 pb-2 text-[10px] uppercase tracking-wider text-silver">
                <span>Size</span>
                <span>Stock qty</span>
              </div>
              {sizePresets.map((size) => (
                <div
                  key={size}
                  className="grid grid-cols-[7rem_1fr] items-center gap-3"
                >
                  <span className="font-medium text-white">
                    {/^\d+$/.test(size) ? `Size ${size}` : size}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={sizeStock[size] ?? 0}
                    onChange={(e) =>
                      setSizeStock((prev) => ({
                        ...prev,
                        [size]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    aria-label={`Stock for size ${size}`}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => void saveSizeStock()}
              loading={stockLoading}
              disabled={!stockLoaded}
            >
              Save size stock
            </Button>
            <p className="text-xs text-white/35">
              Example: Size 5 → 3, Size 6 → 0, Size 7 → 3
            </p>
          </div>
        </div>
      )}

      {tab === "sizes" && needsSizes && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 p-6">
            <h2 className="mb-1 font-heading text-xl text-white">Available Sizes</h2>
            <p className="mb-5 text-sm text-white/50">
              Toggle sizes for this{" "}
              {category === "bracelets" ? "bracelet" : "ring"}. Saving notifies
              customers who inquired about those sizes by email.
              {usesWidthVariants
                ? " Manage ring sizes separately for each band width."
                : ""}
            </p>
            {!sizesLoaded ? (
              <p className="text-sm text-white/40">Loading current sizes…</p>
            ) : usesWidthVariants ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {productWidthVariants.map((wv) => (
                    <button
                      key={wv.width}
                      type="button"
                      onClick={() => setActiveWidthTab(wv.width)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        activeWidthTab === wv.width
                          ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {wv.width}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizePresets.map((size) => {
                    const enabled = (widthSizesMap[activeWidthTab] ?? []).includes(
                      size
                    );
                    const isNumeric = /^\d+$/.test(size);
                    return (
                      <button
                        key={`${activeWidthTab}-${size}`}
                        type="button"
                        onClick={() => toggleWidthSize(activeWidthTab, size)}
                        className={`rounded-xl border text-sm font-medium transition ${
                          isNumeric ? "h-12 w-12" : "h-12 px-4"
                        } ${
                          enabled
                            ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                            : "border-white/20 text-white/50 hover:border-white/50 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-3">
                {sizePresets.map((size) => {
                  const on = enabledSizes.includes(size);
                  const isNumeric = /^\d+$/.test(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`rounded-xl border text-sm font-medium transition ${
                        isNumeric ? "h-12 w-12" : "h-12 px-4"
                      } ${
                        on
                          ? "border-fuchsia bg-fuchsia/20 text-fuchsia"
                          : "border-white/20 text-white/50 hover:border-white/50 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            )}
            <Button
              className="mt-6"
              onClick={() => void saveSizes()}
              loading={sizesLoading}
              disabled={!sizesLoaded}
            >
              Save Sizes & Notify Customers
            </Button>
          </div>

          <div className="rounded-xl border border-white/10 p-6">
            <h2 className="mb-4 font-heading text-xl text-white">Size Inquiries</h2>
            {inquiriesLoading ? (
              <p className="text-sm text-white/40">Loading…</p>
            ) : inquiries.length === 0 ? (
              <p className="text-sm text-white/40">No inquiries yet.</p>
            ) : (
              <ul className="space-y-3">
                {inquiries.map((inq) => (
                  <li
                    key={inq.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 p-3 text-sm"
                  >
                    <div>
                      <p>{inq.customerEmail}</p>
                      <p className="text-white/40">
                        Size {inq.desiredSize} · {inq.status}
                      </p>
                    </div>
                    {inq.status === "pending" && (
                      <Button
                        size="sm"
                        loading={notifyingId === inq.id}
                        onClick={() => void notifyOne(inq.id)}
                      >
                        Notify
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
