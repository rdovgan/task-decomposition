import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full min-w-0 rounded-lg border border-input bg-background text-sm shadow-xs transition-[color,box-shadow] outline-none",
  {
    variants: {
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2 text-[0.8rem]",
        lg: "h-9 px-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, type, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ size }),
        "placeholder:text-muted-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "dark:border-input dark:bg-input/30",
        className
      )}
      {...props}
    />
  );
}

export { Input };
