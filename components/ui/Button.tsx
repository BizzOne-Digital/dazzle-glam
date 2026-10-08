"use client";

import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  cloneElement,
  isValidElement,
} from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  magnetic?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-fuchsia text-white hover:bg-fuchsia-deep shadow-[0_0_20px_rgb(255_20_147/0.35)] hover:shadow-[0_0_28px_rgb(255_20_147/0.5)] border border-fuchsia/40",
  secondary:
    "bg-transparent text-silver-light border border-silver/50 hover:border-silver hover:text-white hover:bg-white/5",
  ghost:
    "bg-transparent text-white/80 hover:text-white hover:bg-white/8 border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs tracking-[0.14em] uppercase",
  md: "h-11 px-6 text-sm tracking-[0.12em] uppercase",
  lg: "h-12 px-8 text-sm tracking-[0.16em] uppercase",
  icon: "h-11 w-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      magnetic = false,
      loading = false,
      fullWidth = false,
      asChild = false,
      disabled,
      children,
      onMouseMove,
      onMouseLeave,
      style,
      ...props
    },
    ref
  ) => {
    const localRef = useRef<HTMLButtonElement | null>(null);

    const setRefs = (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      if (!magnetic || !localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      localRef.current.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    };

    const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      if (!magnetic || !localRef.current) return;
      localRef.current.style.transform = "translate(0, 0)";
    };

    const classes = cn(
      "relative inline-flex items-center justify-center gap-2 font-body font-medium",
      "rounded-sm whitespace-nowrap select-none",
      "transition-all duration-300 ease-out",
      "disabled:pointer-events-none disabled:opacity-45",
      "active:scale-[0.98]",
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      className
    );

    if (asChild && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ className?: string }>, {
        className: cn(classes, (children as ReactElement<{ className?: string }>).props.className),
      });
    }

    return (
      <button
        ref={setRefs}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transition: magnetic
            ? "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s, box-shadow 0.3s, border-color 0.3s, color 0.3s"
            : undefined,
          ...style,
        }}
        className={classes}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
