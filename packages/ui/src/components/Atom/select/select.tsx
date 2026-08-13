import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../icon";

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Options as data. Pass `children` instead for grouped `<optgroup>`s. */
  options?: Array<SelectOption>;
  /** Rendered as a disabled first option, the way a native select does it. */
  placeholder?: string;
  leftIcon?: IconName;
  containerClassName?: string;
}

/*
 * A styled native <select> on purpose: it gets the platform's own listbox,
 * keyboard behaviour, typeahead and mobile picker for free. A custom listbox
 * with filtering is a different component (Combobox) and belongs in P4.
 */
export function Select({
  options,
  placeholder,
  leftIcon,
  className,
  containerClassName,
  children,
  defaultValue,
  value,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      {leftIcon ? (
        <Icon
          className={cn(
            "-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 text-secondary",
            props.disabled && "opacity-50",
          )}
          name={leftIcon}
        />
      ) : null}
      <select
        className={cn(
          "flex h-10 w-full cursor-pointer appearance-none rounded-md border border-input bg-surface px-3 py-2 text-primary text-sm focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-10",
          "pr-10",
          className,
        )}
        defaultValue={defaultValue ?? (placeholder && value === undefined ? "" : undefined)}
        value={value}
        {...props}
      >
        {placeholder ? (
          <option disabled value="">
            {placeholder}
          </option>
        ) : null}
        {options?.map((option) => (
          <option key={option.value} disabled={option.disabled} value={option.value}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
      <Icon
        className={cn(
          "-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-secondary",
          props.disabled && "opacity-50",
        )}
        name="chevron-down"
        size="sm"
      />
    </div>
  );
}
