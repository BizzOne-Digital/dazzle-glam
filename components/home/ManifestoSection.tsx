"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { placeholderImages } from "@/config/site";

export function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl overflow-hidden md:grid-cols-2">
        <div className="relative min-h-[320px] md:min-h-[560px]">
          <motion.div style={{ y }} className="absolute inset-[-10%]">
            <Image
              src={placeholderImages.editorial[0]}
              alt="Fashion editorial — Dazzle Glam brand"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
          <div className="absolute -right-10 top-1/4 h-48 w-48 rotate-[-18deg] rounded-full bg-fuchsia/40 blur-3xl" />
          <div className="absolute bottom-10 left-10 font-heading text-[8rem] leading-none text-white/10">
            “
          </div>
        </div>

        <div className="flex flex-col justify-center bg-charcoal px-5 py-12 sm:px-8 sm:py-16 md:px-14 lg:px-20">
          <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-fuchsia">
            Brand Manifesto
          </p>
          <h2 className="font-heading text-3xl leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Jewelry Should Never Whisper
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
            We create pieces for women who refuse to blend in. Every design is
            selected to amplify personality, elevate everyday moments and turn
            confidence into something visible.
          </p>
          <p className="mt-4 font-script text-2xl text-fuchsia-glow">
            So glam it up!
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/about">Discover Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
