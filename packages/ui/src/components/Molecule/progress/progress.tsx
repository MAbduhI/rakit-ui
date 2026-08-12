import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../Atom/icon";

export type ProgressVariant = "percent" | "dot" | "stepper" | "round";
export type ProgressStatus = "accent" | "success" | "warning" | "error";
export type ProgressAnimate = "none" | "fade" | "slide" | "pulse";
export type ProgressSize = "sm" | "md" | "lg" | "xl";

const fills: Record<ProgressStatus, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

const strokes: Record<ProgressStatus, string> = {
  accent: "stroke-accent",
  success: "stroke-success",
  warning: "stroke-warning",
  error: "stroke-error",
};

const barSizes: Record<ProgressSize, string> = { sm: "h-1", md: "h-2", lg: "h-3", xl: "h-4" };
const dotSizes: Record<ProgressSize, string> = { sm: "size-2", md: "size-2.5", lg: "size-3", xl: "size-4" };
const ringSizes: Record<ProgressSize, number> = { sm: 64, md: 96, lg: 128, xl: 160 };

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Always a percentage, 0–100, whatever the variant. Clamped. */
  value: number;
  variant?: ProgressVariant;
  status?: ProgressStatus;
  size?: ProgressSize;
  animate?: ProgressAnimate;
  /** `dot` and `stepper` only — how many segments the bar is split into. */
  steps?: number;
  /** `stepper` only. Falls back to step numbers. */
  labels?: Array<string>;
  /** Show the reading. Defaults on for `percent` and `round`. */
  showValue?: boolean;
  /** Replaces the reading, e.g. `(v) => \`${v} of 60\``. */
  formatValue?: (value: number) => ReactNode;
  /** Fires with the previous and next value before the indicator moves. */
  beforeChange?: (current: number, next: number) => void;
  /** Fires once the transition has settled. */
  afterChange?: (value: number) => void;
  /** Overrides the automatic `aria-label`. */
  label?: string;
}

const TRANSITION_MS = 400;

export function Progress({
  value,
  variant = "percent",
  status = "accent",
  size = "md",
  animate = "slide",
  steps = 5,
  labels,
  showValue,
  formatValue,
  beforeChange,
  afterChange,
  label,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));

  const previous = useRef(clamped);
  const beforeRef = useRef(beforeChange);
  const afterRef = useRef(afterChange);
  beforeRef.current = beforeChange;
  afterRef.current = afterChange;

  // Before the paint that shows the new value, so "before" is truthful.
  if (previous.current !== clamped) {
    beforeRef.current?.(previous.current, clamped);
    previous.current = clamped;
  }

  useEffect(() => {
    const timer = setTimeout(() => afterRef.current?.(clamped), animate === "none" ? 0 : TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [clamped, animate]);

  const transition =
    animate === "none"
      ? undefined
      : animate === "fade"
        ? { transition: `opacity ${TRANSITION_MS}ms ease-in-out` }
        : { transition: `all ${TRANSITION_MS}ms ease-in-out` };

  const reading = formatValue ? formatValue(clamped) : `${Math.round(clamped)}%`;
  const showReading = showValue ?? (variant === "percent" || variant === "round");

  const aria = {
    "aria-label": label ?? "Progress",
    "aria-valuemax": 100,
    "aria-valuemin": 0,
    "aria-valuenow": Math.round(clamped),
    role: "progressbar" as const,
  };

  if (variant === "round") {
    const box = ringSizes[size];
    const stroke = Math.max(4, Math.round(box / 12));
    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)} {...aria} {...props}>
        <svg height={box} role="presentation" width={box}>
          <circle className="stroke-border" cx={box / 2} cy={box / 2} fill="none" r={radius} strokeWidth={stroke} />
          <circle
            className={cn(strokes[status], animate === "pulse" && "animate-pulse", "motion-reduce:transition-none")}
            cx={box / 2}
            cy={box / 2}
            fill="none"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
            strokeLinecap="round"
            strokeWidth={stroke}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center", ...transition }}
          />
        </svg>
        {showReading ? (
          <span className="absolute font-semibold text-primary text-sm tabular-nums">{reading}</span>
        ) : null}
      </div>
    );
  }

  if (variant === "dot" || variant === "stepper") {
    const total = Math.max(1, steps);
    const done = Math.round((clamped / 100) * total);

    if (variant === "dot") {
      return (
        <div className={cn("inline-flex items-center gap-2", className)} {...aria} {...props}>
          {Array.from({ length: total }, (_, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional list, never reordered
              key={index}
              className={cn(
                "rounded-full motion-reduce:transition-none",
                dotSizes[size],
                index < done ? fills[status] : "bg-border",
                animate === "pulse" && index === done && "animate-pulse",
              )}
              style={transition}
            />
          ))}
          {showReading ? <span className="ml-1 text-secondary text-sm tabular-nums">{reading}</span> : null}
        </div>
      );
    }

    return (
      <div className={cn("flex w-full items-center", className)} {...aria} {...props}>
        {Array.from({ length: total }, (_, index) => {
          const complete = index < done;
          const current = index === done;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional list, never reordered
            <div key={index} className={cn("flex items-center", index < total - 1 && "flex-1")}>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 font-medium text-xs tabular-nums motion-reduce:transition-none",
                    complete
                      ? cn(fills[status], "border-transparent text-accent-foreground")
                      : current
                        ? "border-accent bg-surface text-accent"
                        : "border-border bg-surface text-secondary",
                  )}
                  style={transition}
                >
                  {complete ? <Icon name="check" size="sm" /> : index + 1}
                </span>
                {labels?.[index] ? (
                  <span className="whitespace-nowrap text-secondary text-xs">{labels[index]}</span>
                ) : null}
              </div>
              {index < total - 1 ? (
                <div className="mx-2 h-0.5 flex-1 self-start rounded-full bg-border" style={{ marginTop: "0.9375rem" }}>
                  <div
                    className={cn("h-full rounded-full motion-reduce:transition-none", fills[status])}
                    style={{ width: complete ? "100%" : "0%", ...transition }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)} {...aria} {...props}>
      <div className={cn("w-full overflow-hidden rounded-full bg-border", barSizes[size])}>
        <div
          className={cn(
            "h-full rounded-full motion-reduce:transition-none",
            fills[status],
            animate === "pulse" && "animate-pulse",
          )}
          style={{
            width: `${clamped}%`,
            opacity: animate === "fade" ? clamped / 100 : undefined,
            ...transition,
          }}
        />
      </div>
      {showReading ? <span className="self-end text-secondary text-xs tabular-nums">{reading}</span> : null}
    </div>
  );
}
