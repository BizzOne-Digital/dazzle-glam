"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "dg-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-white/15 bg-black/95 p-5 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg text-white">We use cookies</p>
          <p className="mt-1 text-sm leading-relaxed text-white/60">
            We use essential cookies to run the shop (cart, login, checkout) and
            optional cookies to improve your experience. See our{" "}
            <Link href="/privacy" className="text-fuchsia underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button type="button" size="sm" onClick={accept}>
            Accept Cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
