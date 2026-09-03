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
import { CreditCard, Landmark, ShieldCheck } from "lucide-react";
import {
  EXPRESS_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
  calcShippingCost,
  shippingEta,
  shippingMethodLabel,
  type ShippingMethodId,
} from "@/lib/shipping";

type PaymentMethod = "stripe" | "interac";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [sameBilling, setSameBilling] = useState(true);
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodId>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = calcShippingCost(subtotal, shippingMethod);
  const tax = (subtotal + shippingCost) * 0.13;
  const total = subtotal + shippingCost + tax;
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

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

  const buildCheckoutPayload = (formData: FormData) => ({
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variantLabel: item.variantLabel,
      sku: item.sku,
    })),
    customerEmail: formData.get("email") as string,
    customerPhone: formData.get("phone") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    shippingAddress: {
      line1: formData.get("line1") as string,
      line2: formData.get("line2") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      postalCode: formData.get("postalCode") as string,
      country: "Canada",
    },
    shippingMethod,
    paymentMethod,
    subtotal,
    shippingCost,
    tax,
    total,
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const checkoutData = buildCheckoutPayload(formData);

      if (paymentMethod === "interac") {
        const response = await fetch("/api/checkout/interac", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutData),
        });

        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("Invalid response from payment server");
        }

        if (!response.ok) {
          throw new Error(
            data?.error || data?.message || `Server error: ${response.status}`
          );
        }

        clearCart();
        const params = new URLSearchParams({
          order: data.orderNumber || "",
          email: checkoutData.customerEmail,
          total: String(total),
        });
        router.push(`/checkout/interac?${params.toString()}`);
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutData),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from payment server");
      }

      if (!response.ok) {
        const errorMsg =
          data?.error || data?.message || `Server error: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from Stripe.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process checkout"
      );
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 pt-8">
      <div className="relative mb-10 h-40 overflow-hidden">
        <Image
          src={placeholderImages.hero[1]}
          alt=""
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="font-heading text-4xl text-white md:text-5xl">
            Checkout
          </h1>
        </div>
      </div>

      <Container>
        <form
          onSubmit={onSubmit}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
        >
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
              <h2 className="font-heading text-2xl">Shipping address</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  name="line1"
                  required
                  placeholder="Address"
                  className="sm:col-span-2"
                />
                <Input
                  name="line2"
                  placeholder="Apt / suite"
                  className="sm:col-span-2"
                />
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
                <div className="flex h-12 cursor-not-allowed select-none items-center rounded-sm border border-white/12 bg-white/5 px-4 font-body text-sm text-white/50">
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
              <h2 className="font-heading text-2xl">Delivery method</h2>
              {freeShipping ? (
                <p className="mt-3 text-sm text-emerald-400">
                  Free standard shipping unlocked on orders over{" "}
                  {formatCurrency(FREE_SHIPPING_THRESHOLD)}. Express is{" "}
                  {formatCurrency(EXPRESS_SHIPPING_COST)}.
                </p>
              ) : (
                <p className="mt-3 text-sm text-white/50">
                  Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more
                  for free standard shipping. Standard is{" "}
                  {formatCurrency(STANDARD_SHIPPING_COST)}.
                </p>
              )}
              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                    shippingMethod === "standard"
                      ? "border-fuchsia/50 bg-fuchsia/10"
                      : "border-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="accent-fuchsia"
                    />
                    <span>
                      <span className="block font-medium">Standard</span>
                      <span className="text-xs text-white/45">
                        {shippingEta("standard")}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm">
                    {freeShipping
                      ? "Free"
                      : formatCurrency(STANDARD_SHIPPING_COST)}
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                    shippingMethod === "express"
                      ? "border-fuchsia/50 bg-fuchsia/10"
                      : "border-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="accent-fuchsia"
                    />
                    <span>
                      <span className="block font-medium">Express</span>
                      <span className="text-xs text-white/45">
                        {shippingEta("express")}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm">
                    {formatCurrency(EXPRESS_SHIPPING_COST)}
                  </span>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 p-6">
              <h2 className="font-heading text-2xl">Payment method</h2>
              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    paymentMethod === "stripe"
                      ? "border-fuchsia/50 bg-fuchsia/10"
                      : "border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "stripe"}
                    onChange={() => setPaymentMethod("stripe")}
                    className="accent-fuchsia"
                  />
                  <CreditCard className="h-5 w-5 text-fuchsia" />
                  <span>
                    <span className="block font-medium">Credit / Debit Card</span>
                    <span className="text-xs text-white/45">
                      Secure payment via Stripe
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                    paymentMethod === "interac"
                      ? "border-fuchsia/50 bg-fuchsia/10"
                      : "border-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "interac"}
                    onChange={() => setPaymentMethod("interac")}
                    className="accent-fuchsia"
                  />
                  <Landmark className="h-5 w-5 text-fuchsia" />
                  <span>
                    <span className="block font-medium">Interac e-Transfer</span>
                    <span className="text-xs text-white/45">
                      Pay by Interac — order held until payment is received
                    </span>
                  </span>
                </label>
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
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words">{item.name}</p>
                    <p className="text-white/50">
                      Variant: {item.variantLabel || "Standard"}
                    </p>
                    <p className="text-white/50">
                      SKU: {item.sku || "—"}
                    </p>
                    <p className="text-white/40">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/50">Subtotal</dt>
                <dd>{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">
                  Shipping ({shippingMethodLabel(shippingMethod)})
                </dt>
                <dd className={shippingCost === 0 ? "text-emerald-400" : ""}>
                  {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/50">Tax (HST 13%)</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
              <div className="flex justify-between text-base">
                <dt>Total</dt>
                <dd className="text-fuchsia">{formatCurrency(total)}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-lg border border-fuchsia/20 bg-fuchsia/5 p-3 text-xs text-white/60">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-fuchsia" />
                <p>
                  {paymentMethod === "interac"
                    ? "After placing your order you will receive Interac e-Transfer instructions. Your order is confirmed once payment arrives."
                    : "Secure payment powered by Stripe. Your payment information is encrypted and never stored on our servers."}
                </p>
              </div>
            </div>

            <Button type="submit" fullWidth className="mt-6" loading={loading}>
              {paymentMethod === "interac"
                ? "Place Order — Pay by Interac"
                : "Pay Securely with Stripe"}
            </Button>
          </aside>
        </form>
      </Container>
    </div>
  );
}
