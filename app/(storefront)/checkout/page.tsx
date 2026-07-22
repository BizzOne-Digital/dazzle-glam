"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";
import { placeholderImages } from "@/config/site";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const shippingCost = subtotal >= 100 ? 0 : shippingMethod === "express" ? 15 : 8;
  const tax = subtotal * 0.13;
  const total = subtotal + shippingCost + tax;

  if (items.length === 0) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-heading text-4xl">Nothing to checkout</h1>
        <Button asChild className="mt-6">
          <Link href="/shop">Shop Jewelry</Link>
        </Button>
      </Container>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    // Stripe-ready: when STRIPE keys exist, create PaymentIntent via API.
    // Never store raw card data — Stripe Elements handles PCI scope.
    clearCart();
    toast.success("Order placed successfully");
    router.push("/checkout/success");
  };

  return (
    <div className="pb-20 pt-8">
      <div className="relative mb-10 h-40 overflow-hidden">
        <Image src={placeholderImages.hero[1]} alt="" fill className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-4xl text-white md:text-5xl">Checkout</h1>
        </div>
      </div>

      <Container>
        <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/10 p-6">
              <h2 className="font-heading text-2xl">Customer</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input name="email" type="email" required placeholder="Email" />
                <Input name="phone" placeholder="Phone" />
                <Input name="firstName" required placeholder="First name" />
                <Input name="lastName" required placeholder="Last name" />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 p-6">
              <h2 className="font-heading text-2xl">Shipping</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input name="line1" required placeholder="Address" className="sm:col-span-2" />
                <Input name="line2" placeholder="Apt / suite" className="sm:col-span-2" />
                <Input name="city" required placeholder="City" />
                <Select
                  name="province"
                  required
                  label="Province / Territory"
                  placeholder="Select province"
                  options={[
                    { label: "Alberta", value: "AB" },
                    { label: "British Columbia", value: "BC" },
                    { label: "Manitoba", value: "MB" },
                    { label: "New Brunswick", value: "NB" },
                    { label: "Newfoundland and Labrador", value: "NL" },
                    { label: "Northwest Territories", value: "NT" },
                    { label: "Nova Scotia", value: "NS" },
                    { label: "Nunavut", value: "NU" },
                    { label: "Ontario", value: "ON" },
                    { label: "Prince Edward Island", value: "PE" },
                    { label: "Quebec", value: "QC" },
                    { label: "Saskatchewan", value: "SK" },
                    { label: "Yukon", value: "YT" },
                  ]}
                />
                <Input name="postalCode" required placeholder="Postal code" />
                <div className="flex h-12 items-center rounded-sm border border-white/12 bg-white/5 px-4 font-body text-sm text-white/50 cursor-not-allowed select-none">
                  Canada
                </div>
                <input type="hidden" name="country" value="Canada" />
              </div>
              <label className="mt-4 flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(e) => setSameBilling(e.target.checked)}
                  className="accent-fuchsia"
                />
                Billing address same as shipping
              </label>
            </section>

            <section className="rounded-2xl border border-white/10 p-6">
              <h2 className="font-heading text-2xl">Delivery</h2>
              <div className="mt-4">
                <Select
                  name="shippingMethod"
                  defaultValue="standard"
                  onChange={(e) => setShippingMethod(e.target.value)}
                  options={[
                    { label: "Standard (3–6 days) — $8 / Free over $100", value: "standard" },
                    { label: "Express (4 days) — $15", value: "express" },
                  ]}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 p-6">
              <h2 className="font-heading text-2xl">Payment</h2>
              <p className="mt-2 text-sm text-white/50">
                Secure Stripe-ready checkout. Card details are never stored on our servers.
                Configure <code className="text-fuchsia">STRIPE_SECRET_KEY</code> to enable live
                payments.
              </p>
              <div className="mt-4 grid gap-3">
                <Input placeholder="Card number (Stripe Elements in production)" disabled />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="MM/YY" disabled />
                  <Input placeholder="CVC" disabled />
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-silver/20 bg-black/50 p-6">
            <h2 className="font-heading text-2xl">Order Summary</h2>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                    {item.image && (
                      <Image src={item.image} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words">{item.name}</p>
                    <p className="text-white/40">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Subtotal</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Shipping</dt>
                <dd>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Tax</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt>Total</dt>
                <dd className="text-fuchsia">{formatCurrency(total)}</dd>
              </div>
            </dl>
            <Button type="submit" fullWidth className="mt-6" loading={loading}>
              Place Order
            </Button>
          </aside>
        </form>
      </Container>
    </div>
  );
}
