"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import {
  PageEnter,
  KenBurnsImage,
  HeroTextReveal,
  FloatingOrbs,
} from "@/components/animations/PageMotion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

const categories = ["all", "rings"];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [filter, setFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState(100);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    const f = searchParams.get("filter");
    const s = searchParams.get("sort");
    if (cat === "rings") setCategory("rings");
    if (f === "new" || f === "bestsellers") setFilter(f);
    if (s === "new" || s === "price-asc" || s === "price-desc" || s === "name") {
      setSort(s);
    }
  }, [searchParams]);

  const products = useMemo(() => {
    let list = [...demoProducts];
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s)
      );
    }
    if (filter === "new") list = list.filter((p) => p.isNewArrival);
    if (filter === "bestsellers") list = list.filter((p) => p.isBestSeller);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    list = list.filter((p) => p.price <= maxPrice);

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "new") list.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    return list.map(toCardProduct);
  }, [q, category, sort, filter, maxPrice, inStockOnly]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-silver">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-sm border px-3 py-2.5 text-xs uppercase tracking-wider transition ${
                category === c
                  ? "border-fuchsia bg-fuchsia/20 text-white"
                  : "border-white/15 text-silver hover:border-silver"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-silver">Filter</p>
        <div className="flex flex-wrap gap-2">
          {["all", "new", "bestsellers"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-sm border px-3 py-2.5 text-xs uppercase tracking-wider ${
                filter === f ? "border-fuchsia text-fuchsia" : "border-white/15 text-silver"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-silver">
          Max price: ${maxPrice}
        </label>
        <input
          type="range"
          min={30}
          max={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-fuchsia"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="accent-fuchsia"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />
      <div className="relative mb-12 h-56 overflow-hidden md:h-72 lg:h-80">
        <KenBurnsImage>
          <Image
            src="/images/hero/products-campaign.png"
            alt="Shop Dazzle Glam jewelry"
            fill
            className="object-cover object-[78%_center] sm:object-[70%_center]"
            priority
            sizes="100vw"
          />
        </KenBurnsImage>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0 flex items-center justify-center px-4 md:justify-start md:pl-10 lg:pl-16">
          <HeroTextReveal
            eyebrow="Boutique"
            title="Shop All Jewelry"
            description="Statement Rings — Bold Energy, Luminous Finish."
          />
        </div>
      </div>

      <Container>
        <ScrollReveal direction="up">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 basis-full sm:min-w-[220px] sm:basis-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jewelry…"
                className="pl-10"
                aria-label="Search products"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 min-w-0 flex-1 rounded-sm border border-white/15 bg-black px-3 text-sm text-white sm:flex-none"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 lg:hidden"
              onClick={() => setDrawer(true)}
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <ScrollReveal direction="left">{Filters}</ScrollReveal>
          </aside>
          <div>
            {products.length === 0 ? (
              <EmptyState
                title="No sparkle matches"
                description="Try adjusting filters or search terms."
              />
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </Container>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close filters"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-charcoal p-6 pb-safe">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-2xl">Filters</h2>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close" className="inline-flex h-11 w-11 items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
            <Button fullWidth className="mt-6" onClick={() => setDrawer(false)}>
              Show {products.length} results
            </Button>
          </div>
        </div>
      )}
    </PageEnter>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-white/40">
          Loading shop…
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
