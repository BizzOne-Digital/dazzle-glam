"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Instagram, X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  PageEnter,
  KenBurnsImage,
  HeroTextReveal,
  StaggerGrid,
  MotionItem,
  HoverLift,
  FloatingOrbs,
} from "@/components/animations/PageMotion";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { MarqueeText } from "@/components/animations/Marquee";
import { brand, marqueeWords } from "@/config/site";
import { galleryItems } from "@/lib/data/gallery";

const all = galleryItems;
const heroImage = "/images/hero/gallery-campaign.png";

const filters = ["all", "product", "lifestyle", "editorial"] as const;

export default function GalleryPage() {
  const [cat, setCat] = useState<(typeof filters)[number]>("all");
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const items = useMemo(
    () => (cat === "all" ? all : all.filter((i) => i.cat === cat)),
    [cat]
  );

  const open = (i: number) => setActive(i);
  const close = () => setActive(null);
  const prev = () =>
    setActive((a) => (a === null ? null : (a - 1 + items.length) % items.length));
  const next = () =>
    setActive((a) => (a === null ? null : (a + 1) % items.length));

  return (
    <PageEnter className="relative pb-24 pt-8">
      <FloatingOrbs />

      {/* Hero */}
      <div className="relative mb-12 h-56 overflow-hidden md:mb-16 md:h-80 lg:h-[22rem]">
        <KenBurnsImage>
          <Image
            src={heroImage}
            alt="Dazzle Glam gallery campaign"
            fill
            className="object-cover object-[82%_center] sm:object-[72%_center]"
            priority
            sizes="100vw"
          />
        </KenBurnsImage>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/35" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(0_0_0/0.35)_100%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
        <div className="absolute inset-0 flex items-center justify-center px-4 md:justify-start md:pl-10 lg:pl-16">
          <HeroTextReveal
            eyebrow="Portfolio"
            title="Gallery"
            description="Customer looks, product close-ups, and campaign moments — scroll, filter, and feel the glam."
          />
        </div>
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-fuchsia to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <Container>
        <ScrollReveal direction="up">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md text-sm text-white/50">
              Hover any frame for a closer energy. Tap to open the lightbox.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href={brand.instagramUrl} target="_blank" rel="noreferrer">
                <Instagram className="h-4 w-4" />
                <span className="sm:hidden">Instagram</span>
                <span className="hidden sm:inline">Follow {brand.instagram}</span>
              </Link>
            </Button>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="left" delay={0.05}>
          <div className="mb-10 flex flex-wrap gap-2">
            {filters.map((c) => (
              <motion.button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`relative overflow-hidden rounded-sm border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
                  cat === c
                    ? "border-fuchsia text-white"
                    : "border-white/15 text-silver hover:border-silver"
                }`}
                whileHover={reduced ? undefined : { scale: 1.04 }}
                whileTap={reduced ? undefined : { scale: 0.96 }}
              >
                {cat === c && (
                  <motion.span
                    layoutId="gallery-filter"
                    className="absolute inset-0 bg-fuchsia/25"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{c}</span>
              </motion.button>
            ))}
          </div>
        </ScrollReveal>

        {/* Masonry-ish animated grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cat}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <StaggerGrid
              className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
              stagger={0.05}
            >
              {items.map((item, i) => (
                <MotionItem
                  key={`${item.src}-${i}`}
                  className={item.tall ? "row-span-2" : ""}
                >
                  <HoverLift className="h-full">
                    <button
                      type="button"
                      onClick={() => open(i)}
                      className={`group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-graphite ${
                        item.tall ? "aspect-[3/5]" : "aspect-[3/4]"
                      }`}
                    >
                      <Image
                        src={item.src}
                        alt={item.caption}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                      <motion.span
                        className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 px-2 py-1 text-[9px] uppercase tracking-wider text-white/80 opacity-0 backdrop-blur-sm group-hover:opacity-100"
                        initial={false}
                      >
                        View
                      </motion.span>
                    </button>
                  </HoverLift>
                </MotionItem>
              ))}
            </StaggerGrid>
          </motion.div>
        </AnimatePresence>

        {items.length === 0 && (
          <p className="py-20 text-center text-white/40">No looks in this filter yet.</p>
        )}
      </Container>

      <div className="mt-20">
        <MarqueeText words={[...marqueeWords, "GALLERY", "SPARKLE"]} />
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && items[active] && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white transition hover:border-fuchsia hover:text-fuchsia"
              onClick={close}
              aria-label="Close"
            >
              <X />
            </button>

            <button
              type="button"
              className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-fuchsia sm:inline-flex md:left-6"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-fuchsia sm:inline-flex md:right-6"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-16 z-10 flex items-center justify-center gap-4 sm:hidden">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              key={items[active].src}
              className="relative h-[65vh] w-full max-w-4xl sm:h-[75vh]"
              initial={reduced ? false : { opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={items[active].src}
                alt={items[active].caption}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageEnter>
  );
}
