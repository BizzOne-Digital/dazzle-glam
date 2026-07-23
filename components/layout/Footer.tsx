"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Instagram, Mail, Phone, Facebook } from "lucide-react";
import { toast } from "sonner";
import { brand, navigation } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const shopLinks = [
  { label: "Shop All", href: "/shop" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Best Sellers", href: "/shop?filter=bestsellers" },
  { label: "Rings", href: "/shop?category=rings" },
];

const helpLinks = [
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
];

const marqueWords = ["DAZZLE GLAM", "•", "DAZZLE GLAM", "•", "DAZZLE GLAM", "•"];

export function Footer({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("You're on the list — welcome to the glam.");
    setEmail("");
    setLoading(false);
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className={cn(
        "relative mt-16 overflow-hidden border-t border-white/8 bg-charcoal",
        className
      )}
    >
      {/* Sliding brand marquee — top of footer */}
      <div
        className="overflow-hidden border-b border-white/8 py-3 select-none"
        aria-hidden
      >
        <div className="flex w-max animate-marquee whitespace-nowrap will-change-transform hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center">
              {marqueWords.map((word, i) => (
                <span
                  key={`${copy}-${i}`}
                  className={cn(
                    "mx-4 font-heading text-4xl font-medium tracking-[0.08em] md:mx-6 md:text-5xl lg:text-6xl",
                    word === "•"
                      ? "text-fuchsia/50"
                      : "text-white/[0.08]"
                  )}
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Container className="relative z-10 py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/brand/logo.png"
                alt={brand.name}
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="font-heading text-2xl text-white">
                {brand.shortName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-white/55">
              {brand.tagline} Luxury statement jewelry crafted for bold energy
              and unforgettable nights.
            </p>
            <div className="mt-5 space-y-3 font-body text-sm text-white/70">
              <a
                href={`tel:${brand.phone.replace(/[^\d+]/g, "")}`}
                className="flex min-w-0 items-center gap-2 hover:text-fuchsia"
              >
                <Phone className="h-4 w-4 shrink-0 text-fuchsia" />
                <span className="min-w-0 break-all">{brand.phone}</span>
              </a>
              <a
                href={`mailto:${brand.email}`}
                className="flex min-w-0 items-center gap-2 hover:text-fuchsia"
              >
                <Mail className="h-4 w-4 shrink-0 text-fuchsia" />
                <span className="min-w-0 break-all">{brand.email}</span>
              </a>
              <a
                href={brand.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 hover:text-fuchsia"
              >
                <Instagram className="h-4 w-4 shrink-0 text-fuchsia" />
                <span className="min-w-0 truncate">{brand.instagram}</span>
              </a>
              <a
                href={brand.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 hover:text-fuchsia"
              >
                <Facebook className="h-4 w-4 shrink-0 text-fuchsia" />
                <span className="min-w-0 truncate">{brand.facebook}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h3 className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-silver">
                Explore
              </h3>
              <ul className="space-y-2.5">
                {navigation.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/65 link-underline hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-silver">
                Shop
              </h3>
              <ul className="space-y-2.5">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/65 link-underline hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-silver">
                Help
              </h3>
              <ul className="space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/65 link-underline hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-4 font-body text-xs uppercase tracking-[0.2em] text-silver">
              Newsletter
            </h3>
            <p className="mb-4 font-body text-sm text-white/55">
              First access to drops, private sales, and glam inspiration.
            </p>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                type="email"
                name="newsletter"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email for newsletter"
              />
              <Button type="submit" fullWidth loading={loading} magnetic>
                Join the list
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 sm:flex-row">
          <p className="font-body text-xs text-white/40">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollTop}
            className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.18em] text-silver transition hover:text-fuchsia"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </Container>
    </footer>
  );
}
