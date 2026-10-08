"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Fuchsia wipe that plays on client-side route changes.
 * Respects prefers-reduced-motion.
 */
export function PageTransition() {
  const pathname = usePathname();
  const [displayPath, setDisplayPath] = useState(pathname);
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (pathname === displayPath || reduced) {
      setDisplayPath(pathname);
      return;
    }
    setPhase("cover");
  }, [pathname, displayPath, reduced]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key={`transition-${displayPath}-${pathname}`}
          className="pointer-events-none fixed inset-0 z-[150]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          style={{ originX: phase === "cover" ? 0 : 1 }}
          transition={{ duration: 0.42, ease: [0.76, 0, 0.24, 1] }}
          onAnimationComplete={() => {
            if (phase === "cover") {
              setDisplayPath(pathname);
              setPhase("reveal");
            } else if (phase === "reveal") {
              setPhase("idle");
            }
          }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia via-fuchsia-deep to-fuchsia-glow" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
