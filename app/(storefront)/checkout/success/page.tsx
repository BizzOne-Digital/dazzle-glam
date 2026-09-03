"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { placeholderImages } from "@/config/site";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<"pending" | "ok" | "error">(
    "pending"
  );

  useEffect(() => {
    if (!sessionId) {
      setEmailStatus("error");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Confirm failed");
        setOrderNumber(data.orderNumber || null);
        setEmailStatus("ok");
      } catch (error) {
        console.error("Order confirm failed:", error);
        if (!cancelled) setEmailStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.35em] text-fuchsia">
        Order Confirmed
      </p>
      <h1 className="mt-3 font-heading text-3xl text-white sm:text-5xl md:text-6xl">
        You&apos;re About to Dazzle
      </h1>
      <p className="mx-auto mt-4 max-w-md px-1 text-white/60">
        {emailStatus === "pending"
          ? "Finalizing your order and sending confirmation emails…"
          : emailStatus === "ok"
            ? `Thank you for your order${orderNumber ? ` (${orderNumber})` : ""}. A confirmation email is on its way.`
            : "Thank you for your order. If you don't see a confirmation email shortly, please contact us."}
      </p>
      <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="secondary" className="w-full sm:w-auto">
          <Link href="/account">View Account</Link>
        </Button>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="relative min-h-[80vh] pb-20 pt-8">
      <div className="absolute inset-0 grid grid-cols-4 opacity-20">
        {placeholderImages.rings.slice(0, 4).map((src) => (
          <div key={src} className="relative">
            <Image src={src} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
      <Container className="relative z-10 text-center">
        <Suspense
          fallback={
            <p className="text-white/60">Finalizing your order…</p>
          }
        >
          <SuccessContent />
        </Suspense>
      </Container>
    </div>
  );
}
