"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type HeroContent = {
  eyebrow?: string;
  title?: string;
  scriptTitle?: string;
  description?: string;
  image?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
};

const DEFAULTS: Required<HeroContent> = {
  eyebrow: "Dazzle Glam Jewelry Collection",
  title: "Turn Heads.",
  scriptTitle: "Own the Room.",
  description:
    "Eye-popping jewelry designed to command attention, amplify your confidence and transform every look into a bold statement.",
  image: "/images/hero/campaign.png",
  primaryCta: "Shop New Arrivals",
  primaryHref: "/shop?sort=new",
  secondaryCta: "Explore Products",
  secondaryHref: "/shop",
};

export function HeroSection({ content }: { content?: HeroContent }) {
  const c = { ...DEFAULTS, ...content };
  const [imageSrc, setImageSrc] = useState(c.image || DEFAULTS.image);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  useEffect(() => {
    setImageSrc(c.image || DEFAULTS.image);
  }, [c.image]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-end overflow-x-hidden pb-16 pt-[9rem] sm:pb-20 sm:pt-[10rem] md:items-center md:pb-24 md:pt-[10rem]"
    >
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src={imageSrc}
          alt="Dazzle Glam statement jewelry campaign"
          fill
          priority
          className="object-cover object-[72%_center] sm:object-[68%_center]"
          sizes="100vw"
          onError={() => {
            if (imageSrc !== DEFAULTS.image) setImageSrc(DEFAULTS.image);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 to-transparent sm:via-black/10 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div className="grain absolute inset-0" />
      </motion.div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-4 text-[0.9rem] font-medium uppercase tracking-[0.32em] text-white/85 sm:mb-5 sm:text-[1.05rem] md:text-[1.15rem] lg:text-[1.35rem] xl:text-[1.6rem] sm:tracking-[0.38em]"
          >
            {c.eyebrow.includes("Glam") ? (
              <>
                {c.eyebrow.split(/Glam/i)[0]}
                <span className="text-fuchsia">Glam</span>
                {c.eyebrow.split(/Glam/i)[1] || ""}
              </>
            ) : (
              c.eyebrow
            )}
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-lg font-semibold leading-tight tracking-tight text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
            >
              {c.title}{" "}
              <span className="font-script text-fuchsia">{c.scriptTitle}</span>
            </motion.h1>
          </div>

          <span
            className="mt-2 block h-[3px] w-[min(100%,10rem)] rounded-full bg-gradient-to-r from-fuchsia via-fuchsia-glow to-transparent shadow-[0_0_18px_rgb(255_20_147/0.75)] sm:w-[14rem]"
            aria-hidden
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-7 mt-5 max-w-md text-base leading-relaxed text-white/75 sm:mb-8 sm:mt-6 sm:text-lg md:text-xl"
          >
            {c.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href={c.primaryHref}>
                {c.primaryCta} <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </Button>
            {c.secondaryCta && (
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full border-fuchsia/70 text-white hover:border-fuchsia hover:bg-fuchsia/10 sm:w-auto"
              >
                <Link href={c.secondaryHref}>{c.secondaryCta}</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
