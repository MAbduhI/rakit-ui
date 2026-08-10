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
        secondary: "border-transparent bg-surface-alt text-primary",
        outline: "border-border text-primary",
        accent: "border-transparent bg-accent-secondary text-accent-secondary-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        error: "border-transparent bg-error text-error-foreground",
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
