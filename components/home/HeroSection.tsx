"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Gem, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const HERO_IMAGE = "/images/hero/campaign.png";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-end overflow-x-hidden pb-16 pt-[9.5rem] sm:pb-20 sm:pt-[10.5rem] md:items-center md:pb-24 md:pt-[10.5rem]"
    >
      {/* Background */}
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt="Dazzle Glam statement jewelry campaign"
          fill
          priority
          className="object-cover object-[72%_center] sm:object-[68%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25 sm:via-black/75 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
        <div className="grain absolute inset-0" />
      </motion.div>

      {/* Soft gem glows (corners) */}
      <div
        className="pointer-events-none absolute -bottom-8 -left-6 z-[6] h-40 w-40 rounded-full bg-fuchsia/35 blur-[60px] sm:h-52 sm:w-52"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-8 z-[6] h-44 w-44 rounded-full bg-fuchsia/30 blur-[70px] sm:h-56 sm:w-56"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[18%] z-[6] hidden h-2 w-2 rounded-full bg-fuchsia/80 shadow-[0_0_12px_#ff1493] sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[18%] top-[28%] z-[6] hidden h-1.5 w-1.5 rotate-45 bg-fuchsia/60 sm:block"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mb-3 text-[10px] font-medium uppercase tracking-[0.32em] text-white/85 sm:mb-4 sm:text-[11px] sm:tracking-[0.38em]"
          >
            Dazzle{" "}
            <span className="text-fuchsia">Glam</span> Jewelry Collection
          </motion.p>

          <div className="overflow-hidden">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-heading text-[2.35rem] font-semibold leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            >
              Turn Heads.
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.55 }}
            className="relative mt-1 sm:mt-0"
          >
            <p className="font-script text-[2.4rem] leading-none text-fuchsia sm:text-5xl md:text-6xl lg:text-7xl">
              Own the Room.
            </p>
            <span
              className="mt-1 block h-[3px] w-[min(100%,14rem)] rounded-full bg-gradient-to-r from-fuchsia via-fuchsia-glow to-transparent shadow-[0_0_18px_rgb(255_20_147/0.75)] sm:w-[18rem]"
              aria-hidden
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-7 mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:mb-8 sm:mt-6 sm:text-base md:text-lg"
          >
            Eye-popping jewelry designed to command attention, amplify your
            confidence and transform every look into a bold statement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/shop?sort=new">
                Shop New Arrivals <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full border-fuchsia/70 text-white hover:border-fuchsia hover:bg-fuchsia/10 sm:w-auto"
            >
              <Link href="/shop">
                Explore Products <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mt-8 flex flex-col gap-3 text-[10px] uppercase tracking-[0.16em] text-white/80 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-3 sm:text-[11px] sm:tracking-[0.18em]"
          >
            <span className="flex items-center gap-2">
              <Gem className="h-4 w-4 shrink-0 text-fuchsia" />
              <span>
                <span className="text-white">Premium Quality</span>
                <span className="text-white/50"> — Finest materials</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 shrink-0 text-fuchsia" />
              <span>
                <span className="text-white">Secure Payment</span>
                <span className="text-white/50"> — 100% protected</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-fuchsia" />
              <span>
                <span className="text-white">Satisfaction Guarantee</span>
                <span className="text-white/50"> — Love it or return it</span>
              </span>
            </span>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
