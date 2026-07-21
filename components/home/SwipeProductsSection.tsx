"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { demoProducts, toCardProduct } from "@/lib/data/demo";

/** Swipeable product rail — replaces collections on homepage */
export function SwipeProductsSection() {
  const scroller = useRef<HTMLDivElement>(null);
  const products = demoProducts.map(toCardProduct);

  const scroll = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  return (
    <section id="products" className="py-14 md:py-28">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Our Products"
            title="Shop Every Sparkle"
            description="Eighteen statement rings curated to turn heads — swipe to explore, tap to dazzle."
            align="left"
            className="mb-0"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-silver transition hover:border-fuchsia hover:text-fuchsia"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-silver transition hover:border-fuchsia hover:text-fuchsia"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/shop">View all</Link>
            </Button>
          </div>
        </div>

        <div
          ref={scroller}
          className="-mx-4 mt-10 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:gap-5 sm:px-0"
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="w-[min(72vw,260px)] shrink-0 snap-start sm:w-[260px] md:w-[280px]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
