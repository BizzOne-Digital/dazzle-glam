"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnnouncementBarProps {
  messages?: string[];
  intervalMs?: number;
  className?: string;
}

const defaults = [
  "Summer special! — 10% on all orders over $50.00",
  "Free shipping on orders over $100",
  "New statement pieces just dropped",
  "Secure checkout & easy returns",
];

export function AnnouncementBar({
  messages = defaults,
  intervalMs = 4000,
  className,
}: AnnouncementBarProps) {
  const [index, setIndex] = useState(0);
  const items = messages.length ? messages : defaults;

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  return (
    <div
      className={cn(
        "relative z-[60] overflow-hidden border-b border-white/5 bg-black text-white",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Desktop: show all messages */}
      <div className="mx-auto hidden h-9 max-w-7xl items-center justify-center gap-6 px-4 lg:flex">
        {items.slice(0, 3).map((msg, i) => (
          <span
            key={msg}
            className="inline-flex items-center gap-6 font-body text-[10px] uppercase tracking-[0.22em] text-white/90"
          >
            {i > 0 && <Gem className="h-3 w-3 text-fuchsia" aria-hidden />}
            <span className={i === 1 ? "text-fuchsia" : undefined}>{msg}</span>
          </span>
        ))}
      </div>

      {/* Mobile: rotate */}
      <div className="flex h-9 items-center justify-center px-3 lg:hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={items[index]}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="truncate text-center font-body text-[10px] uppercase tracking-[0.14em] text-white/90 sm:tracking-[0.2em]"
          >
            {items[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
