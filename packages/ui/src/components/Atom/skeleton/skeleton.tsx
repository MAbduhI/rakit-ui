import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils";

/* Size is the consumer's job — pass `className="h-32 w-full"`. Only the shape is a variant. */
const skeletonVariants = cva("block animate-pulse bg-surface-hover motion-reduce:animate-none", {
  variants: {
    variant: {
      rect: "rounded-md",
      text: "h-4 w-full rounded",
      circle: "aspect-square rounded-full",
    },
  },
  defaultVariants: {
    variant: "rect",
  },
});

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return <div aria-hidden className={cn(skeletonVariants({ variant }), className)} {...props} />;
}
