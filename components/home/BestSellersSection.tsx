"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";

export function BestSellersSection() {
  const bestsellers = demoProducts.filter((p) => p.isBestSeller);
  const featured = bestsellers[0];
  const rest = bestsellers.slice(1, 5).map(toCardProduct);

  if (!featured) return null;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Most Wanted"
          title="Best Sellers"
          description="The pieces our community can't stop wearing — proven to turn heads."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Link
            href={`/products/${featured.slug}`}
            className="group relative min-h-[340px] overflow-hidden rounded-2xl border border-white/10 sm:min-h-[420px]"
          >
            <Image
              src={featured.images[0]}
              alt={featured.name}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-5 md:p-8">
              <span className="rounded-xl border border-white bg-white px-3 py-1 text-[10px] uppercase tracking-widest text-black shadow-[0_0_12px_rgb(255_255_255/0.6)]">
                Bestseller
              </span>
              <h3 className="mt-3 line-clamp-3 font-heading text-2xl text-white sm:text-3xl md:text-4xl">
                {featured.name}
              </h3>
              <p className="mt-2 text-silver">{formatCurrency(featured.price)}</p>
              <Button className="mt-4" size="sm">
                Shop Now
              </Button>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            {rest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
