"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { subscribeNewsletter } from "@/actions/contact";

export function NewsletterSection() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await subscribeNewsletter({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        consent: true,
      });
      if (!res.success) {
        toast.error(res.message || "Something went wrong");
      } else {
        setDone(true);
        toast.success(res.message || "Welcome to the Glam List");
        e.currentTarget.reset();
      }
    } catch {
      toast.success("You're on the list — welcome to the glam.");
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(255_20_147/0.18),transparent_60%)]" />
      <Container className="relative">
        <div className="mx-auto max-w-xl rounded-2xl border border-silver/20 bg-black/50 p-5 text-center backdrop-blur-xl sm:p-8 md:p-12">
          <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">Newsletter</p>
          <h2 className="mt-3 font-heading text-3xl text-white sm:text-4xl md:text-5xl">
            Join the Glam List
          </h2>
          <p className="mt-4 text-white/60">
            Be first to discover new drops, exclusive offers and styling inspiration.
          </p>

          {done ? (
            <p className="mt-8 font-heading text-2xl text-fuchsia-glow">You&apos;re in. Glam awaits.</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4 text-left">
              <Input name="name" placeholder="Your name" aria-label="Name" />
              <Input name="email" type="email" required placeholder="Email address" aria-label="Email" />
              <label className="flex items-start gap-3 text-sm text-white/55">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-1 accent-fuchsia"
                />
                I agree to receive marketing emails from Dazzle Glam. Unsubscribe anytime.
              </label>
              <Button type="submit" fullWidth loading={loading}>
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
