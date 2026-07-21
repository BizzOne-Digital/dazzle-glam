"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowRight,
  Heart,
  LogOut,
  Package,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { brand, placeholderImages } from "@/config/site";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  FloatingOrbs,
  StaggerGrid,
  MotionItem,
  HoverLift,
  motion,
} from "@/components/animations/PageMotion";

const tiles = [
  {
    href: "/wishlist",
    label: "Wishlist",
    desc: "Pieces you saved for later",
    img: placeholderImages.rings[0],
    icon: Heart,
  },
  {
    href: "/shop",
    label: "Continue Shopping",
    desc: "Fresh sparkle waiting",
    img: placeholderImages.editorial[0],
    icon: Sparkles,
  },
  {
    href: "/cart",
    label: "Shopping Bag",
    desc: "Review & checkout",
    img: placeholderImages.necklaces[0],
    icon: Package,
  },
  {
    href: "/contact",
    label: "Support",
    desc: "We’re here to help",
    img: placeholderImages.lifestyle[0],
    icon: UserRound,
  },
];

export default function ProfilePage() {
  const { data, status } = useSession();
  const firstName = data?.user?.name?.split(" ")[0];
  const initial =
    (data?.user?.name || data?.user?.email || "G").charAt(0).toUpperCase();

  return (
    <PageEnter className="relative pb-20 pt-8">
      <FloatingOrbs />
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <ScrollReveal direction="up">
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">
                Member vault
              </p>
              <h1 className="mt-2 font-heading text-4xl text-white md:text-5xl">
                {status === "loading"
                  ? "Loading…"
                  : firstName
                    ? `Hello, ${firstName}`
                    : "Hello, glam"}
              </h1>
              <p className="mt-3 max-w-lg text-white/55">
                Your personal corner of {brand.shortName} — wishlist, bag, and
                styling support in one place.
              </p>
            </ScrollReveal>

            <StaggerGrid
              className="mt-10 grid gap-4 sm:grid-cols-2"
              stagger={0.08}
            >
              {tiles.map((c) => (
                <MotionItem key={c.href}>
                  <HoverLift>
                    <Link
                      href={c.href}
                      className="group relative block overflow-hidden rounded-2xl border border-white/10"
                    >
                      <div className="relative h-40">
                        <Image
                          src={c.img}
                          alt=""
                          fill
                          className="object-cover opacity-55 transition duration-700 group-hover:scale-110 group-hover:opacity-70"
                          sizes="(max-width:768px) 100vw, 40vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                        <div>
                          <p className="inline-flex items-center gap-2 font-heading text-2xl text-white">
                            <c.icon className="h-4 w-4 text-fuchsia" />
                            {c.label}
                          </p>
                          <p className="mt-1 text-xs text-white/50">{c.desc}</p>
                        </div>
                        <ArrowRight className="mb-1 h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-fuchsia" />
                      </div>
                    </Link>
                  </HoverLift>
                </MotionItem>
              ))}
            </StaggerGrid>
          </div>

          <ScrollReveal direction="right" delay={0.1}>
            <aside className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6 md:p-8">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia/20 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-fuchsia/40 bg-fuchsia/15 font-heading text-3xl text-fuchsia-glow"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  {initial}
                </motion.div>
                <h2 className="mt-4 font-heading text-2xl text-white">
                  {data?.user?.name || "Guest glam"}
                </h2>
                <p className="mt-1 break-all text-sm text-white/50">
                  {data?.user?.email || "Not signed in"}
                </p>

                <div className="mt-6 w-full space-y-2 rounded-xl border border-white/10 bg-black/30 p-4 text-left text-sm text-white/60">
                  <p className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-fuchsia" />
                    Member status: Active
                  </p>
                  <p className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-fuchsia" />
                    Wishlist ready when you are
                  </p>
                </div>

                <div className="mt-6 flex w-full flex-col gap-2">
                  <Button asChild fullWidth>
                    <Link href="/shop">
                      Shop new arrivals <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </aside>
          </ScrollReveal>
        </div>
      </Container>
    </PageEnter>
  );
}
