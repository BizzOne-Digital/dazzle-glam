"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { LocalImageField } from "@/components/admin/LocalImageField";
import {
  getProductInquiries,
  updateProductSizesAndNotify,
  notifyCustomerSizeAvailable,
  type ISizeInquiryPlain,
} from "@/actions/sizeInquiry";
import {
  ALL_SIZES as STOCK_SIZES,
  getProductSizeStock,
  updateProductSizeStock,
} from "@/actions/sizeStock";
import { deleteProductAdmin, updateProductAdmin } from "@/actions/products";
import type { DemoProduct } from "@/lib/data/demo";

const ALL_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];
type Tab = "details" | "sizes" | "stock";

function emptyStock(): Record<string, number> {
  return Object.fromEntries(ALL_SIZES.map((s) => [s, 0]));
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
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [enabledSizes, setEnabledSizes] = useState<string[]>([]);
  const [sizesLoaded, setSizesLoaded] = useState(false);
  const [sizesLoading, setSizesLoading] = useState(false);
  const [inquiries, setInquiries] = useState<ISizeInquiryPlain[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const [sizeStock, setSizeStock] = useState<Record<string, number>>(emptyStock);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [stockLoading, setStockLoading] = useState(false);

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
        setPrice(p.price);
        setStock(p.stock);
        setDescription(p.description);
        setImages((p.images || []).slice(0, 3));
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
            setEnabledSizes(data.sizes ?? []);
            setSizesLoaded(true);
          })
          .catch(() => setSizesLoaded(true));
      }
      void fetchInquiries();
    }
    if (tab === "stock" && product && !stockLoaded) {
      void (async () => {
        const res = await getProductSizeStock(product.id);
        if (res.success) setSizeStock(res.sizeStock);
        setStockLoaded(true);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, product]);

  const fetchInquiries = async () => {
    if (!product) return;
    setInquiriesLoading(true);
    const result = await getProductInquiries(product.id);
    if (result.success) setInquiries(result.data);
    setInquiriesLoading(false);
  };

  const setImageAt = (index: number, url: string) => {
    setImages((prev) => {
      const next = [...prev];
      while (next.length < index) next.push("");
      if (!url) {
        next[index] = "";
        // keep slots; trailing empties trimmed on save
        return next.slice(0, 3);
      }
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

  const addImageSlot = () => {
    if (images.filter(Boolean).length >= 3 || images.length >= 3) {
      toast.error("Maximum 3 images per product");
      return;
    }
    setImages((prev) => [...prev, ""]);
  };

  const onSubmitDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    // Preserve order; drop empty slots only
    const cleanImages = images.map((u) => u.trim()).filter(Boolean).slice(0, 3);
    if (cleanImages.length < 1) {
      toast.error("At least 1 image is required");
      return;
    }
    setLoading(true);
    const result = await updateProductAdmin(product.id, {
      name,
      slug,
      price,
      stock,
      description,
      images: cleanImages,
    });
    setLoading(false);
    if (result.success) {
      toast.success("Product updated");
      if (result.data) {
        setProduct(result.data);
        setImages((result.data.images || []).slice(0, 3));
      }
    } else toast.error(result.error || "Update failed");
  };

  const toggleSize = (size: string) => {
    setEnabledSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const saveSizes = async () => {
    if (!product) return;
    setSizesLoading(true);
    const result = await updateProductSizesAndNotify(
      product.id,
      product.slug,
      enabledSizes,
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
        sizeStock
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
            { id: "details", label: "Details" },
            { id: "sizes", label: "Sizes & Inquiries" },
            { id: "stock", label: "Size Stock" },
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
          <Textarea
            label="Description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-white/70">Images (max 3)</p>
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

      {tab === "stock" && (
        <div className="rounded-xl border border-white/10 p-6">
          <h2 className="mb-1 font-heading text-xl text-white">Size Stock</h2>
          <p className="mb-5 text-sm text-white/50">
            Admin-only inventory notes for your reference. Customers never see
            these quantities on the website.
          </p>
          {!stockLoaded ? (
            <p className="text-sm text-white/40">Loading size stock…</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-[4rem_1fr] gap-3 border-b border-white/10 pb-2 text-[10px] uppercase tracking-wider text-silver">
                <span>Size</span>
                <span>Stock qty</span>
              </div>
              {STOCK_SIZES.map((size) => (
                <div
                  key={size}
                  className="grid grid-cols-[4rem_1fr] items-center gap-3"
                >
                  <span className="font-medium text-white">Size {size}</span>
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

      {tab === "sizes" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 p-6">
            <h2 className="mb-1 font-heading text-xl text-white">Available Sizes</h2>
            <p className="mb-5 text-sm text-white/50">
              Toggle sizes for this product. Saving notifies customers who inquired.
            </p>
            {!sizesLoaded ? (
              <p className="text-sm text-white/40">Loading current sizes…</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {ALL_SIZES.map((size) => {
                  const on = enabledSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`h-12 w-12 rounded-xl border text-sm font-medium transition ${
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
