"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { demoProducts, toCardProduct } from "@/lib/data/demo";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  StaggerGrid,
  MotionItem,
  HoverLift,
  FloatingOrbs,
  HeroTextReveal,
} from "@/components/animations/PageMotion";

export default function WishlistPage() {
  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />
      <Container>
        <ScrollReveal direction="up">
          <HeroTextReveal
            eyebrow="Saved"
            title="Wishlist"
            description="Pieces you love — ready when you are."
            align="left"
          />
        </ScrollReveal>

        <ScrollReveal direction="fade" delay={0.1} className="mt-10">
          <EmptyState
            title="Your wishlist is waiting"
            description="Tap the heart on any product to save it here. Meanwhile, explore bestsellers."
            className="py-12"
          >
            <Button asChild className="mt-4">
              <Link href="/shop">Browse Shop</Link>
            </Button>
          </EmptyState>
        </ScrollReveal>

        <StaggerGrid className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4" stagger={0.08}>
          {demoProducts
            .filter((p) => p.isBestSeller)
            .slice(0, 4)
            .map((p) => (
              <MotionItem key={p.id}>
                <HoverLift>
                  <ProductCard product={toCardProduct(p)} />
                </HoverLift>
              </MotionItem>
            ))}
        </StaggerGrid>
      </Container>
    </PageEnter>
  );
}
