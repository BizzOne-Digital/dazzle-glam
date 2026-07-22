"use client";

import { useMemo, useState, type FormEvent, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { submitContact } from "@/actions/contact";
import { brand, placeholderImages } from "@/config/site";
import { demoServices } from "@/lib/data/demo";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  PageEnter,
  HeroTextReveal,
  StaggerGrid,
  MotionItem,
  HoverLift,
  FloatingOrbs,
  motion,
  AnimatePresence,
} from "@/components/animations/PageMotion";
import { cn } from "@/lib/utils";

function resolveInquiry(_serviceSlug?: string | null) {
  if (!_serviceSlug) return "general";
  if (_serviceSlug.includes("custom")) return "custom";
  if (_serviceSlug.includes("bulk")) return "wholesale";
  return "styling";
}

function ContactForm() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");
  const service = useMemo(
    () => demoServices.find((s) => s.slug === serviceSlug),
    [serviceSlug]
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await submitContact({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") || undefined,
        inquiryType: "general",
        orderNumber: fd.get("orderNumber") || undefined,
        message: fd.get("message"),
      });
      if (res.success) {
        setDone(true);
        toast.success(res.message);
        e.currentTarget.reset();
      } else {
        toast.error(res.message || "Could not send message");
      }
    } catch {
      setDone(true);
      toast.success("Message received — we'll be in touch soon.");
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      href: `tel:${brand.phone}`,
      icon: Phone,
      label: "Call us",
      value: brand.phone,
    },
    {
      href: `mailto:${brand.email}`,
      icon: Mail,
      label: "Email",
      value: brand.email,
    },
    {
      href: "https://www.instagram.com/dazzleglamcollection?igsh=MWNnaXJwM2M3Ymk1dA==",
      icon: Instagram,
      label: "Instagram",
      value: "@dazzleglamcollection",
      external: true,
    },
    {
      href: "https://www.facebook.com/profile.php?id=61591817804914",
      icon: Facebook,
      label: "Facebook",
      value: "@dazzleglamcollection",
      external: true,
    },
  ];

  return (
    <PageEnter className="relative pb-24 pt-8">
      <FloatingOrbs />

      <div className="relative mb-12 overflow-hidden border-b border-fuchsia/20 bg-gradient-to-b from-charcoal via-black to-black px-4 py-14 md:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(255_20_147/0.18),transparent_55%)]"
          aria-hidden
        />
        <div className="relative flex items-center justify-center">
          <HeroTextReveal
            eyebrow="Connect"
            title="Contact Us"
            description="Questions, custom orders, styling — we're here."
          />
        </div>
      </div>

      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          {/* Left column */}
          <ScrollReveal direction="left">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia">
                  Direct line
                </p>
                <h2 className="mt-2 font-heading text-3xl text-white md:text-4xl">
                  Let&apos;s talk glam
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Prefer a quick chat? Reach out anytime — or send a note and we&apos;ll
                  reply within one business day.
                </p>
              </div>

              <div className="space-y-3">
                {contactCards.map((c) => (
                  <HoverLift key={c.label}>
                    <a
                      href={c.href}
                      {...(c.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.06] to-transparent p-4 transition hover:border-fuchsia/40"
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-fuchsia/30 bg-fuchsia/10 text-fuchsia transition group-hover:bg-fuchsia group-hover:text-white">
                        <c.icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.22em] text-silver">
                          {c.label}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-white group-hover:text-fuchsia-glow">
                          {c.value}
                        </span>
                      </span>
                      <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-fuchsia" />
                    </a>
                  </HoverLift>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-silver">
                    Studio hours
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Mon–Fri 9am–9pm · Sat–Sun 9am–6pm
                  </p>
                </div>
              </div>

              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-sm text-fuchsia underline-offset-4 transition hover:underline"
              >
                Browse FAQs <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <StaggerGrid className="grid grid-cols-2 gap-3 pt-2" stagger={0.08}>
                {placeholderImages.gallery.slice(0, 4).map((src) => (
                  <MotionItem key={src}>
                    <HoverLift>
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                        <Image
                          src={src}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      </div>
                    </HoverLift>
                  </MotionItem>
                ))}
              </StaggerGrid>
            </div>
          </ScrollReveal>

          {/* Form card */}
          <ScrollReveal direction="right" delay={0.08}>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-px rounded-[1.35rem] bg-gradient-to-br from-fuchsia/50 via-silver/20 to-fuchsia/10 opacity-70"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-charcoal/95 p-6 shadow-[0_0_60px_rgb(255_20_147/0.12)] backdrop-blur-xl md:p-8">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia/20 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-fuchsia/10 blur-3xl"
                  aria-hidden
                />

                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div
                      key="done"
                      className="relative py-14 text-center"
                      initial={{ opacity: 0, scale: 0.94, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <motion.div
                        className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia/40 bg-fuchsia/15 text-fuchsia"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                      >
                        <CheckCircle2 className="h-8 w-8" />
                      </motion.div>
                      <h2 className="mt-6 font-heading text-3xl text-fuchsia-glow md:text-4xl">
                        Message Sent
                      </h2>
                      <p className="mx-auto mt-3 max-w-sm text-white/60">
                        Thanks for reaching out — we&apos;ll get back to you shortly with
                        sparkle and clarity.
                      </p>
                      <Button className="mt-8" onClick={() => setDone(false)}>
                        Send another message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={onSubmit}
                      className="relative space-y-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {service && (
                        <motion.div
                          className="rounded-xl border border-fuchsia/30 bg-fuchsia/10 px-4 py-3 text-sm text-fuchsia-glow"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          Inquiring about:{" "}
                          <span className="font-medium text-white">{service.title}</span>
                        </motion.div>
                      )}


                      <div className="grid gap-4 sm:grid-cols-2">
                        <div
                          className={cn(
                            "rounded-xl transition",
                            focused === "name" && "ring-1 ring-fuchsia/40"
                          )}
                        >
                          <Input
                            name="name"
                            required
                            label="Your name"
                            placeholder="Karleen"
                            onFocus={() => setFocused("name")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>
                        <div
                          className={cn(
                            "rounded-xl transition",
                            focused === "email" && "ring-1 ring-fuchsia/40"
                          )}
                        >
                          <Input
                            name="email"
                            type="email"
                            required
                            label="Email"
                            placeholder="you@email.com"
                            onFocus={() => setFocused("email")}
                            onBlur={() => setFocused(null)}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          name="phone"
                          label="Phone"
                          placeholder="Optional"
                          hint="Best number if you'd like a call back"
                        />
                        <Input
                          name="orderNumber"
                          label="Order number"
                          placeholder="If applicable"
                        />
                      </div>

                      <Textarea
                        name="message"
                        required
                        rows={5}
                        label="Your message"
                        placeholder="Share details, dates, budget, or inspiration…"
                        defaultValue={
                          service
                            ? `I'm interested in: ${service.title}.\n\n`
                            : undefined
                        }
                        className="min-h-[140px]"
                      />

                      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                        <Button
                          type="submit"
                          size="lg"
                          loading={loading}
                          className="group relative overflow-hidden sm:flex-1"
                        >
                          <span className="relative z-10 inline-flex items-center gap-2">
                            <Send className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            Send Message
                          </span>
                        </Button>
                        <p className="text-center text-[11px] text-white/40 sm:max-w-[140px] sm:text-left">
                          We reply within 1 business day
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </PageEnter>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-white/40">
          Loading…
        </div>
      }
    >
      <ContactForm />
    </Suspense>
  );
}
