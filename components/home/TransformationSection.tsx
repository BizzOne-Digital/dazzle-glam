"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { placeholderImages } from "@/config/site";

export function TransformationSection() {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = (clientX: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(95, Math.max(5, x)));
  };

  return (
    <section className="border-y border-white/5 bg-charcoal py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Glam Transformation"
          title="From Simple to Show-Stopping"
          description="Slide to see how the right jewelry elevates a look from quiet to unforgettable."
          align="center"
        />

        <div
          className="relative mx-auto mt-12 aspect-[16/10] max-w-4xl overflow-hidden rounded-2xl border border-white/10 select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            update(e.clientX, e.currentTarget);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current) return;
            update(e.clientX, e.currentTarget);
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
        >
          <Image
            src={placeholderImages.editorial[2]}
            alt="After — fully glam styled look"
            fill
            className="object-cover"
            sizes="900px"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${pos}%` }}
          >
            <div className="relative h-full" style={{ width: `${(100 / pos) * 100}%` }}>
              <Image
                src={placeholderImages.editorial[3]}
                alt="Before — simple look"
                fill
                className="object-cover"
                sizes="900px"
              />
            </div>
          </div>
          <div
            className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_20px_white]"
            style={{ left: `${pos}%` }}
          >
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/80 text-xs text-white">
              ↔
            </div>
          </div>
          <span className="absolute left-4 top-4 rounded bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-silver">
            Before
          </span>
          <span className="absolute right-4 top-4 rounded bg-fuchsia/80 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
            After
          </span>
        </div>
      </Container>
    </section>
  );
}
