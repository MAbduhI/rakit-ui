import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils";

const kbdVariants = cva(
  "inline-flex select-none items-center justify-center rounded border border-border border-b-2 bg-surface-alt font-medium font-mono text-secondary",
  {
    variants: {
      size: {
        sm: "h-5 min-w-5 px-1 text-[10px]",
        md: "h-6 min-w-6 px-1.5 text-xs",
        lg: "h-7 min-w-7 px-2 text-sm",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface KbdProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {}

export function Kbd({ className, size, ...props }: KbdProps) {
  return <kbd className={cn(kbdVariants({ size }), className)} {...props} />;
}
