"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { formatCurrency } from "@/lib/utils";
import { demoProducts } from "@/lib/data/demo";

export function FeaturedProductSection() {
  const product =
    demoProducts.find((p) => p.slug === "sapphire-birthstone-promise-ring") ||
    demoProducts.find((p) => p.isFeatured) ||
    demoProducts[0];

  const featuredImage =
    product.images[1] ||
    "/images/products/Brilliant-Womens-Sapphire-2.png";

  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };

  const onLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
    }
  };

  const displayName =
    product.name.length > 48
      ? product.name.replace(/^Women'?s\s+/i, "").replace(/^Men'?s\s+/i, "")
      : product.name;

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia/25 blur-[100px]" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Product spotlight */}
          <div className="relative mx-auto flex aspect-square w-full max-w-[min(100%,320px)] items-center justify-center sm:max-w-[380px] md:max-w-[420px]">
            <div className="absolute inset-[6%] rounded-full border border-dashed border-silver/25 sm:inset-4" />
            <div className="absolute inset-0 rounded-full border border-white/10" />

            <div
              ref={ref}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              className="relative z-10 aspect-square w-[70%] max-w-[300px] overflow-hidden rounded-full border border-silver/40 shadow-[0_0_50px_rgb(255_20_147/0.4)] transition-transform duration-200"
            >
              <Image
                src={featuredImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width:768px) 260px, 300px"
                priority
              />
            </div>

            <span className="absolute left-1 top-[28%] z-20 max-w-[42%] truncate rounded-full border border-white/20 bg-black/70 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.15em] text-silver backdrop-blur-md sm:left-4 sm:max-w-none sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
              {product.materials[0] || "Crystal"}
            </span>
            <span className="absolute bottom-[26%] right-1 z-20 max-w-[42%] truncate rounded-full border border-white/20 bg-black/70 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.15em] text-silver backdrop-blur-md sm:right-4 sm:max-w-none sm:px-3 sm:text-[10px] sm:tracking-[0.2em]">
              {product.colors[0] || "Silver"}
            </span>
          </div>

          {/* Copy */}
          <div className="text-center lg:text-left">
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-fuchsia">
              Featured Statement Piece
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
              {displayName}
            </h2>
            <p className="mt-3 text-2xl font-medium text-silver">
              {formatCurrency(product.price)}
            </p>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/70 lg:mx-0">
              {product.shortDescription || product.description.slice(0, 140)}
            </p>
            <p className="mt-3 text-sm text-white/45">
              Material: {product.materials.join(" · ")}
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/products/${product.slug}`}>View Details</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href={`/products/${product.slug}`}>Add to Bag</Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
