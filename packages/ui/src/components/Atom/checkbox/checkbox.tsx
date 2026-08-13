import { type InputHTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { cn } from "../../../utils";
import { Icon } from "../icon";

export type CheckboxSize = "sm" | "md" | "lg";

const sizes: Record<CheckboxSize, { box: string; icon: "sm" | "md"; text: string }> = {
  sm: { box: "size-4", icon: "sm", text: "text-xs" },
  md: { box: "size-5", icon: "sm", text: "text-sm" },
  lg: { box: "size-6", icon: "md", text: "text-base" },
};

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Neither checked nor unchecked — a partially selected parent. */
  indeterminate?: boolean;
  size?: CheckboxSize;
  onCheckedChange?: (checked: boolean) => void;
  containerClassName?: string;
}

export function Checkbox({
  label,
  description,
  indeterminate = false,
  size = "md",
  onCheckedChange,
  onChange,
  className,
  containerClassName,
  disabled,
  id,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  /* `indeterminate` is a DOM property, not an attribute — it cannot be set in JSX. */
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const control = (
    <span className={cn("relative inline-flex shrink-0", sizes[size].box)}>
      <input
        ref={ref}
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded border border-input bg-surface transition-colors checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={disabled}
        id={id}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        type="checkbox"
        {...props}
      />
      <Icon
        className={cn(
          "pointer-events-none absolute inset-0 m-auto text-accent-foreground",
          // Driven by the input's own state, so it stays right whether the
          // checkbox is controlled or not.
          indeterminate ? "block" : "hidden peer-checked:block",
        )}
        name={indeterminate ? "minus" : "check"}
        size={sizes[size].icon}
      />
    </span>
  );

  if (!label && !description) {
    return control;
  }

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-start gap-2",
        disabled && "cursor-not-allowed opacity-50",
        containerClassName,
      )}
      htmlFor={id}
    >
      {control}
      <span className="flex flex-col gap-0.5">
        {label ? <span className={cn("text-primary leading-tight", sizes[size].text)}>{label}</span> : null}
        {description ? <span className="text-secondary text-xs">{description}</span> : null}
      </span>
    </label>
  );
}
