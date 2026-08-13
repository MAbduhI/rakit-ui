import {
  createContext,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import { cn } from "../../../utils";

export type RadioSize = "sm" | "md" | "lg";

const sizes: Record<RadioSize, { box: string; dot: string; text: string }> = {
  sm: { box: "size-4", dot: "size-1.5", text: "text-xs" },
  md: { box: "size-5", dot: "size-2", text: "text-sm" },
  lg: { box: "size-6", dot: "size-2.5", text: "text-base" },
};

interface RadioGroupContextValue {
  name: string;
  value?: string;
  size: RadioSize;
  disabled?: boolean;
  select: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "value"> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  size?: RadioSize;
  containerClassName?: string;
}

export function Radio({
  value,
  label,
  description,
  size: ownSize,
  className,
  containerClassName,
  disabled: ownDisabled,
  id,
  ...props
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const size = ownSize ?? group?.size ?? "md";
  const disabled = ownDisabled ?? group?.disabled;

  const control = (
    <span className={cn("relative inline-flex shrink-0", sizes[size].box)}>
      <input
        checked={group ? group.value === value : undefined}
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-full border border-input bg-surface transition-colors checked:border-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={disabled}
        id={inputId}
        name={group?.name}
        onChange={() => group?.select(value)}
        type="radio"
        value={value}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 m-auto hidden rounded-full bg-accent peer-checked:block",
          sizes[size].dot,
        )}
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
      htmlFor={inputId}
    >
      {control}
      <span className="flex flex-col gap-0.5">
        {label ? <span className={cn("text-primary leading-tight", sizes[size].text)}>{label}</span> : null}
        {description ? <span className="text-secondary text-xs">{description}</span> : null}
      </span>
    </label>
  );
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shared `name` for the inputs. Generated when omitted. */
  name?: string;
  orientation?: "horizontal" | "vertical";
  size?: RadioSize;
  disabled?: boolean;
  children: ReactNode;
}

export function RadioGroup({
  value: controlled,
  defaultValue,
  onChange,
  name,
  orientation = "vertical",
  size = "md",
  disabled,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const generatedName = useId();
  const value = controlled ?? uncontrolled;

  const select = (next: string) => {
    if (controlled === undefined) {
      setUncontrolled(next);
    }
    onChange?.(next);
  };

  return (
    <RadioGroupContext.Provider value={{ name: name ?? generatedName, value, size, disabled, select }}>
      <div
        className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap", className)}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
