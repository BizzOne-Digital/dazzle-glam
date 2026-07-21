"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  reverse?: boolean;
}

const speedMap = {
  slow: "48s",
  normal: "28s",
  fast: "16s",
};

export function Marquee({
  children,
  className,
  speed = "normal",
  pauseOnHover = true,
  reverse = false,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "group relative flex overflow-hidden border-y border-white/8 py-4",
        className
      )}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center gap-8 animate-marquee whitespace-nowrap",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ animationDuration: speedMap[speed] }}
      >
        {children}
        {children}
      </div>
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center gap-8 animate-marquee whitespace-nowrap",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]"
        )}
        style={{ animationDuration: speedMap[speed] }}
        aria-hidden
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function MarqueeText({
  words,
  separator = "✦",
  className,
}: {
  words: readonly string[] | string[];
  separator?: string;
  className?: string;
}) {
  return (
    <Marquee className={className}>
      {words.map((word) => (
        <span
          key={word}
          className="inline-flex items-center gap-8 font-heading text-2xl tracking-[0.12em] text-white/80 md:text-3xl"
        >
          <span>{word}</span>
          <span className="text-fuchsia" aria-hidden>
            {separator}
          </span>
        </span>
      ))}
    </Marquee>
  );
}
