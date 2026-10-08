import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-14",
        align === "center" && "items-center text-center",
        align === "left" && "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow && (
          <p className="mb-3 font-body text-xs uppercase tracking-[0.28em] text-fuchsia">
            {eyebrow}
          </p>
        )}
        <h2 className="font-heading text-3xl text-white md:text-5xl lg:text-[3.25rem]">
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-xl font-body text-sm leading-relaxed text-white/55 md:text-base",
              align === "center" && "mx-auto"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
