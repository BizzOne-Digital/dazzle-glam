"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, Minus, Plus, Share2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductGrid } from "@/components/products/ProductGrid";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import {
  PageEnter,
  FloatingOrbs,
  motion,
} from "@/components/animations/PageMotion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = demoProducts.find((p) => p.slug === params.slug);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [openAcc, setOpenAcc] = useState("details");
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

  const add = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: qty,
    });
    toast.success("Added to bag");
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
                  <Image src={img} alt="" fill className="object-cover" sizes="120px" />
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
