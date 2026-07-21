"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Soft page-load entrance for whole page content */
export function PageEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Hero band with Ken Burns image + staggered text */
export function MotionHero({
  children,
  className,
  height = "md",
}: {
  children: ReactNode;
  className?: string;
  height?: "sm" | "md" | "lg";
}) {
  const heights = {
    sm: "h-40 md:h-48",
    md: "h-56 md:h-72",
    lg: "h-[50vh] min-h-[360px]",
  };

  return (
    <div className={cn("relative overflow-hidden", heights[height], className)}>
      {children}
    </div>
  );
}

export function KenBurnsImage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn("absolute inset-0", className)}
      initial={reduced ? false : { scale: 1.12 }}
      animate={{ scale: 1 }}
      transition={{ duration: 8, ease: "linear" }}
    >
      {children}
    </motion.div>
  );
}

export function HeroTextReveal({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const reduced = useReducedMotion();
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";

  const item: Variants = {
    hidden: { opacity: 0, y: 36 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease },
    },
  };

  if (reduced) {
    return (
      <div className={cn("flex flex-col", alignCls)}>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-heading text-3xl text-white sm:text-4xl md:text-6xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">{description}</p>}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("flex flex-col", alignCls)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
      }}
    >
      {eyebrow && (
        <motion.p
          variants={item}
          className="text-[11px] uppercase tracking-[0.35em] text-fuchsia"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        variants={item}
        className="mt-2 font-heading text-3xl text-white sm:text-4xl md:text-6xl"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p variants={item} className="mt-3 max-w-xl text-sm text-white/60 sm:text-base">
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Stagger grid — wrap each child in MotionItem */
export function StaggerGrid({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.65, ease, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hover lift + subtle glow for cards / tiles */
export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

/** Parallax wrapper for images inside scroll sections */
export function ParallaxBlock({
  children,
  className,
  speed = 40,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Floating fuchsia orbs / sparkle accents */
export function FloatingOrbs({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      {[
        { top: "12%", left: "8%", size: 180, delay: 0 },
        { top: "55%", left: "78%", size: 220, delay: 0.4 },
        { top: "70%", left: "18%", size: 140, delay: 0.8 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-fuchsia/15 blur-3xl"
          style={{
            top: o.top,
            left: o.left,
            width: o.size,
            height: o.size,
          }}
          animate={{
            y: [0, -24, 0],
            opacity: [0.25, 0.5, 0.25],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export { AnimatePresence, motion };
