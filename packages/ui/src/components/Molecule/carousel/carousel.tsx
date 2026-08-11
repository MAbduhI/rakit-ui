import { Children, type HTMLAttributes, isValidElement, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../Atom/button";
import { Icon, type IconName } from "../../Atom/icon";

export type CarouselEffect = "scroll" | "fade";
export type CarouselNavPosition = "top" | "left" | "bottom" | "right";
export type CarouselChevron = "horizontal" | "vertical";

/** How long a slide takes to move or fade. `ease` controls the curve. */
const TRANSITION_MS = 400;

export interface CarouselProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** One slide per child. */
  children: ReactNode;
  /** Default axis. Ignored when `vertical` is set — `vertical` wins. */
  horizontal?: boolean;
  vertical?: boolean;
  /** Wraps past either end instead of stopping. */
  infinity?: boolean;
  autoScroll?: boolean;
  /** Milliseconds between auto-advances. */
  speed?: number;
  /** Show the dot navigation. */
  nav?: boolean;
  navPosition?: CarouselNavPosition;
  /** Adds chevron buttons over the slides, oriented on this axis. */
  chevron?: CarouselChevron;
  /** Shorthand for `effect="fade"`. `effect` wins if both are given. */
  fade?: boolean;
  effect?: CarouselEffect;
  /** Any CSS transition-timing-function. */
  ease?: string;
  beforeChange?: (current: number, next: number) => void;
  afterChange?: (index: number) => void;
}

const chevronIcons: Record<CarouselChevron, { previous: IconName; next: IconName }> = {
  horizontal: { previous: "chevron-left", next: "chevron-right" },
  vertical: { previous: "chevron-up", next: "chevron-down" },
};

export function Carousel({
  children,
  horizontal = true,
  vertical = false,
  infinity = false,
  autoScroll = false,
  speed = 4000,
  nav = true,
  navPosition = "bottom",
  chevron,
  fade = false,
  effect,
  ease = "ease-in-out",
  beforeChange,
  afterChange,
  className,
  ...props
}: CarouselProps) {
  /*
   * `horizontal`/`vertical` and `fade`/`effect` are each two props describing
   * one thing, so they are resolved to a single value up front rather than
   * being read independently further down — that is how they end up
   * contradicting each other.
   */
  const isVertical = vertical || horizontal === false;
  const resolvedEffect: CarouselEffect = effect ?? (fade ? "fade" : "scroll");

  const slides = Children.toArray(children).map((node, position) => ({
    key: isValidElement(node) && node.key != null ? node.key : `slide-${position}`,
    node,
  }));
  const count = slides.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Kept in refs so an inline arrow does not restart the timers every render.
  const beforeRef = useRef(beforeChange);
  const afterRef = useRef(afterChange);
  beforeRef.current = beforeChange;
  afterRef.current = afterChange;

  const goTo = (next: number) => {
    if (count === 0) {
      return;
    }
    const target = infinity ? ((next % count) + count) % count : Math.min(Math.max(next, 0), count - 1);
    if (target === index) {
      return;
    }
    beforeRef.current?.(index, target);
    setIndex(target);
  };

  const settled = useRef(true);

  useEffect(() => {
    // Skip the mount pass — nothing changed yet.
    if (settled.current) {
      settled.current = false;
      return;
    }
    const timer = setTimeout(() => afterRef.current?.(index), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!autoScroll || paused || count <= 1) {
      return;
    }
    // WCAG 2.2.2: motion that starts on its own must not be forced on anyone
    // who has asked the OS for less of it.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => {
        const next = current + 1;
        if (!infinity && next >= count) {
          return current;
        }
        const target = infinity ? next % count : next;
        beforeRef.current?.(current, target);
        return target;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [autoScroll, paused, speed, count, infinity]);

  const atStart = !infinity && index <= 0;
  const atEnd = !infinity && index >= count - 1;
  const transition = `${TRANSITION_MS}ms ${ease}`;

  const viewport =
    resolvedEffect === "fade" ? (
      // Grid stacking rather than absolute positioning: every slide occupies
      // the same cell, so the box still sizes itself to the tallest one.
      <div className="grid h-full w-full overflow-hidden">
        {slides.map((slide, position) => (
          <div
            key={slide.key}
            aria-hidden={position !== index}
            className="col-start-1 row-start-1 motion-reduce:transition-none"
            style={{ opacity: position === index ? 1 : 0, transition: `opacity ${transition}` }}
          >
            {slide.node}
          </div>
        ))}
      </div>
    ) : (
      <div className="h-full w-full overflow-hidden">
        <div
          className={cn("flex h-full motion-reduce:transition-none", isVertical ? "flex-col" : "flex-row")}
          style={{
            transform: isVertical ? `translateY(-${index * 100}%)` : `translateX(-${index * 100}%)`,
            transition: `transform ${transition}`,
          }}
        >
          {slides.map((slide, position) => (
            <div key={slide.key} aria-hidden={position !== index} className="h-full w-full shrink-0">
              {slide.node}
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <section
      // A <section> only maps to the `region` role once it has an accessible
      // name, so the default label is load-bearing, not decoration.
      aria-label="Carousel"
      aria-roledescription="carousel"
      className={cn(
        "flex gap-3",
        navPosition === "bottom" && "flex-col",
        navPosition === "top" && "flex-col-reverse",
        navPosition === "right" && "flex-row",
        navPosition === "left" && "flex-row-reverse",
        className,
      )}
      onBlur={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      /*
       * The handler sits on the region rather than a focusable wrapper: the
       * dots and chevrons inside are the tab stops, and their keydown events
       * bubble to here. A `tabIndex` on a non-interactive <section> would be
       * an a11y breach, not a shortcut.
       */
      onKeyDown={(event) => {
        const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";
        const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
        if (event.key === previousKey) {
          event.preventDefault();
          goTo(index - 1);
        }
        if (event.key === nextKey) {
          event.preventDefault();
          goTo(index + 1);
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...props}
    >
      <div className="relative min-h-0 min-w-0 flex-1">
        {viewport}

        {chevron ? (
          <>
            <Button
              aria-label="Previous slide"
              className={cn(
                "absolute aspect-square rounded-full p-0",
                chevron === "horizontal" ? "top-1/2 left-2 -translate-y-1/2" : "top-2 left-1/2 -translate-x-1/2",
              )}
              disabled={atStart}
              onClick={() => goTo(index - 1)}
              size="sm"
              variant="secondary"
            >
              <Icon name={chevronIcons[chevron].previous} size="sm" />
            </Button>
            <Button
              aria-label="Next slide"
              className={cn(
                "absolute aspect-square rounded-full p-0",
                chevron === "horizontal" ? "top-1/2 right-2 -translate-y-1/2" : "bottom-2 left-1/2 -translate-x-1/2",
              )}
              disabled={atEnd}
              onClick={() => goTo(index + 1)}
              size="sm"
              variant="secondary"
            >
              <Icon name={chevronIcons[chevron].next} size="sm" />
            </Button>
          </>
        ) : null}
      </div>

      {nav && count > 1 ? (
        <div
          aria-label="Slides"
          className={cn(
            "flex shrink-0 items-center justify-center gap-2",
            navPosition === "left" || navPosition === "right" ? "flex-col" : "flex-row",
          )}
          role="tablist"
        >
          {slides.map((slide, position) => (
            <button
              key={slide.key}
              aria-label={`Go to slide ${position + 1}`}
              aria-selected={position === index}
              className={cn(
                "size-2.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 motion-reduce:transition-none",
                position === index ? "bg-accent" : "bg-border hover:bg-secondary",
              )}
              onClick={() => goTo(position)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
