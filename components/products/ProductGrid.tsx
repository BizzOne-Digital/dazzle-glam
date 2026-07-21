"use client";

import { cn } from "@/lib/utils";
import {
  ProductCard,
  type ProductCardData,
  type ProductCardProps,
} from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PackageOpen } from "lucide-react";
import { StaggerGrid, MotionItem, HoverLift } from "@/components/animations/PageMotion";

export interface ProductGridProps {
  products: ProductCardData[];
  className?: string;
  columns?: 2 | 3 | 4;
  loading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onQuickView?: ProductCardProps["onQuickView"];
  onWishlistToggle?: ProductCardProps["onWishlistToggle"];
}

const columnStyles = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
};

export function ProductGrid({
  products,
  className,
  columns = 4,
  loading = false,
  skeletonCount = 8,
  emptyTitle = "No pieces found",
  emptyDescription = "Try adjusting your filters or explore our full collection.",
  onQuickView,
  onWishlistToggle,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn("grid gap-x-4 gap-y-10 sm:gap-x-6", columnStyles[columns], className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={<PackageOpen className="h-7 w-7" />}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <StaggerGrid
      className={cn("grid gap-x-4 gap-y-10 sm:gap-x-6", columnStyles[columns], className)}
      stagger={0.05}
    >
      {products.map((product) => (
        <MotionItem key={product.id}>
          <HoverLift>
            <ProductCard
              product={product}
              onQuickView={onQuickView}
              onWishlistToggle={onWishlistToggle}
            />
          </HoverLift>
        </MotionItem>
      ))}
    </StaggerGrid>
  );
}
