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
import { deleteProductAdmin, updateProductAdmin } from "@/actions/products";
import type { DemoProduct } from "@/lib/data/demo";

const ALL_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];
type Tab = "details" | "sizes";

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
      if (!url) {
        next.splice(index, 1);
        return next;
      }
      next[index] = url;
      return next.slice(0, 3);
    });
  };

  const addImageSlot = () => {
    if (images.length >= 3) {
      toast.error("Maximum 3 images per product");
      return;
    }
    setImages((prev) => [...prev, ""]);
  };

  const onSubmitDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const cleanImages = images.filter(Boolean).slice(0, 3);
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
      if (result.data) setProduct(result.data);
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
        {(["details", "sizes"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-md py-2 text-sm font-medium uppercase tracking-[0.12em] transition ${
              tab === t ? "bg-fuchsia/20 text-fuchsia" : "text-white/50 hover:text-white"
            }`}
          >
            {t === "sizes" ? (
              <>
                Sizes & Inquiries
                {pendingCount > 0 && (
                  <span className="ml-2 rounded-full bg-fuchsia px-1.5 py-0.5 text-[10px] text-white">
                    {pendingCount}
                  </span>
                )}
              </>
            ) : (
              t
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Images (max 3)</p>
              <Button type="button" size="sm" variant="secondary" onClick={addImageSlot}>
                Add image slot
              </Button>
            </div>
            {imageSlots.map((img, i) => (
              <LocalImageField
                key={`img-${i}`}
                label={`Image ${i + 1}${i < 2 ? " (required pair recommended)" : " (optional extra)"}`}
                folder="products"
                value={img}
                onChange={(url) => setImageAt(i, url)}
              />
            ))}
          </div>

          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
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
