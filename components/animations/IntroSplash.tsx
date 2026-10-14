"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Gem, Sparkles, Heart, Crown, Zap, Star } from "lucide-react";
import { brand, placeholderImages } from "@/config/site";
import { useIntro } from "@/components/animations/IntroProvider";

const INTRO_MS = 5500;

const leftPillars = [
  { icon: Zap, label: "BOLD Energy" },
  { icon: Sparkles, label: "GLAM Designs" },
  { icon: Crown, label: "OWN The Room" },
];

const rightPillars = [
  { icon: Star, label: "ICONIC Style" },
  { icon: Heart, label: "FEARLESS Looks" },
  { icon: Gem, label: "DAZZLE Differently" },
];

function SparkleField({ count = 28 }: { count?: number }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        size: 2 + (i % 4),
        delay: (i % 10) * 0.25,
        duration: 2.2 + (i % 5) * 0.4,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 8px rgba(255,20,147,0.8)",
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.2, 1, 0],
            scale: [0.4, 1.3, 0.8, 1.1, 0.3],
            y: [0, -12, 4, -8, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function OrbitingDiamonds() {
  const items = [
    { angle: 0, delay: 0 },
    { angle: 120, delay: 0.2 },
    { angle: 240, delay: 0.4 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {items.map((item) => (
        <motion.div
          key={item.angle}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 14,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ rotate: `${item.angle}deg` }}
        >
          <motion.span
            className="absolute left-1/2 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rotate-45 border border-fuchsia/80 bg-gradient-to-br from-white via-silver to-fuchsia shadow-[0_0_12px_#ff1493]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function IntroSplash() {
  const { showIntro, introReady, dismissIntro } = useIntro();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!showIntro || !introReady) return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / INTRO_MS);
      setProgress(Math.round(t * 100));

      if (elapsed > 400) setPhase(1);
      if (elapsed > 900) setPhase(2);
      if (elapsed > 1600) setPhase(3);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        dismissIntro();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [showIntro, introReady, dismissIntro]);

  if (!introReady) {
    return <div className="fixed inset-0 z-[9999] bg-black" aria-hidden />;
  }

  const motionOk = !reduced;

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col overflow-y-auto overflow-x-hidden bg-black"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: "blur(8px)",
          }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Dazzle Glam"
        >
          {/* Cinematic background with slow Ken Burns zoom */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15 }}
            animate={motionOk ? { scale: 1 } : { scale: 1 }}
            transition={{ duration: INTRO_MS / 1000, ease: "linear" }}
          >
            <Image
              src={placeholderImages.hero[0]}
              alt=""
              fill
              priority
              className="object-cover opacity-40"
              sizes="100vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          <motion.div
            className="absolute inset-0"
            animate={
              motionOk
                ? {
                    background: [
                      "radial-gradient(ellipse at 30% 40%, rgba(255,20,147,0.28), transparent 55%)",
                      "radial-gradient(ellipse at 70% 60%, rgba(255,105,180,0.25), transparent 55%)",
                      "radial-gradient(ellipse at 50% 30%, rgba(255,20,147,0.3), transparent 55%)",
                    ],
                  }
                : undefined
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="grain absolute inset-0" />

          {motionOk && <SparkleField />}

          {/* Floating light orbs */}
          {motionOk && (
            <>
              <motion.div
                className="pointer-events-none absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-fuchsia/25 blur-3xl"
                animate={{ y: [0, 30, 0], x: [0, 15, 0], opacity: [0.35, 0.6, 0.35] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="pointer-events-none absolute bottom-[20%] right-[10%] h-52 w-52 rounded-full bg-silver/15 blur-3xl"
                animate={{ y: [0, -25, 0], x: [0, -20, 0], opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
            <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
              {/* Left pillars */}
              <ul className="hidden flex-col gap-8 lg:flex">
                {leftPillars.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -50 }}
                    animate={
                      phase >= 2
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -50 }
                    }
                    transition={{ delay: i * 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-end gap-3"
                  >
                    <motion.span
                      className="text-xs font-medium uppercase tracking-[0.22em] text-white/80"
                      animate={motionOk ? { x: [0, 4, 0] } : undefined}
                      transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {item.label}
                    </motion.span>
                    <motion.span
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-fuchsia/40 bg-fuchsia/10 text-fuchsia shadow-[0_0_20px_rgb(255_20_147/0.25)]"
                      animate={
                        motionOk
                          ? { y: [0, -6, 0], boxShadow: ["0 0 12px rgba(255,20,147,0.2)", "0 0 28px rgba(255,20,147,0.55)", "0 0 12px rgba(255,20,147,0.2)"] }
                          : undefined
                      }
                      transition={{
                        duration: 2.4,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.span>
                  </motion.li>
                ))}
              </ul>

              {/* Center emblem */}
              <div className="flex flex-col items-center text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.55, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex h-44 w-44 flex-col items-center justify-center sm:h-64 sm:w-64 md:h-72 md:w-72"
                >
                  {/* Rotating rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full border border-silver/25"
                    animate={motionOk ? { rotate: 360 } : undefined}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border border-dashed border-fuchsia/40"
                    animate={motionOk ? { rotate: -360 } : undefined}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-5 rounded-full border border-white/10"
                    animate={
                      motionOk
                        ? { scale: [1, 1.04, 1], opacity: [0.5, 1, 0.5] }
                        : undefined
                    }
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {motionOk && <OrbitingDiamonds />}

                  <motion.div
                    className="relative z-10 flex h-[78%] w-[78%] flex-col items-center justify-center rounded-full border border-silver/30 bg-black/60 p-5 shadow-[0_0_60px_rgb(255_20_147/0.4)] backdrop-blur-md"
                    animate={
                      motionOk
                        ? {
                            boxShadow: [
                              "0 0 40px rgba(255,20,147,0.3)",
                              "0 0 70px rgba(255,20,147,0.55)",
                              "0 0 40px rgba(255,20,147,0.3)",
                            ],
                          }
                        : undefined
                    }
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      animate={motionOk ? { y: [0, -5, 0] } : undefined}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Image
                        src="/brand/logo.png"
                        alt={brand.name}
                        width={140}
                        height={70}
                        className="relative z-10 h-auto w-28 object-contain drop-shadow-[0_0_20px_rgb(255_20_147/0.5)] sm:w-32 md:w-36"
                        priority
                      />
                    </motion.div>
                    <motion.p
                      className="relative z-10 mt-3 font-heading text-lg text-white sm:text-xl"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                    >
                      {brand.shortName}
                    </motion.p>
                    <motion.p
                      className="relative z-10 mt-1 text-[9px] uppercase tracking-[0.28em] text-fuchsia sm:text-[10px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ delay: 0.6, duration: 2.5, repeat: Infinity }}
                    >
                      Jewelry Collection
                    </motion.p>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-6 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
                >
                  <motion.p
                    className="max-w-sm font-heading text-xl text-white/90 sm:text-2xl md:text-3xl"
                    initial={{ y: "110%" }}
                    animate={phase >= 3 ? { y: 0 } : { y: "110%" }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Bold Jewelry. Unforgettable Energy.
                  </motion.p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, letterSpacing: "0.5em" }}
                  animate={
                    phase >= 3
                      ? { opacity: 1, letterSpacing: "0.35em" }
                      : { opacity: 0 }
                  }
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mt-3 text-[10px] uppercase text-fuchsia"
                >
                  Turn Heads · Own the Room
                </motion.p>

                {/* Animated underline brush */}
                <motion.div
                  className="mt-4 h-0.5 origin-center rounded-full bg-gradient-to-r from-transparent via-fuchsia to-transparent"
                  initial={{ scaleX: 0, width: 0 }}
                  animate={
                    phase >= 3
                      ? { scaleX: 1, width: 140 }
                      : { scaleX: 0, width: 0 }
                  }
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* Right pillars */}
              <ul className="hidden flex-col gap-8 lg:flex">
                {rightPillars.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: 50 }}
                    animate={
                      phase >= 2
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: 50 }
                    }
                    transition={{ delay: i * 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3"
                  >
                    <motion.span
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-fuchsia/40 bg-fuchsia/10 text-fuchsia shadow-[0_0_20px_rgb(255_20_147/0.25)]"
                      animate={
                        motionOk
                          ? { y: [0, -6, 0], boxShadow: ["0 0 12px rgba(255,20,147,0.2)", "0 0 28px rgba(255,20,147,0.55)", "0 0 12px rgba(255,20,147,0.2)"] }
                          : undefined
                      }
                      transition={{
                        duration: 2.4,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                    </motion.span>
                    <motion.span
                      className="text-xs font-medium uppercase tracking-[0.22em] text-white/80"
                      animate={motionOk ? { x: [0, -4, 0] } : undefined}
                      transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Mobile pillars */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:hidden">
              {[...leftPillars, ...rightPillars].slice(0, 4).map((item, i) => (
                <motion.span
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-wider text-silver"
                >
                  {item.label}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Progress footer */}
          <div className="relative z-10 w-full px-6 pb-10 pt-4">
            <motion.p
              className="mb-3 text-center text-[10px] uppercase tracking-[0.35em] text-white/70 sm:text-xs"
              animate={motionOk ? { opacity: [0.5, 1, 0.5] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Preparing Your Glam Experience
            </motion.p>
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia via-fuchsia-glow to-silver"
                  style={{ width: `${progress}%` }}
                />
                {motionOk && (
                  <motion.div
                    className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    animate={{ left: ["-20%", "120%"] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
              <motion.span
                className="w-10 text-right text-xs tabular-nums text-fuchsia"
                key={progress}
                initial={{ scale: 1.15, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {progress}%
              </motion.span>
            </div>
            <p className="mt-2 text-center text-[10px] text-white/40">Please wait…</p>
            <motion.button
              type="button"
              onClick={dismissIntro}
              className="mx-auto mt-4 flex min-h-11 min-w-[8rem] items-center justify-center px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55 transition hover:text-fuchsia"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Skip Intro
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
