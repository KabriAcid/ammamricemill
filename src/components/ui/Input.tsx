import React, { forwardRef } from "react";
import type { ComponentPropsWithRef } from "react";
import cn from "classnames";

interface InputProps extends ComponentPropsWithRef<"input"> {
  label?: string;
  error?: string;
  containerClassName?: string;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "input-base w-full transition rounded-md border-0 bg-transparent py-2 px-3",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "ring-2 ring-red-500" : "ring-1 ring-gray-300",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
