import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { cn } from "../../../utils";

export type SwitchSize = "sm" | "md" | "lg";

/* Track, thumb, and the distance the thumb travels, per size. */
const sizes: Record<SwitchSize, { track: string; thumb: string; travel: string; text: string }> = {
  sm: { track: "h-5 w-9", thumb: "size-4", travel: "translate-x-4", text: "text-xs" },
  md: { track: "h-6 w-11", thumb: "size-5", travel: "translate-x-5", text: "text-sm" },
  lg: { track: "h-7 w-13", thumb: "size-6", travel: "translate-x-6", text: "text-base" },
};

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type" | "value"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  label?: ReactNode;
  /** Text inside the track — antd's `checkedChildren` / `unCheckedChildren`. */
  onLabel?: ReactNode;
  offLabel?: ReactNode;
  /** Classes for the track. `className` styles the button as a whole. */
  trackClassName?: string;
}

export function Switch({
  checked: controlled,
  defaultChecked = false,
  onCheckedChange,
  size = "md",
  label,
  onLabel,
  offLabel,
  disabled,
  className,
  trackClassName,
  ...props
}: SwitchProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const checked = controlled ?? uncontrolled;

  /*
   * The label lives *inside* the button rather than in a wrapping <label>:
   * a <label> only associates with form controls, not with a <button>, so
   * wrapping one would leave the switch unnamed and the text unclickable.
   * Inside the button it is both the accessible name and a hit target.
   *
   * `role="switch"` (not a checkbox) is what makes a screen reader say
   * "on/off" rather than "checked", and a native checkbox cannot animate a
   * thumb across a track.
   */
  return (
    <button
      aria-checked={checked}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={() => {
        if (controlled === undefined) {
          setUncontrolled(!checked);
        }
        onCheckedChange?.(!checked);
      }}
      role="switch"
      type="button"
      {...props}
    >
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent transition-colors motion-reduce:transition-none",
          sizes[size].track,
          checked ? "bg-accent" : "bg-input",
          trackClassName,
        )}
      >
        {onLabel || offLabel ? (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center font-medium text-[0.625rem]",
              checked ? "justify-start pl-1.5 text-accent-foreground" : "justify-end pr-1.5 text-primary",
            )}
          >
            {checked ? onLabel : offLabel}
          </span>
        ) : null}
        <span
          className={cn(
            "pointer-events-none inline-block transform rounded-full bg-surface shadow-sm transition-transform motion-reduce:transition-none",
            sizes[size].thumb,
            checked ? sizes[size].travel : "translate-x-0",
          )}
        />
      </span>
      {label ? <span className={cn("text-primary", sizes[size].text)}>{label}</span> : null}
    </button>
  );
}
