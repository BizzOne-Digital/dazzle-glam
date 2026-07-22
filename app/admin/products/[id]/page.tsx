"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { demoProducts } from "@/lib/data/demo";
import {
  getProductInquiries,
  updateProductSizesAndNotify,
  notifyCustomerSizeAvailable,
  type ISizeInquiryPlain,
} from "@/actions/sizeInquiry";

const ALL_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];

type Tab = "details" | "sizes";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const product = useMemo(
    () => demoProducts.find((p) => p.id === params.id),
    [params.id]
  );

  const [tab, setTab] = useState<Tab>("details");
  const [loading, setLoading] = useState(false);

  // Sizes state — start empty, load from DB when tab opens
  const [enabledSizes, setEnabledSizes] = useState<string[]>([]);
  const [sizesLoaded, setSizesLoaded] = useState(false);
  const [sizesLoading, setSizesLoading] = useState(false);

  // Inquiries state
  const [inquiries, setInquiries] = useState<ISizeInquiryPlain[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "sizes" && product) {
      // Load current saved sizes from DB on first open
      if (!sizesLoaded) {
        fetch(`/api/products/${product.slug}/sizes`)
          .then((r) => r.json())
          .then((data) => {
            setEnabledSizes(data.sizes ?? []);
            setSizesLoaded(true);
          })
          .catch(() => setSizesLoaded(true));
      }
      fetchInquiries();
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

  if (!product) {
    return <p className="text-white/50">Product not found in demo catalog.</p>;
  }

  const onSubmitDetails = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Product updated (connect MongoDB to persist)");
    setLoading(false);
  };

  const toggleSize = (size: string) => {
    setEnabledSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const saveSizes = async () => {
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
      await fetchInquiries(); // refresh inquiry list
    } else {
      toast.error(result.message);
    }
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
    } else {
      toast.error(result.message);
    }
  };

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl">Edit Product</h1>
      <p className="text-sm text-white/50">{product.name}</p>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-white/10 p-1">
        {(["details", "sizes"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-md py-2 text-sm font-medium uppercase tracking-[0.12em] transition
              ${tab === t ? "bg-fuchsia/20 text-fuchsia" : "text-white/50 hover:text-white"}`}
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

      {/* Details Tab */}
      {tab === "details" && (
        <form
          onSubmit={onSubmitDetails}
          className="space-y-4 rounded-xl border border-white/10 p-6"
        >
          <Input label="Name" name="name" defaultValue={product.name} required />
          <Input label="Slug" name="slug" defaultValue={product.slug} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
            />
            <Input
              label="Stock"
              name="stock"
              type="number"
              defaultValue={product.stock}
            />
          </div>
          <Textarea
            label="Description"
            name="description"
            rows={5}
            defaultValue={product.description}
          />
          {product.images.slice(0, 4).map((img, i) => (
            <Input
              key={img}
              label={`Image URL ${i + 1}`}
              name={`image${i}`}
              defaultValue={img}
            />
          ))}
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      )}

      {/* Sizes Tab */}
      {tab === "sizes" && (
        <div className="space-y-6">
          {/* Size toggles */}
          <div className="rounded-xl border border-white/10 p-6">
            <h2 className="mb-1 font-heading text-xl text-white">
              Available Sizes
            </h2>
            <p className="mb-5 text-sm text-white/50">
              Toggle which sizes are available for this product. When you save,
              customers who inquired about newly enabled sizes will be
              automatically notified by email.
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
                    className={`h-12 w-12 rounded-xl border text-sm font-medium transition
                      ${
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
              onClick={saveSizes}
              loading={sizesLoading}
              disabled={!sizesLoaded}
            >
              Save Sizes & Notify Customers
            </Button>
          </div>

          {/* Inquiries list */}
          <div className="rounded-xl border border-white/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-xl text-white">
                Size Inquiries
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchInquiries}
                loading={inquiriesLoading}
              >
                Refresh
              </Button>
            </div>

            {inquiriesLoading ? (
              <p className="text-sm text-white/40">Loading inquiries…</p>
            ) : inquiries.length === 0 ? (
              <p className="text-sm text-white/40">
                No size inquiries yet for this product.
              </p>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.02] p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-white">{inq.customerName}</p>
                      <p className="text-sm text-white/50">{inq.customerEmail}</p>
                      {inq.notes && (
                        <p className="mt-1 text-xs text-white/35 italic">
                          &quot;{inq.notes}&quot;
                        </p>
                      )}
                      <p className="mt-1 text-xs text-white/40">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-fuchsia/30 bg-fuchsia/10 px-3 py-1 text-sm font-medium text-fuchsia">
                        Size {inq.desiredSize}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider
                          ${
                            inq.status === "pending"
                              ? "bg-amber-500/15 text-amber-400"
                              : inq.status === "notified"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-white/10 text-white/50"
                          }`}
                      >
                        {inq.status}
                      </span>
                      {inq.status === "pending" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={notifyingId === inq.id}
                          onClick={() => notifyOne(inq.id)}
                        >
                          Notify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
