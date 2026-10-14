"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { demoTestimonials } from "@/lib/data/demo";

export function TestimonialsSection() {
  const [i, setI] = useState(0);
  const t = demoTestimonials[i];

  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Love Notes"
          title="What Our Glam Fam Says"
          description="Verified buyers who turned heads and lived to tell the story."
          align="center"
        />

        <div className="relative mx-auto mt-10 max-w-3xl rounded-2xl border border-silver/20 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-8 md:p-12">
          <Quote className="absolute left-4 top-4 h-8 w-8 text-fuchsia/40 sm:left-6 sm:top-6 sm:h-10 sm:w-10" />
          <div className="flex flex-col items-center text-center">
            {t.image && (
              <div className="relative mb-5 h-16 w-16 overflow-hidden rounded-full border border-silver/30">
                <Image src={t.image} alt={t.name} fill className="object-cover" />
              </div>
            )}
            <div className="mb-4 flex gap-1">
              {Array.from({ length: t.rating }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-fuchsia text-fuchsia" />
              ))}
            </div>
            <p className="font-heading text-xl leading-relaxed text-white sm:text-2xl md:text-3xl">
              “{t.review}”
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-silver">
              {t.name}
              {t.isVerified && (
                <span className="ml-2 text-fuchsia">· Verified Buyer</span>
              )}
            </p>
            {t.productName && (
              <p className="mt-2 max-w-full px-1 text-xs text-white/45 line-clamp-2 break-words">
                Purchased: {t.productName}
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-3">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => setI((v) => (v - 1 + demoTestimonials.length) % demoTestimonials.length)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-silver hover:border-fuchsia hover:text-fuchsia sm:h-11 sm:w-11"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-0.5 sm:gap-1">
              {demoTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to testimonial ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className="inline-flex h-10 w-8 items-center justify-center sm:h-11 sm:w-11"
                >
                  <span
                    className={`h-1.5 rounded-full transition ${idx === i ? "w-5 bg-fuchsia sm:w-6" : "w-4 bg-white/20 sm:w-6"}`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next"
              onClick={() => setI((v) => (v + 1) % demoTestimonials.length)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-silver hover:border-fuchsia hover:text-fuchsia sm:h-11 sm:w-11"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
