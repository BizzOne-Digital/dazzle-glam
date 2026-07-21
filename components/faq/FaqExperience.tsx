"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  KenBurnsImage,
  HeroTextReveal,
  StaggerGrid,
  MotionItem,
  HoverLift,
  FloatingOrbs,
  motion,
} from "@/components/animations/PageMotion";
import { placeholderImages } from "@/config/site";

const faqs = [
  {
    q: "Do you ship across Canada?",
    a: "Yes — we offer Canada-wide delivery with tracked shipping options.",
  },
  {
    q: "Are the stones real diamonds?",
    a: "Our collection features cubic zirconia, crystal, and sterling silver pieces curated for high-glam impact at accessible prices.",
  },
  {
    q: "How do I care for my jewelry?",
    a: "Avoid water, perfume, and harsh chemicals. Store pieces in a soft pouch and wipe with a jewelry cloth.",
  },
  {
    q: "Can I request styling help?",
    a: "Absolutely. Contact us for personal styling and event glam.",
  },
];

export function FaqExperience() {
  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />

      <div className="relative mb-10 h-44 overflow-hidden md:h-56">
        <KenBurnsImage>
          <Image
            src={placeholderImages.hero[0]}
            alt=""
            fill
            className="object-cover opacity-50"
            priority
          />
        </KenBurnsImage>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroTextReveal eyebrow="Help" title="FAQ" />
        </div>
      </div>

      <Container size="md">
        <StaggerGrid className="mb-10 grid grid-cols-2 gap-2 sm:grid-cols-4" stagger={0.08}>
          {placeholderImages.gallery.slice(0, 4).map((src) => (
            <MotionItem key={src}>
              <HoverLift>
                <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  <Image src={src} alt="" fill className="object-cover" sizes="20vw" />
                </div>
              </HoverLift>
            </MotionItem>
          ))}
        </StaggerGrid>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <ScrollReveal key={f.q} direction="up" delay={i * 0.05}>
              <motion.details
                className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 open:border-fuchsia/40"
                whileHover={{ borderColor: "rgba(255,20,147,0.35)" }}
              >
                <summary className="cursor-pointer list-none font-heading text-xl text-white marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {f.q}
                    <span className="text-fuchsia transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <motion.p
                  className="mt-3 text-white/60"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {f.a}
                </motion.p>
              </motion.details>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="fade" className="mt-10">
          <p className="text-sm text-white/50">
            Still need help?{" "}
            <Link href="/contact" className="text-fuchsia hover:underline">
              Contact us
            </Link>
          </p>
        </ScrollReveal>
      </Container>
    </PageEnter>
  );
}
