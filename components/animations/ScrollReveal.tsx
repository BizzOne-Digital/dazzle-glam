"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

const offsets: Record<RevealDirection, { x?: number; y?: number; scale?: number }> = {
  up: { y: 80 },
  down: { y: -80 },
  left: { y: 40 },
  right: { y: 40 },
  scale: { scale: 0.88 },
  fade: {},
};

const mobileOffsets: Record<RevealDirection, { x?: number; y?: number; scale?: number }> = {
  up: { y: 36 },
  down: { y: -36 },
  left: { y: 20 },
  right: { y: 20 },
  scale: { scale: 0.94 },
  fade: {},
};

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className,
  once = true,
  amount = 0.25,
}: {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const from = (mobile ? mobileOffsets : offsets)[direction];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: from.x ?? 0,
        y: from.y ?? 0,
        scale: from.scale ?? 1,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount, margin: "-8% 0px" }}
      transition={{
        duration: mobile ? Math.min(duration, 0.55) : duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.1,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  direction?: RevealDirection;
}) {
  const reduced = useReducedMotion();
  const from = offsets[direction];

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: stagger },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      x: from.x ?? 0,
      y: from.y ?? 0,
      scale: from.scale ?? 1,
    },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

/** Full-viewport section with scroll-snap */
export function SnapSection({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("snap-section relative w-full", className)}
    >
      {children}
    </section>
  );
}
