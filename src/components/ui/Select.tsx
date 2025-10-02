import { forwardRef } from "react";
import type { ComponentPropsWithRef } from "react";
import cn from "classnames";

interface SelectProps extends ComponentPropsWithRef<"select"> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, className, containerClassName, children, ...props },
    ref
  ) => {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "input-base w-full transition rounded-md border-0 bg-transparent py-2 px-3",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "ring-2 ring-red-500" : "ring-1 ring-gray-300",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
