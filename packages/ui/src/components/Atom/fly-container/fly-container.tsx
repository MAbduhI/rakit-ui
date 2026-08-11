import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../../../utils";

/** `top` / `mid` / `bottom`, or a number read as a `vh` offset (1–100). */
export type FlyVertical = "top" | "mid" | "bottom" | number;

/** `left` / `center` / `right`, or a number read as a `vw` offset (1–100). */
export type FlyHorizontal = "left" | "center" | "right" | number;

/*
 * Keywords are static classes so Tailwind can see them; numbers become inline
 * `vh`/`vw` because `top-[${n}vh]` is invisible to the class scanner.
 */
const verticalKeywords = {
  top: "top-6",
  mid: "-translate-y-1/2 top-1/2",
  bottom: "bottom-6",
} as const;

const horizontalKeywords = {
  left: "left-6",
  center: "-translate-x-1/2 left-1/2",
  right: "right-6",
} as const;

/** Viewport units outside 1–100 put the element off-screen with no way back. */
const clamp = (value: number) => Math.min(100, Math.max(1, value));

export interface FlyContainerProps extends HTMLAttributes<HTMLDivElement> {
  vertical?: FlyVertical;
  horizontal?: FlyHorizontal;
}

export function FlyContainer({
  vertical = "bottom",
  horizontal = "right",
  className,
  style,
  children,
  ...props
}: FlyContainerProps) {
  const offsets: CSSProperties = {
    ...(typeof vertical === "number" ? { top: `${clamp(vertical)}vh` } : null),
    ...(typeof horizontal === "number" ? { left: `${clamp(horizontal)}vw` } : null),
    ...style,
  };

  return (
    <div
      className={cn(
        "fixed z-50",
        typeof vertical === "string" ? verticalKeywords[vertical] : undefined,
        typeof horizontal === "string" ? horizontalKeywords[horizontal] : undefined,
        className,
      )}
      style={offsets}
      {...props}
    >
      {children}
    </div>
  );
}
