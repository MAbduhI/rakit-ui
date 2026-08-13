import { cva, type VariantProps } from "class-variance-authority";
import type { LabelHTMLAttributes } from "react";
import { cn } from "../../../utils";

const labelVariants = cva("inline-flex items-center gap-0.5 font-medium text-primary leading-none", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  /** Adds the required marker. */
  required?: boolean;
  disabled?: boolean;
}

export function Label({ className, size, required = false, disabled = false, children, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: this *is* the Label primitive — `htmlFor` arrives through props, which the rule cannot see
    <label className={cn(labelVariants({ size }), disabled && "cursor-not-allowed opacity-50", className)} {...props}>
      {children}
      {required ? (
        /*
         * Hidden from assistive tech on purpose — the control's own `required`
         * attribute already announces it, and a spoken "asterisk" after every
         * label is noise, not information.
         */
        <span aria-hidden className="text-error">
          *
        </span>
      ) : null}
    </label>
  );
}
