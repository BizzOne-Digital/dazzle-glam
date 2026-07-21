"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { brand } from "@/config/site";
import { galleryItems } from "@/lib/data/gallery";

const items = galleryItems.slice(0, 8).map((g, i) => ({
  id: `g${i}`,
  src: g.src,
  caption: g.caption,
}));

export function GallerySection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Gallery"
          title="Glam in the Wild"
          description="Customer looks, product close-ups, and editorial moments from the Dazzle Glam universe."
          action={
            <Button asChild variant="secondary" size="sm">
              <Link href={brand.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" /> {brand.instagram}
              </Link>
            </Button>
          }
        />

        <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={item.src}
                alt={item.caption}
                width={400}
                height={i % 3 === 0 ? 520 : 360}
                className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="text-xs text-white">{item.caption}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="ghost">
            <Link href="/gallery">View Full Gallery</Link>
          </Button>
        </div>
      </Container>

      {active !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-white"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[70vh] w-full max-w-3xl">
            <Image
              src={items[active].src}
              alt={items[active].caption}
              fill
              className="object-contain"
              sizes="800px"
            />
          </div>
        </div>
      )}
    </section>
  );
}
