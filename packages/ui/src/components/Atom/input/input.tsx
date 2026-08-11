import type { InputHTMLAttributes } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../icon";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icon rendered inside the field, before the text. */
  leftIcon?: IconName;
  /** Icon rendered inside the field, after the text. */
  rightIcon?: IconName;
  /** Classes for the wrapper — `className` still styles the input itself. */
  containerClassName?: string;
}

export function Input({ className, leftIcon, rightIcon, containerClassName, ...props }: InputProps) {
  /*
   * Icons are positioned over the field rather than sitting beside it in a
   * flex row, so the input keeps its own border and focus ring instead of the
   * wrapper having to fake them. `pointer-events-none` lets a click on the
   * icon fall through and focus the input.
   */
  const iconClass = cn(
    "-translate-y-1/2 pointer-events-none absolute top-1/2 text-secondary",
    props.disabled && "opacity-50",
  );

  return (
    <div className={cn("relative w-full", containerClassName)}>
      {leftIcon ? <Icon className={cn(iconClass, "left-3")} name={leftIcon} /> : null}
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-primary text-sm placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // 12px inset + 20px icon + 8px gap
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        {...props}
      />
      {rightIcon ? <Icon className={cn(iconClass, "right-3")} name={rightIcon} /> : null}
    </div>
  );
}
