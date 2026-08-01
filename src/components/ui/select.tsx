import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const selectVariants = cva(
  "peer flex w-full min-w-0 appearance-none rounded-lg border border-input bg-background pr-7 text-sm shadow-xs transition-[color,box-shadow] outline-none",
  {
    variants: {
      size: {
        default: "h-8 pl-2.5",
        sm: "h-7 pl-2 text-[0.8rem]",
        lg: "h-9 pl-2.5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SelectProps
  extends Omit<React.ComponentProps<"select">, "size">,
    VariantProps<typeof selectVariants> {}

function Select({ className, size, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          selectVariants({ size }),
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "dark:border-input dark:bg-input/30",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground peer-disabled:opacity-50" />
    </div>
  );
}

export { Select };
