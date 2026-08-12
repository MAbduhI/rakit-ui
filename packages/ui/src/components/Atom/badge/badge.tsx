import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils/cn";
import { badgeTones } from "./badge-tones";

/* Shape and size here; the colours live in `badge-tones.ts` so Toaster can
 * wear the same variant without inheriting the pill geometry. */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold text-xs transition-colors",
  {
    variants: {
      variant: badgeTones,
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
