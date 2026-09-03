"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { placeholderImages } from "@/config/site";
import { formatCurrency } from "@/lib/utils";
import { Copy, Check } from "lucide-react";

function InteracContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const email = searchParams.get("email") || "";
  const total = Number(searchParams.get("total") || 0);
  const [interacEmail, setInteracEmail] = useState(
    "dazzleglamcollection@gmail.com"
  );
  const [copied, setCopied] = useState<"email" | "ref" | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) setInteracEmail(data.email);
      })
      .catch(() => undefined);
  }, []);

  const copy = async (value: string, key: "email" | "ref") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">
        Interac e-Transfer
      </p>
      <h1 className="mt-3 font-heading text-3xl text-white sm:text-5xl">
        Complete Your Payment
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-white/60">
        Your order{orderNumber ? ` ${orderNumber}` : ""} is reserved. Send an
        Interac e-Transfer using the details below. We will confirm your order
        once payment arrives
        {email ? ` and email ${email}` : ""}.
      </p>

      <div className="mx-auto mt-10 max-w-md space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6 text-left text-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Send to
            </p>
            <p className="mt-1 font-medium text-white">{interacEmail}</p>
          </div>
          <button
            type="button"
            onClick={() => copy(interacEmail, "email")}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-white/15 px-3 text-xs text-white/70 hover:border-fuchsia hover:text-fuchsia"
          >
            {copied === "email" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy
          </button>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/45">
            Amount
          </p>
          <p className="mt-1 text-2xl text-fuchsia">
            {formatCurrency(total || 0)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/45">
              Message / Reference
            </p>
            <p className="mt-1 font-medium text-white">
              {orderNumber || "Your order number"}
            </p>
          </div>
          {orderNumber && (
            <button
              type="button"
              onClick={() => copy(orderNumber, "ref")}
              className="inline-flex h-9 items-center gap-1.5 rounded border border-white/15 px-3 text-xs text-white/70 hover:border-fuchsia hover:text-fuchsia"
            >
              {copied === "ref" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy
            </button>
          )}
        </div>
        <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">
          Use Autodeposit if prompted. Include your order number in the Interac
          message so we can match your payment quickly.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </>
  );
}

export default function InteracCheckoutPage() {
  return (
    <div className="relative min-h-[80vh] pb-20 pt-8">
      <div className="absolute inset-0 grid grid-cols-4 opacity-20">
        {placeholderImages.hero.slice(0, 4).map((src) => (
          <div key={src} className="relative">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/80" />
      <Container className="relative z-10 text-center">
        <Suspense
          fallback={
            <p className="text-white/50">Loading payment instructions…</p>
          }
        >
          <InteracContent />
        </Suspense>
      </Container>
    </div>
  );
}
