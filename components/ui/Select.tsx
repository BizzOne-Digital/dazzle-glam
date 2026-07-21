"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      options,
      placeholder = "Select an option",
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block font-body text-xs uppercase tracking-[0.16em] text-silver"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "h-12 w-full appearance-none rounded-sm bg-white/5 px-4 pr-10 font-body text-sm text-white",
              "border border-white/12",
              "transition-all duration-300",
              "hover:border-silver/40 focus:border-fuchsia focus:bg-white/8",
              "focus:outline-none focus:ring-1 focus:ring-fuchsia/40",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error &&
                "border-red-400/70 focus:border-red-400 focus:ring-red-400/30",
              className
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-charcoal text-white/50">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-charcoal text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-silver"
            aria-hidden
          />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${selectId}-hint`} className="text-xs text-white/40">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
