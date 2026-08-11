import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils";

/*
 * `size` is line thickness, not length — the divider always fills its
 * container on the long axis. Thickness has to be a compound variant because
 * horizontal grows in `h-*` and vertical in `w-*`.
 */
const dividerVariants = cva("shrink-0 border-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "w-full",
      vertical: "h-full self-stretch",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
      "2xl": "",
    },
  },
  compoundVariants: [
    { orientation: "horizontal", size: "sm", class: "h-px" },
    { orientation: "horizontal", size: "md", class: "h-0.5" },
    { orientation: "horizontal", size: "lg", class: "h-1" },
    { orientation: "horizontal", size: "xl", class: "h-1.5" },
    { orientation: "horizontal", size: "2xl", class: "h-2" },
    { orientation: "vertical", size: "sm", class: "w-px" },
    { orientation: "vertical", size: "md", class: "w-0.5" },
    { orientation: "vertical", size: "lg", class: "w-1" },
    { orientation: "vertical", size: "xl", class: "w-1.5" },
    { orientation: "vertical", size: "2xl", class: "w-2" },
  ],
  defaultVariants: {
    orientation: "horizontal",
    size: "sm",
  },
});

export interface DividerProps extends HTMLAttributes<HTMLHRElement>, VariantProps<typeof dividerVariants> {}

export function Divider({ className, orientation = "horizontal", size, ...props }: DividerProps) {
  return (
    <hr
      aria-orientation={orientation ?? "horizontal"}
      className={cn(dividerVariants({ orientation, size }), className)}
      {...props}
    />
  );
}
