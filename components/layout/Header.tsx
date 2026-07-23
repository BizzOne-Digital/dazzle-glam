"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { brand } from "@/config/site";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const leftNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

const mobileNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center px-2.5 py-2 font-body text-[11px] uppercase tracking-[0.2em] transition xl:px-3",
        active ? "text-white" : "text-white/75 hover:text-fuchsia"
      )}
    >
      {label}
      {active && (
        <span className="absolute inset-x-2.5 -bottom-0.5 h-px bg-fuchsia xl:inset-x-3" />
      )}
    </Link>
  );
}

export function Header({ className }: { className?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "relative w-full overflow-visible transition-all duration-500",
          scrolled
            ? "bg-black/90 shadow-[0_8px_32px_rgb(0_0_0/0.45)] backdrop-blur-xl"
            : "bg-transparent",
          className
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-fuchsia/80"
          aria-hidden
        />

        <div className="relative mx-auto flex h-[5.5rem] max-w-[1400px] items-center justify-between gap-4 px-3 sm:h-[6rem] sm:px-5 lg:px-8">
          {/* Left: Logo */}
          <Link
            href="/"
            className="relative z-10 flex shrink-0"
            aria-label={brand.name}
          >
            <Image
              src="/brand/logo.png"
              alt={brand.name}
              width={220}
              height={80}
              className="h-20 w-auto object-contain sm:h-24"
              priority
            />
          </Link>

          {/* Center: Navigation */}
          <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Primary">
            {leftNav.map((item) => (
              <NavLink
                key={`${item.label}-${item.href}`}
                href={item.href}
                label={item.label}
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/shop"
                      ? pathname.startsWith("/shop") ||
                        pathname.startsWith("/products")
                      : isActive(item.href)
                }
              />
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              href="/shop"
              className="inline-flex h-10 w-10 items-center justify-center text-white/85 transition hover:text-fuchsia"
              aria-label="Search products"
            >
              <Search className="h-5 w-5" />
            </Link>
            <Link
              href="/account"
              className="hidden h-10 w-10 items-center justify-center text-white/85 transition hover:text-fuchsia sm:inline-flex"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden h-10 w-10 items-center justify-center text-white/85 transition hover:text-fuchsia sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-fuchsia px-1 font-body text-[9px] font-semibold text-white">
                0
              </span>
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center text-white/85 transition hover:text-fuchsia"
              aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-fuchsia px-1 font-body text-[9px] font-semibold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[80] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/80"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col border-r border-fuchsia/30 bg-black"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div className="flex h-16 items-center justify-between border-b border-fuchsia/25 px-4">
                <Image
                  src="/brand/logo.png"
                  alt={brand.shortName}
                  width={140}
                  height={48}
                  className="h-9 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-6 py-8">
                <ul className="space-y-1">
                  {mobileNav.map((item) => (
                    <li key={`${item.label}-${item.href}`}>
                      <Link
                        href={item.href}
                        className="block border-b border-white/5 py-3.5 font-heading text-3xl text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 space-y-1 border-t border-white/10 pt-6">
                  <Link
                    href="/account"
                    className="flex items-center gap-3 py-3 text-sm uppercase tracking-[0.18em] text-white/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="h-4 w-4 text-fuchsia" /> Account
                  </Link>
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-3 py-3 text-sm uppercase tracking-[0.18em] text-white/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Heart className="h-4 w-4 text-fuchsia" /> Wishlist
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 text-left text-sm uppercase tracking-[0.18em] text-white/70"
                    onClick={() => {
                      setMobileOpen(false);
                      openCart();
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 text-fuchsia" /> Bag
                    {itemCount > 0 ? ` (${itemCount})` : ""}
                  </button>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
