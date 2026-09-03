import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-silver/30 bg-white/5 text-silver">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-2xl text-white md:text-3xl">{title}</h3>
      {description && (
        <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-white/55">
          {description}
        </p>
      )}
      {(actionLabel && onAction) || children ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {children}
        </div>
      ) : null}
    </div>
  );
}
