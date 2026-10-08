"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * CanITSM-style horizontal panel: vertical scroll drives left↔right movement,
 * and the section pins until the track finishes.
 */
export function HorizontalScrollTrack({
  children,
  className,
  trackClassName,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || window.innerWidth < 768) return;

    const ctx = gsap.context(() => {
      const getScroll = () =>
        Math.max(0, track.scrollWidth - section.clientWidth);

      const tween = gsap.to(track, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScroll() + section.clientHeight * 0.35}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative hidden h-screen overflow-hidden bg-black md:block",
        className
      )}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex h-full w-max items-stretch will-change-transform",
          trackClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function HorizontalPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-[85vw] max-w-[920px] shrink-0 flex-col justify-center px-8 md:w-[70vw] md:px-14",
        className
      )}
    >
      {children}
    </div>
  );
}
