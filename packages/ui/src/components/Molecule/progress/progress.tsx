import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../Atom/icon";

export type ProgressVariant = "percent" | "dot" | "stepper" | "round";
export type ProgressStatus = "accent" | "success" | "warning" | "error";
export type ProgressAnimate = "none" | "fade" | "slide" | "pulse";
export type ProgressSize = "sm" | "md" | "lg" | "xl";
/** Per-step state for the `stepper` variant, overriding what `value` implies. */
export type ProgressStepStatus = "wait" | "process" | "finish" | "error";

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
  /** `stepper` only — secondary line under each label. */
  descriptions?: Array<string>;
  /**
   * `stepper` only. Overrides the state `value` implies, so a step can be
   * marked `error` without moving the progress along.
   */
  statuses?: Array<ProgressStepStatus>;
  /**
   * `stepper` only. Supplying it turns the steps into buttons — the component
   * becomes a navigator rather than a read-out. Reports the clicked index;
   * map it back to a `value` yourself, since the caller owns what a step means.
   */
  onStepChange?: (index: number) => void;
  /** `stepper` only — indexes that cannot be clicked even when navigable. */
  disabledSteps?: Array<number>;
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
  descriptions,
  statuses,
  onStepChange,
  disabledSteps,
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

    /*
     * With `onStepChange` the markers become buttons and the whole thing is a
     * navigator, so it stops being a `progressbar` — that role is for a
     * read-out, and a list of controls announced as one is worse than useless.
     */
    const navigable = Boolean(onStepChange);

    return (
      <div
        className={cn("flex w-full items-start", className)}
        {...(navigable ? { "aria-label": label ?? "Steps" } : aria)}
        {...props}
      >
        {Array.from({ length: total }, (_, index) => {
          const stepStatus: ProgressStepStatus =
            statuses?.[index] ?? (index < done ? "finish" : index === done ? "process" : "wait");
          const complete = stepStatus === "finish";
          const current = stepStatus === "process";
          const errored = stepStatus === "error";
          const disabled = disabledSteps?.includes(index) ?? false;

          const marker = (
            <span
              //Note: Refactor cn class
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 font-medium text-xs tabular-nums transition-colors motion-reduce:transition-none",
                errored
                  ? "border-error bg-error text-error-foreground"
                  : complete
                    ? cn(fills[status], "border-transparent text-accent-foreground")
                    : current
                      ? "border-accent bg-surface text-accent"
                      : "border-border bg-surface text-secondary",
                navigable && !disabled && "group-hover:border-accent",
              )}
              style={transition}
            >
              {errored ? <Icon name="x" size="sm" /> : complete ? <Icon name="check" size="sm" /> : index + 1}
            </span>
          );

          const caption = (
            <span className="flex flex-col items-center gap-0.5">
              {labels?.[index] ? (
                <span
                  className={cn(
                    "whitespace-nowrap text-xs",
                    errored ? "text-error" : current ? "font-medium text-primary" : "text-secondary",
                  )}
                >
                  {labels[index]}
                </span>
              ) : null}
              {descriptions?.[index] ? (
                <span className="whitespace-nowrap text-[11px] text-secondary">{descriptions[index]}</span>
              ) : null}
            </span>
          );

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional list, never reordered
            <div key={index} className={cn("flex items-start", index < total - 1 && "flex-1")}>
              {navigable ? (
                <button
                  aria-current={current ? "step" : undefined}
                  className="group flex flex-col items-center gap-1 rounded-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => onStepChange?.(index)}
                  type="button"
                >
                  {marker}
                  {caption}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  {marker}
                  {caption}
                </div>
              )}

              {index < total - 1 ? (
                <div className="mx-2 mt-3.75 h-0.5 flex-1 rounded-full bg-border">
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
