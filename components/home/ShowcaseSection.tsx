"use client";

import { Award, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";

export type ShowcaseContent = {
  label?: string;
  body?: string;
  feature1Title?: string;
  feature1Description?: string;
  feature2Title?: string;
  feature2Description?: string;
};

/** Wrap *like this* in fuchsia for admin-editable highlights */
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return (
            <span key={i} className="font-semibold text-fuchsia">
              {part.slice(1, -1)}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const VIDEO_SRC = "/videos/home-showcase.mp4";

export function ShowcaseSection({ content }: { content?: ShowcaseContent }) {
  const label = content?.label || "Our work in motion";
  const body =
    content?.body ||
    "Dazzle Glam turns everyday looks into *statement moments* — bold pieces designed to amplify confidence and own every room.";
  const f1Title = content?.feature1Title || "Statement Design";
  const f1Desc =
    content?.feature1Description ||
    "Pieces that command attention from across the room.";
  const f2Title = content?.feature2Title || "Everyday Glam";
  const f2Desc =
    content?.feature2Description ||
    "High-fashion energy made for real life.";

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255_20_147/0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgb(192_192_192/0.08),transparent_50%)]" />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="max-w-xl font-body text-lg leading-relaxed text-white/85 md:text-xl md:leading-relaxed">
              <HighlightedText text={body} />
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <Award className="h-5 w-5 text-fuchsia" aria-hidden />
                <h3 className="mt-4 font-heading text-lg text-white">{f1Title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f1Desc}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-fuchsia" aria-hidden />
                <h3 className="mt-4 font-heading text-lg text-white">{f2Title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{f2Desc}</p>
              </article>
            </div>
          </div>

          <div className="relative">
            <p className="mb-5 text-right text-[10px] uppercase tracking-[0.28em] text-white/45 md:mb-6">
              {label}
            </p>

            {/* Laptop-style frame — video is fixed at /videos/home-showcase.mp4 */}
            <div className="mx-auto w-full max-w-xl">
              <div className="rounded-t-xl border border-white/15 bg-gradient-to-b from-[#2a2a2a] to-[#141414] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)] sm:p-2.5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-black ring-1 ring-white/10">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={VIDEO_SRC}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Dazzle Glam showcase video"
                  />
                </div>
              </div>
              <div className="relative mx-auto h-3 w-[72%] rounded-b-md bg-[#1a1a1a] shadow-lg">
                <div className="absolute inset-x-[18%] top-0 h-1 rounded-b bg-white/10" />
              </div>
              <div className="mx-auto mt-0.5 h-1.5 w-[78%] rounded-b-xl bg-[#0d0d0d]" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
