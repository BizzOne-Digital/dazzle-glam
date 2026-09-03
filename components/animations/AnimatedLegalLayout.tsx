"use client";

import type { ReactNode } from "react";
import Image from "next/image";
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
} from "@/components/animations/PageMotion";
import { placeholderImages } from "@/config/site";

export function AnimatedLegalLayout({
  title,
  images = placeholderImages.gallery.slice(0, 3),
  children,
}: {
  title: string;
  images?: string[];
  children: ReactNode;
}) {
  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />
      <div className="relative mb-10 h-40 overflow-hidden md:h-52">
        <KenBurnsImage>
          <Image
            src={placeholderImages.editorial[0]}
            alt=""
            fill
            className="object-cover opacity-50"
            priority
          />
        </KenBurnsImage>
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <HeroTextReveal eyebrow="Policies" title={title} />
        </div>
      </div>
      <Container size="md">
        <StaggerGrid className="mb-8 grid grid-cols-3 gap-2" stagger={0.08}>
          {images.map((src) => (
            <MotionItem key={src}>
              <HoverLift>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10">
                  <Image src={src} alt="" fill className="object-cover" sizes="30vw" />
                </div>
              </HoverLift>
            </MotionItem>
          ))}
        </StaggerGrid>
        <ScrollReveal direction="up">
          <article className="prose prose-invert max-w-none space-y-4 text-white/70">
            {children}
          </article>
        </ScrollReveal>
      </Container>
    </PageEnter>
  );
}
