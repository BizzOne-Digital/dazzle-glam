import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
}

const sizeStyles = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  as: Comp = "div",
  size = "xl",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Comp
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
