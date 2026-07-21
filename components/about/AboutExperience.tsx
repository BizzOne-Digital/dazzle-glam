"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  KenBurnsImage,
  HeroTextReveal,
  StaggerGrid,
  MotionItem,
  HoverLift,
  ParallaxBlock,
  FloatingOrbs,
  motion,
} from "@/components/animations/PageMotion";
import { brand, placeholderImages } from "@/config/site";

export function AboutExperience() {
  const imgs = [
    ...placeholderImages.editorial.slice(0, 2),
    ...placeholderImages.lifestyle.slice(0, 2),
  ];

  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />

      <div className="relative h-[58vh] min-h-[380px] overflow-hidden md:h-[64vh]">
        <KenBurnsImage>
          <Image
            src="/images/hero/about-campaign.png"
            alt="Dazzle Glam brand story"
            fill
            className="object-cover object-[78%_18%] sm:object-[72%_22%] md:object-[68%_20%]"
            priority
            sizes="100vw"
          />
        </KenBurnsImage>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/45" />
        <div className="absolute inset-0 flex items-center md:items-center">
          <Container className="pt-6 pb-8 md:pt-2 md:pb-10">
            <HeroTextReveal
              eyebrow="Our Story"
              title="Jewelry That Breaks the Mold"
              align="left"
            />
          </Container>
        </div>
      </div>

      <Container className="py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal direction="left">
            <SectionHeading
              eyebrow="Mission"
              title="Amplify Character. Own the Room."
              description="We believe jewelry should break the mold, amplify character, and transform everyday moments into bold statements of artistic confidence."
            />
            <p className="text-white/60">
              Founded by {brand.clientName}, {brand.name} was built for women between 15 and 50 who
              want eye-popping pieces that command attention from across the room — without
              whispering.
            </p>
            <motion.p
              className="mt-4 font-script text-3xl text-fuchsia-glow"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              So glam it up!
            </motion.p>
          </ScrollReveal>

          <StaggerGrid className="grid grid-cols-2 gap-3" stagger={0.1}>
            {imgs.slice(1, 4).map((src) => (
              <MotionItem key={src}>
                <HoverLift>
                  <ParallaxBlock className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10" speed={24}>
                    <Image src={src} alt="Brand imagery" fill className="object-cover" sizes="25vw" />
                  </ParallaxBlock>
                </HoverLift>
              </MotionItem>
            ))}
            <MotionItem>
              <HoverLift>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                  <Image
                    src={placeholderImages.rings[0]}
                    alt="Signature sparkle"
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
              </HoverLift>
            </MotionItem>
          </StaggerGrid>
        </div>

        <StaggerGrid className="mt-24 grid gap-6 md:grid-cols-3" stagger={0.12}>
          {[
            { t: "Bold", d: "Designs that refuse to blend into the background." },
            { t: "Glamorous", d: "High-fashion energy with wearable confidence." },
            { t: "Fearless", d: "For women who turn everyday moments into statements." },
          ].map((v) => (
            <MotionItem key={v.t}>
              <HoverLift>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-fuchsia/40">
                  <h3 className="font-heading text-3xl text-fuchsia">{v.t}</h3>
                  <p className="mt-3 text-white/60">{v.d}</p>
                </div>
              </HoverLift>
            </MotionItem>
          ))}
        </StaggerGrid>

        <ScrollReveal direction="up" className="mt-24" delay={0.05}>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid md:grid-cols-2">
              <ParallaxBlock className="relative min-h-[320px]" speed={30}>
                <Image
                  src={placeholderImages.lifestyle[0]}
                  alt="Founder energy"
                  fill
                  className="object-cover"
                />
              </ParallaxBlock>
              <div className="flex flex-col justify-center bg-charcoal p-6 sm:p-10">
                <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">Founder</p>
                <h2 className="mt-2 font-heading text-3xl sm:text-4xl">{brand.clientName}</h2>
                <p className="mt-4 text-white/65">
                  With a passion for statement jewelry and modern feminine glamour,{" "}
                  {brand.clientName} curates pieces that feel like a high-fashion campaign — ready
                  for real life.
                </p>
                <Button asChild className="mt-8 w-fit">
                  <Link href="/shop">Shop the Products</Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </PageEnter>
  );
}
