"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { brand } from "@/config/site";
import { cn } from "@/lib/utils";

const SESSION_KEY = "dazzle-glam-intro-seen";
const INTRO_MS = 2800;

export interface IntroOverlayProps {
  forceShow?: boolean;
  className?: string;
}

export function IntroOverlay({ forceShow = false, className }: IntroOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);

    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      seen = false;
    }

    if (forceShow || !seen) {
      if (mq.matches) {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
        setVisible(false);
      } else {
        setVisible(true);
      }
    }

    return () => mq.removeEventListener("change", onChange);
  }, [forceShow]);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setTimeout(dismiss, INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [visible, reducedMotion, dismiss]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black grain-overlay",
            className
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label="Brand introduction"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_20_147/0.18),transparent_60%)]" />

          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <Image
                src="/brand/logo.png"
                alt={brand.name}
                width={96}
                height={96}
                className="h-20 w-20 object-contain drop-shadow-[0_0_32px_rgb(255_20_147/0.55)] md:h-24 md:w-24"
                priority
              />
            </motion.div>
            <motion.h1
              className="mt-6 font-heading text-4xl tracking-[0.08em] text-white md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.65 }}
            >
              {brand.shortName}
            </motion.h1>
            <motion.p
              className="mt-3 font-body text-xs uppercase tracking-[0.35em] text-fuchsia md:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              Jewelry Collection
            </motion.p>
            <motion.div
              className="mt-8 h-px w-24 origin-center bg-gradient-to-r from-transparent via-fuchsia to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </motion.div>

          <button
            type="button"
            onClick={dismiss}
            className="absolute bottom-10 z-10 font-body text-[11px] uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
