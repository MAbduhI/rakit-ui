import { Children, type CSSProperties, type HTMLAttributes, isValidElement, type ReactNode } from "react";
import { cn } from "../../../utils";

export type RunBannerOrientation = "horizontal" | "vertical";
/** Direction of travel: the edge the content runs towards. */
export type RunBannerNav = "top" | "bottom" | "left" | "right";
export type RunBannerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

/** Cross-axis extent of the band — height when horizontal, width when vertical. */
const sizes: Record<RunBannerSize, { horizontal: string; vertical: string }> = {
  sm: { horizontal: "h-8", vertical: "w-8" },
  md: { horizontal: "h-10", vertical: "w-10" },
  lg: { horizontal: "h-12", vertical: "w-12" },
  xl: { horizontal: "h-16", vertical: "w-16" },
  "2xl": { horizontal: "h-20", vertical: "w-20" },
  "3xl": { horizontal: "h-24", vertical: "w-24" },
  "4xl": { horizontal: "h-32", vertical: "w-32" },
  "5xl": { horizontal: "h-40", vertical: "w-40" },
};

export interface RunBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Logos, icons, or text — anything. Each child is one item in the run. */
  children: ReactNode;
  /** Ignored when `nav` implies an axis of its own. */
  orientation?: RunBannerOrientation;
  /** Defaults to `left` when horizontal, `top` when vertical. */
  nav?: RunBannerNav;
  size?: RunBannerSize;
  /** Milliseconds for one full lap. Larger is slower. */
  speed?: number;
  /** Space between items, in pixels. */
  gap?: number;
  /**
   * Whether the same gap also sits between the last item and the first on the
   * next lap. `false` runs item 1 straight after the last one.
   */
  endGap?: boolean;
}

export function RunBanner({
  children,
  orientation = "horizontal",
  nav,
  size = "lg",
  speed = 20000,
  gap = 24,
  endGap = false,
  className,
  style,
  ...props
}: RunBannerProps) {
  /*
   * `nav` names an edge, which already implies an axis, so it wins over
   * `orientation` when the two disagree — same rule Carousel uses for
   * vertical/horizontal.
   */
  const axis: RunBannerOrientation =
    nav === "left" || nav === "right" ? "horizontal" : nav === "top" || nav === "bottom" ? "vertical" : orientation;

  const isVertical = axis === "vertical";
  const direction = nav ?? (isVertical ? "top" : "left");
  // The keyframes run towards the start edge; the other two directions are the
  // same animation played backwards.
  const reversed = direction === "right" || direction === "bottom";

  const items = Children.toArray(children).map((node, position) => ({
    key: isValidElement(node) && node.key != null ? node.key : `item-${position}`,
    node,
  }));

  /*
   * Two copies, sliding by exactly one copy's length. With `endGap` the track
   * carries an extra gap between the copies, so one copy measures
   * `50% + gap/2` — hence the correction. Without it, one copy is exactly 50%.
   */
  const shift = endGap ? `calc(-50% - ${gap / 2}px)` : "-50%";

  const trackStyle: CSSProperties = {
    gap: endGap ? `${gap}px` : 0,
    animationName: isVertical ? "rakit-run-y" : "rakit-run-x",
    animationDuration: `${speed}ms`,
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDirection: reversed ? "reverse" : "normal",
    ["--rakit-run-shift" as string]: shift,
  };

  const copy = (instance: "a" | "b") => (
    <div
      // `undefined`, not `false` — React renders aria-* booleans verbatim, and
      // an explicit aria-hidden="false" is noise in the a11y tree.
      aria-hidden={instance === "b" || undefined}
      className={cn("flex shrink-0 items-center", isVertical ? "flex-col" : "flex-row")}
      style={{ gap: `${gap}px` }}
    >
      {items.map((item) => (
        <div key={`${instance}-${item.key}`} className="flex shrink-0 items-center justify-center">
          {item.node}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative overflow-hidden", isVertical ? sizes[size].vertical : sizes[size].horizontal, className)}
      style={style}
      {...props}
    >
      <div
        className={cn(
          "flex w-max motion-reduce:animate-none",
          isVertical ? "h-max flex-col" : "flex-row",
          // `h-max` on a vertical track would otherwise be clipped to the band.
          isVertical && "absolute top-0 left-0",
        )}
        style={trackStyle}
      >
        {copy("a")}
        {copy("b")}
      </div>
    </div>
  );
}
