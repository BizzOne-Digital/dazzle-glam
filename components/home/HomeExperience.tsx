"use client";

import type { ReactNode } from "react";
import { ScrollReveal, SnapSection } from "@/components/animations/ScrollReveal";
import { HeroSection } from "@/components/home/HeroSection";
import { SwipeProductsSection } from "@/components/home/SwipeProductsSection";
import { ManifestoSection } from "@/components/home/ManifestoSection";
import { FeaturedProductSection } from "@/components/home/FeaturedProductSection";
import { BestSellersSection } from "@/components/home/BestSellersSection";
import { GallerySection } from "@/components/home/GallerySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { MarqueeText } from "@/components/animations/Marquee";
import { marqueeWords } from "@/config/site";

function RevealBlock({
  children,
  direction,
  delay = 0,
}: {
  children: ReactNode;
  direction: "left" | "right" | "up" | "down" | "scale";
  delay?: number;
}) {
  return (
    <ScrollReveal direction={direction} delay={delay} duration={0.9}>
      {children}
    </ScrollReveal>
  );
}

export function HomeExperience() {
  return (
    <div className="home-snap-root">
      <SnapSection>
        <HeroSection />
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="up">
          <MarqueeText words={marqueeWords} />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="left">
          <SwipeProductsSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="left">
          <ManifestoSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="scale">
          <FeaturedProductSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="right" delay={0.05}>
          <BestSellersSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="left">
          <GallerySection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="right">
          <TestimonialsSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="up">
          <NewsletterSection />
        </RevealBlock>
      </SnapSection>

      <SnapSection>
        <RevealBlock direction="scale">
          <FinalCtaSection />
        </RevealBlock>
      </SnapSection>
    </div>
  );
}
