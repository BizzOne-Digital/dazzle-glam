"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/products/ProductCard";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  StaggerGrid,
  MotionItem,
  HoverLift,
  FloatingOrbs,
  HeroTextReveal,
  motion,
} from "@/components/animations/PageMotion";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const tax = subtotal * 0.13;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <PageEnter className="relative py-20">
        <FloatingOrbs />
        <Container>
          <ScrollReveal direction="up">
            <EmptyState
              title="Your bag is empty"
              description="Discover statement pieces waiting to turn heads."
            >
              <Button asChild className="mt-6">
                <Link href="/shop">Shop Jewelry</Link>
              </Button>
            </EmptyState>
          </ScrollReveal>
          <div className="mt-16">
            <h2 className="font-heading text-2xl">Recommended</h2>
            <StaggerGrid className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4" stagger={0.08}>
              {demoProducts.slice(0, 4).map((p) => (
                <MotionItem key={p.id}>
                  <HoverLift>
                    <ProductCard product={toCardProduct(p)} />
                  </HoverLift>
                </MotionItem>
              ))}
            </StaggerGrid>
          </div>
        </Container>
      </PageEnter>
    );
  }

  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />
      <Container>
        <ScrollReveal direction="up">
          <HeroTextReveal eyebrow="Bag" title="Shopping Bag" align="left" />
        </ScrollReveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                layout
              >
                <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-heading text-base hover:text-fuchsia sm:text-lg line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-silver">{formatCurrency(item.price)}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded border border-white/15">
                        <button
                          type="button"
                          className="p-2"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-white/40 hover:text-fuchsia"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="shrink-0 text-sm text-silver sm:text-right">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </motion.div>
            ))}
          </div>

          <ScrollReveal direction="right" delay={0.1}>
            <aside className="h-fit rounded-2xl border border-silver/20 bg-black/50 p-6 backdrop-blur">
              <h2 className="font-heading text-2xl">Order Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-white/50">Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/50">Est. tax</dt>
                  <dd>{formatCurrency(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base">
                  <dt>Total</dt>
                  <dd className="text-fuchsia">{formatCurrency(total)}</dd>
                </div>
              </dl>
              <Button asChild fullWidth className="mt-6">
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="ghost" fullWidth className="mt-2">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </aside>
          </ScrollReveal>
        </div>
      </Container>
    </PageEnter>
  );
}
