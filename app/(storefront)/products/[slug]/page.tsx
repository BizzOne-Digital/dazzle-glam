"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Minus, Plus, Share2, Truck, Mail } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductGrid } from "@/components/products/ProductGrid";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import { submitSizeInquiry } from "@/actions/sizeInquiry";
import {
  PageEnter,
  FloatingOrbs,
  motion,
} from "@/components/animations/PageMotion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const ALL_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12"];

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = demoProducts.find((p) => p.slug === params.slug);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [openAcc, setOpenAcc] = useState("details");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  // Live sizes fetched from API (admin-managed via MongoDB)
  const [liveSizes, setLiveSizes] = useState<string[] | null>(null);

  useEffect(() => {
    if (!product) return;
    fetch(`/api/products/${product.slug}/sizes`)
      .then((r) => r.json())
      .then((data) => setLiveSizes(data.sizes ?? []))
      .catch(() => setLiveSizes(product.sizes));
  }, [product]);

  // Use live sizes if loaded, otherwise fall back to demo data
  const availableSizes = liveSizes ?? product?.sizes ?? [];

  // Inquiry form state
  const [showInquiry, setShowInquiry] = useState(false);
  const [inquirySize, setInquirySize] = useState("");
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const related = useMemo(() => {
    if (!product) return [];
    return demoProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4)
      .map(toCardProduct);
  }, [product]);

  if (!product) {
    return (
      <Container className="py-40 text-center">
        <h1 className="font-heading text-4xl">Piece not found</h1>
        <Button asChild className="mt-6">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </Container>
    );
  }

  const hasSizes = availableSizes.length > 0;

  const add = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      toast.error("Please select a size first");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: qty,
      variantLabel: selectedSize ? `Size ${selectedSize}` : undefined,
    });
    toast.success("Added to bag");
  };

  const handleSizeInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySize || !inquiryName || !inquiryEmail) return;
    setInquiryLoading(true);
    const result = await submitSizeInquiry({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      customerName: inquiryName,
      customerEmail: inquiryEmail,
      desiredSize: inquirySize,
      notes: inquiryNotes,
    });
    setInquiryLoading(false);
    if (result.success) {
      toast.success(result.message);
      setShowInquiry(false);
      setInquiryName("");
      setInquiryEmail("");
      setInquirySize("");
      setInquiryNotes("");
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  return (
    <PageEnter className="relative pb-28 pt-8 md:pb-20">
      <FloatingOrbs />
      <Container>
        <div className="grid gap-10 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <div>
              <motion.div
                className="relative aspect-square overflow-hidden rounded-2xl border border-white/10"
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src={product.images[active]}
                  alt={product.name}
                  fill
                  className={`object-cover transition duration-500 ${zoom ? "scale-125" : "scale-100"}`}
                  sizes="(max-width:1024px) 100vw, 50vw"
                  priority
                />
                {product.badge && (
                  <div className="absolute left-4 top-4">
                    <Badge>{product.badge}</Badge>
                  </div>
                )}
              </motion.div>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative aspect-square overflow-hidden rounded-lg border ${
                      active === i ? "border-fuchsia" : "border-white/10"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="120px"
                      onError={(e) => {
                        // hide thumbnails whose image file doesn't exist yet
                        (e.currentTarget.closest("button") as HTMLElement).style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.1}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">
                {product.category}
              </p>
              <h1 className="mt-2 font-heading text-3xl text-white md:text-5xl">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-2xl text-silver">{formatCurrency(product.price)}</span>
              </div>
              <p className="mt-5 text-white/65">{product.shortDescription}</p>
              <p className="mt-3 text-sm text-white/45">
                Materials: {product.materials.join(", ")}
              </p>
              <p
                className={`mt-2 text-sm ${product.stock > 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} left`
                    : "In stock"
                  : "Out of stock"}
              </p>

              {/* ── Size Selector ── */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/70">
                    Ring Size
                    {selectedSize && (
                      <span className="ml-2 text-fuchsia">— {selectedSize}</span>
                    )}
                  </p>
                </div>

                {hasSizes ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SIZES.map((size) => {
                        const available = availableSizes.includes(size);
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!available}
                            onClick={() => {
                              setSelectedSize(size);
                              setSizeError(false);
                            }}
                            className={`relative h-10 w-10 rounded-lg border text-sm font-medium transition
                              ${
                                isSelected
                                  ? "border-fuchsia bg-fuchsia text-white"
                                  : available
                                    ? "border-white/20 text-white hover:border-fuchsia hover:text-fuchsia"
                                    : "cursor-not-allowed border-white/8 text-white/20"
                              }`}
                          >
                            {size}
                            {!available && (
                              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rotate-45 bg-white/15" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {sizeError && (
                      <p className="mt-2 text-xs text-red-400">
                        Please select a size to continue
                      </p>
                    )}
                    <p className="mt-2 text-xs text-white/40">
                      Don&apos;t see your size?{" "}
                      <button
                        type="button"
                        className="text-fuchsia underline-offset-2 hover:underline"
                        onClick={() => setShowInquiry(true)}
                      >
                        Request it
                      </button>
                    </p>
                  </>
                ) : (
                  /* No sizes set — show inquiry prompt */
                  <div className="rounded-xl border border-fuchsia/20 bg-fuchsia/5 p-4">
                    <p className="text-sm text-white/70">
                      Sizes for this piece are being arranged. Let us know your
                      size and we&apos;ll email you the moment it&apos;s available.
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 border-fuchsia/40 text-fuchsia hover:bg-fuchsia/10"
                      onClick={() => setShowInquiry(true)}
                    >
                      <Mail className="h-4 w-4" />
                      Inquire about size
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Size Inquiry Form ── */}
              {showInquiry && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-xl border border-fuchsia/25 bg-white/[0.03] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-heading text-lg text-white">
                      Size Availability Request
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowInquiry(false)}
                      className="text-white/40 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSizeInquiry} className="space-y-3">
                    {/* Size choice */}
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/60">
                        Desired Size <span className="text-fuchsia">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ALL_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setInquirySize(size)}
                            className={`h-9 w-9 rounded-lg border text-sm font-medium transition
                              ${
                                inquirySize === size
                                  ? "border-fuchsia bg-fuchsia text-white"
                                  : "border-white/20 text-white hover:border-fuchsia"
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/60">
                          Your Name <span className="text-fuchsia">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-fuchsia focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/60">
                          Email <span className="text-fuchsia">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-fuchsia focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/60">
                        Notes (optional)
                      </label>
                      <textarea
                        value={inquiryNotes}
                        onChange={(e) => setInquiryNotes(e.target.value)}
                        placeholder="Anything else we should know?"
                        rows={2}
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-fuchsia focus:outline-none resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      loading={inquiryLoading}
                      disabled={!inquirySize || !inquiryName || !inquiryEmail}
                      className="w-full"
                    >
                      <Mail className="h-4 w-4" />
                      Submit Request
                    </Button>
                  </form>
                </motion.div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex items-center rounded-sm border border-white/15">
                  <button
                    type="button"
                    className="p-3"
                    aria-label="Decrease quantity"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center">{qty}</span>
                  <button
                    type="button"
                    className="p-3"
                    aria-label="Increase quantity"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button onClick={add} disabled={product.stock < 1} className="flex-1">
                  Add to Bag
                </Button>
              </div>

              <div className="mt-3 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={add}>
                  Buy Now
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Wishlist"
                  onClick={() => toast.success("Saved to wishlist")}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Share"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success("Link copied");
                  }}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <p className="mt-6 flex items-start gap-2 text-sm text-silver">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia" />
                <span>Free shipping on qualifying orders · Easy returns</span>
              </p>

              <div className="mt-8 divide-y divide-white/10 border-t border-white/10">
                {[
                  { id: "details", title: "Description", body: product.description },
                  {
                    id: "care",
                    title: "Care Instructions",
                    body: product.careInstructions,
                  },
                  {
                    id: "ship",
                    title: "Shipping & Returns",
                    body: "Canada-wide delivery. Most orders ship within 2–4 business days. Returns accepted within 14 days for unworn items in original packaging.",
                  },
                ].map((a) => (
                  <div key={a.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-[0.2em]"
                      onClick={() => setOpenAcc(openAcc === a.id ? "" : a.id)}
                    >
                      {a.title}
                      <span>{openAcc === a.id ? "−" : "+"}</span>
                    </button>
                    {openAcc === a.id && (
                      <p className="pb-4 text-sm leading-relaxed text-white/60">{a.body}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal direction="up" className="mt-20">
          <h2 className="font-heading text-3xl text-white">You May Also Love</h2>
          <div className="mt-8">
            <ProductGrid products={related} columns={4} />
          </div>
        </ScrollReveal>
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 p-3 pb-safe backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm">{product.name}</p>
            <p className="text-silver">{formatCurrency(product.price)}</p>
          </div>
          <Button className="shrink-0" onClick={add}>
            Add to Bag
          </Button>
        </div>
      </div>
    </PageEnter>
  );
}
