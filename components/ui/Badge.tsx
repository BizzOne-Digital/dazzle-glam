import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "fuchsia"
  | "silver"
  | "sale"
  | "new"
  | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white/90 border-white/15",
  fuchsia: "bg-white text-black border-white shadow-[0_0_12px_rgb(255_255_255/0.6)] rounded-xl",
  silver: "bg-silver/15 text-silver-light border-silver/35",
  sale: "bg-fuchsia text-white border-fuchsia",
  new: "bg-white text-black border-white shadow-[0_0_12px_rgb(255_255_255/0.6)] rounded-xl",
  outline: "bg-transparent text-silver border-silver/50",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2.5 py-1",
        "font-body text-[10px] font-medium uppercase tracking-[0.16em]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
