"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCartStore } from "@/lib/store/cart";
import { cn, formatCurrency } from "@/lib/utils";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  hoverImage?: string;
  badge?: "new" | "bestseller" | string;
  inStock?: boolean;
}

export interface ProductCardProps {
  product: ProductCardData;
  className?: string;
  onWishlistToggle?: (product: ProductCardData, wished: boolean) => void;
}

export function ProductCard({
  product,
  className,
  onWishlistToggle,
}: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const inStock = product.inStock !== false;
  const showBadge = product.badge && product.badge !== "sale";

  const badgeVariant =
    product.badge === "new"
      ? "new"
      : product.badge === "bestseller"
        ? "fuchsia"
        : product.badge
          ? "fuchsia"
          : undefined;

  const handleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wished;
    setWished(next);
    onWishlistToggle?.(product, next);
    toast.success(next ? "Added to wishlist" : "Removed from wishlist");
  };

  const handleAddToCart = (e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!inStock) {
      toast.error("This piece is currently sold out");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success("Added to bag");
  };

  const href = `/products/${product.slug}`;

  return (
    <>
      <article className={cn("group relative flex flex-col", className)}>
        <Link
          href={href}
          className="relative block aspect-[3/4] overflow-hidden rounded-sm bg-graphite"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition duration-700 ease-out",
              product.hoverImage && "group-hover:opacity-0"
            )}
          />
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition duration-700 ease-out group-hover:opacity-100 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

          {showBadge && badgeVariant && (
            <div className="absolute left-3 top-3 z-10">
              <Badge variant={badgeVariant}>{product.badge}</Badge>
            </div>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            className={cn(
              "absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full",
              "border border-white/15 bg-black/40 text-white backdrop-blur-sm transition",
              "hover:border-fuchsia hover:text-fuchsia",
              wished && "border-fuchsia text-fuchsia"
            )}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", wished && "fill-current")} />
          </button>
        </Link>

        {/* Add to cart button — outside the Link so it doesn't block navigation */}
        <div className="absolute inset-x-2 bottom-[4.5rem] z-10 flex gap-2 translate-y-3 opacity-0 transition duration-400 sm:inset-x-3 sm:bottom-[5rem] group-hover:translate-y-0 group-hover:opacity-100">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        <div className="mt-3.5 space-y-1.5">
          <Link href={href}>
            <h3 className="line-clamp-2 font-heading text-base leading-snug text-white transition group-hover:text-fuchsia-glow md:text-xl">
              {product.name}
            </h3>
          </Link>
          <p className="font-body text-sm text-white">
            {formatCurrency(product.price)}
          </p>
          {!inStock && (
            <p className="font-body text-xs uppercase tracking-wider text-white/45">
              Sold out
            </p>
          )}
        </div>
      </article>

      <Modal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title={product.name}
        size="lg"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-graphite">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-3xl text-white">
              {formatCurrency(product.price)}
            </span>
            <p className="mt-4 font-body text-sm leading-relaxed text-white/55">
              A signature Dazzle Glam piece — bold energy, luminous finish, made
              to turn every entrance into a moment.
            </p>
            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  handleAddToCart();
                  setQuickOpen(false);
                }}
                disabled={!inStock}
              >
                Add to bag
              </Button>
              <Link
                href={href}
                onClick={() => setQuickOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-sm border border-silver/50 bg-transparent px-6 font-body text-sm uppercase tracking-[0.12em] text-silver-light transition hover:border-silver hover:bg-white/5 hover:text-white"
              >
                View full details
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
