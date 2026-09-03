"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, type = "text", ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-body text-xs uppercase tracking-[0.16em] text-silver"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "h-12 w-full rounded-sm bg-white/5 px-4 font-body text-sm text-white",
            "border border-white/12 placeholder:text-white/35",
            "transition-all duration-300",
            "hover:border-silver/40 focus:border-fuchsia focus:bg-white/8",
            "focus:outline-none focus:ring-1 focus:ring-fuchsia/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-400/70 focus:border-red-400 focus:ring-red-400/30",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-white/40">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
