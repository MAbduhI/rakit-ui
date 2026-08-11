import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";

/*
 * Status variants map 1:1 onto the status tokens — never an ad-hoc green or
 * red. Each fill pairs with its own `-foreground` token, which is picked per
 * theme to clear 4.5:1 (see docs/theming.mdx for the measured ratios).
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-accent text-accent-foreground",
        "primary-highlight": "border-accent text-accent bg-white",
        secondary: "border-transparent bg-surface-alt text-primary",
        outline: "border-border text-primary",
        accent: "border-transparent bg-accent-secondary text-accent-secondary-foreground",
        "accent-highlight": "bg-white border-accent-secondary text-accent-secondary",
        success: "border-transparent bg-success text-success-foreground",
        "success-highlight": "bg-white border-success text-success",
        warning: "border-transparent bg-warning text-warning-foreground",
        "warning-highlight": "bg-white border-warning text-warning",
        error: "border-transparent bg-error text-error-foreground",
        "error-highlight": "bg-white border-error text-error",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
