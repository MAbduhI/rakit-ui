import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../../utils";

/*
 * Native overflow with a styled scrollbar, not a JS-driven fake one.
 *
 * A custom-rendered scrollbar has to reimplement momentum, wheel acceleration,
 * keyboard paging and touch — all of which the platform already does. Styling
 * the real one costs two vendor surfaces (`::-webkit-scrollbar` and Firefox's
 * `scrollbar-*`) and keeps every native behaviour.
 *
 * The colours are tokens, so the scrollbar themes with everything else.
 */
const scrollAreaVariants = cva("[scrollbar-color:var(--color-border)_transparent]", {
  variants: {
    orientation: {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto",
    },
    scrollbar: {
      /* Thin rail, visible at rest. */
      thin: cn(
        "[scrollbar-width:thin]",
        "[&::-webkit-scrollbar]:size-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb:hover]:bg-secondary",
      ),
      /* Wider rail for long documents. */
      auto: cn(
        "[scrollbar-width:auto]",
        "[&::-webkit-scrollbar]:size-2.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb:hover]:bg-secondary",
      ),
      /*
       * Appears on hover only. Still scrollable by wheel, touch and keyboard —
       * this hides the rail, it does not remove the scrolling.
       */
      hover: cn(
        "[scrollbar-width:thin] [scrollbar-color:transparent_transparent] hover:[scrollbar-color:var(--color-border)_transparent]",
        "[&::-webkit-scrollbar]:size-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent",
        "[&:hover::-webkit-scrollbar-thumb]:bg-border",
      ),
      /* No rail at all. */
      hidden: cn("[scrollbar-width:none]", "[&::-webkit-scrollbar]:hidden"),
    },
  },
  defaultVariants: {
    orientation: "vertical",
    scrollbar: "thin",
  },
});

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof scrollAreaVariants> {
  /**
   * Fades the content out at the scrollable edges. Purely decorative — it uses
   * a mask, so it never intercepts pointer events.
   */
  fade?: boolean;
}

export function ScrollArea({
  orientation = "vertical",
  scrollbar,
  fade = false,
  className,
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        scrollAreaVariants({ orientation, scrollbar }),
        fade &&
          (orientation === "horizontal"
            ? "[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]"
            : "[mask-image:linear-gradient(to_bottom,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]"),
        className,
      )}
      {...props}
    />
  );
}
