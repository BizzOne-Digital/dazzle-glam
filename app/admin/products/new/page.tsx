"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LocalImageField } from "@/components/admin/LocalImageField";
import { createProductAdmin } from "@/actions/products";
import {
  PRODUCT_CATEGORIES,
  categoryNeedsSizes,
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

export default function NewProductPage() {
  const router = useRouter();
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
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>(["", ""]);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isComingSoon, setIsComingSoon] = useState(false);

  const setImageAt = (index: number, url: string) => {
    setImages((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push("");
      next[index] = url;
      return next.slice(0, 3);
    });
  };

  const moveImage = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev];
      while (next.length < 3) next.push("");
      if (to < 0 || to > 2 || from === to) return next.slice(0, 3);
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.slice(0, 3);
    });
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

  const addCustomMaterial = () => {
    const value = customMaterial.trim();
    if (!value) return;
    setMaterials((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomMaterial("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const clean = images.map((u) => u.trim()).filter(Boolean).slice(0, 3);
    if (clean.length < 1) {
      toast.error("Upload at least 1 image");
      return;
    }
    if (isOnSale && compareAtPrice <= price) {
      toast.error("Original price must be higher than sale price");
      return;
    }
    setLoading(true);
    try {
      const result = await createProductAdmin({
        name,
        slug: slug || undefined,
        sku: sku || undefined,
        supplier: supplier || undefined,
        category,
        colors,
        materials,
        description,
        price,
        compareAtPrice: isOnSale ? compareAtPrice : 0,
        isOnSale,
        stock,
        images: clean,
        isNewArrival,
        isBestSeller,
        isComingSoon,
      });
      if (result.success && result.data) {
        toast.success("Product created");
        router.push(`/admin/products/${result.data.id}`);
      } else {
        toast.error(result.error || "Create failed");
      }
    } catch (err) {
      console.error("Product create failed:", err);
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Add Product</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 p-6">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Slug (optional)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-from-name"
        />
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
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-fuchsia focus:outline-none"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-black">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-white/40">
            {categoryNeedsSizes(category)
              ? category === "bracelets"
                ? "After create, set Small / Medium / Large on the Sizes tab (inquiry + email notify)."
                : "After create, set ring sizes 5–12 on the Sizes tab (inquiry + email notify)."
              : "Simple product — no size selection or inquiry."}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="mb-1 text-sm text-white/70">Color variants</p>
          <p className="mb-3 text-xs text-white/40">
            Optional colors customers can choose.
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
            Select materials shown on the product page.
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
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
          required
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
          <div>
            <p className="text-sm text-white/70">Images (max 3)</p>
            <p className="text-xs text-white/40">
              Image 1 is the main photo. Use arrows to change order.
            </p>
          </div>
          {images.map((img, i) => (
            <div
              key={`new-img-${i}`}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">
                  Image {i + 1}
                  {i === 0 ? (
                    <span className="ml-2 text-xs font-normal text-fuchsia">Main</span>
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
                    disabled={i >= images.length - 1}
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
          {images.length < 3 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setImages((prev) => [...prev, ""])}
            >
              Add image slot
            </Button>
          )}
        </div>
        <Button type="submit" loading={loading}>
          Create Product
        </Button>
      </form>
    </div>
  );
}
