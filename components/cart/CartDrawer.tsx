"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = subtotal >= 65 ? subtotal * 0.1 : 0;
  const discountedSubtotal = subtotal - discount;
  const shipping = subtotal === 0 ? 0 : discountedSubtotal >= 100 ? 0 : 12;
  const total = discountedSubtotal + shipping;
  const totalQty = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title="Your Bag"
      description={
        items.length
          ? `${totalQty} item${totalQty === 1 ? "" : "s"}`
          : "Your bag is empty"
      }
      width="max-w-md"
      footer={
        items.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-white/50">
                <span className="uppercase tracking-[0.14em]">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="uppercase tracking-[0.14em]">10% Discount</span>
                  <span>−{formatCurrency(discount)}</span>
                </div>
              )}
              {shipping === 0 && subtotal > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="uppercase tracking-[0.14em]">Shipping</span>
                  <span>Free 🎉</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between font-body text-sm">
              <span className="uppercase tracking-[0.14em] text-silver">Total</span>
              <span className="font-heading text-xl text-white">
                {formatCurrency(total)}
              </span>
            </div>
            {subtotal > 0 && subtotal < 65 && (
              <p className="rounded-lg border border-fuchsia/20 bg-fuchsia/10 px-3 py-2 text-xs text-fuchsia">
                Add {formatCurrency(65 - subtotal)} more for 10% off
              </p>
            )}
            {subtotal >= 65 && discountedSubtotal < 100 && (
              <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
                Add {formatCurrency(100 - discountedSubtotal)} more after discount for free shipping
              </p>
            )}
            <p className="font-body text-xs text-white/40">
              Shipping & taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="inline-flex h-11 w-full items-center justify-center rounded-sm border border-fuchsia/40 bg-fuchsia px-6 font-body text-sm font-medium uppercase tracking-[0.12em] text-white shadow-[0_0_20px_rgb(255_20_147/0.35)] transition hover:bg-fuchsia-deep"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center font-body text-xs uppercase tracking-[0.18em] text-silver transition hover:text-fuchsia"
            >
              View full cart
            </Link>
          </div>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="Your bag is empty"
          description="Discover bold statement pieces and fill your bag with dazzle."
          actionLabel="Shop now"
          onAction={() => {
            closeCart();
            window.location.href = "/shop";
          }}
          className="py-10"
        />
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <Link
                href={`/shop`}
                onClick={closeCart}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-graphite"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/20">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg text-white">
                      {item.name}
                    </p>
                    {item.variantLabel && (
                      <p className="mt-0.5 font-body text-xs text-white/45">
                        {item.variantLabel}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-white/40 transition hover:text-fuchsia"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center border border-white/12">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center text-white/70 hover:text-white"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-8 text-center font-body text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center text-white/70 hover:text-white"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-body text-sm text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
