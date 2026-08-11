import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils";

const loadingVariants = cva("inline-flex shrink-0 items-center justify-center text-accent", {
  variants: {
    variant: {
      spinner: "",
      dots: "gap-1",
      bars: "gap-1",
    },
    size: {
      sm: "h-4",
      md: "h-6",
      lg: "h-8",
    },
  },
  defaultVariants: {
    variant: "spinner",
    size: "md",
  },
});

/* Children paint with `bg-current`/`border-current`, so the root's text color is the only knob. */
const shapes = {
  spinner: "aspect-square h-full animate-spin rounded-full border-2 border-current border-t-transparent",
  dots: "aspect-square h-1/3 animate-bounce rounded-full bg-current",
  bars: "h-full w-1 animate-pulse rounded-sm bg-current",
} as const;

/* Doubles as React keys — each entry is a distinct string. Index 0 stays first. */
const delays = [
  "[animation-delay:0ms]",
  "[animation-delay:150ms]",
  "[animation-delay:300ms]",
] as const satisfies ReadonlyArray<string>;

const shapeCount = { spinner: 1, dots: 3, bars: 3 } as const;

export interface LoadingProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof loadingVariants> {}

export type LoadingVariant = NonNullable<LoadingProps["variant"]>;

export function Loading({ className, variant = "spinner", size, ...props }: LoadingProps) {
  return (
    <span aria-label="Loading" className={cn(loadingVariants({ variant, size }), className)} role="status" {...props}>
      {delays.slice(0, shapeCount[variant ?? "spinner"]).map((delay) => (
        <span className={cn(shapes[variant ?? "spinner"], delay, "motion-reduce:animate-none")} key={delay} />
      ))}
    </span>
  );
}
