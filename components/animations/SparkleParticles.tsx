"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SparkleParticlesProps {
  className?: string;
  count?: number;
  color?: string;
}

export function SparkleParticles({
  className,
  count = 36,
  color = "255, 20, 147",
}: SparkleParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.6,
      speed: 0.00015 + Math.random() * 0.00035,
      drift: (Math.random() - 0.5) * 0.0002,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.01 + Math.random() * 0.025,
    }));

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.twinkle += p.twinkleSpeed;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        const alpha = 0.15 + (Math.sin(p.twinkle) * 0.5 + 0.5) * 0.55;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();

        if (p.r > 1.1) {
          ctx.beginPath();
          ctx.moveTo(p.x * w - p.r * 2.2, p.y * h);
          ctx.lineTo(p.x * w + p.r * 2.2, p.y * h);
          ctx.moveTo(p.x * w, p.y * h - p.r * 2.2);
          ctx.lineTo(p.x * w, p.y * h + p.r * 2.2);
          ctx.strokeStyle = `rgba(${color}, ${alpha * 0.45})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, color]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    />
  );
}
