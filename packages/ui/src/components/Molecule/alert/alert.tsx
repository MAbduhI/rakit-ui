import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

export type AlertVariant = "info" | "success" | "warning" | "error";

/*
 * A persistent, in-flow message — not a Toast. It stays until dismissed (or
 * forever), and it sits in the document rather than floating over it.
 *
 * ponytail: the tinted fills are `/10` alpha over whatever surface the alert
 * sits on, not dedicated tokens. That reads correctly in both themes because
 * the status colours are already theme-aware, and it avoids inventing the
 * `-subtle` token set M3_Plan flagged. Swap to real tokens if a design ever
 * needs a fill that is not a straight tint of the status colour.
 */
const alertVariants = cva("flex gap-3 text-sm", {
  variants: {
    variant: {
      info: "border-accent/30 bg-accent/10",
      success: "border-success/30 bg-success/10",
      warning: "border-warning/30 bg-warning/10",
      error: "border-error/30 bg-error/10",
    },
    banner: {
      // Full-bleed strip: square, and only ruled along the bottom.
      true: "border-b px-4 py-3",
      false: "rounded-md border p-4",
    },
  },
  defaultVariants: {
    variant: "info",
    banner: false,
  },
});

const iconTones: Record<AlertVariant, string> = {
  info: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

const defaultIcons: Record<AlertVariant, IconName> = {
  info: "info-circle",
  success: "circle-check",
  warning: "alert-triangle",
  error: "circle-x",
};

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    Omit<VariantProps<typeof alertVariants>, "banner"> {
  title?: ReactNode;
  /** The body. Optional — a title-only alert is a valid one-liner. */
  children?: ReactNode;
  /** Overrides the per-variant icon. `false` hides it entirely. */
  icon?: IconName | false;
  closable?: boolean;
  onClose?: () => void;
  /** Trailing controls — a retry button, an "undo" link. */
  action?: ReactNode;
  /** Full-bleed page strip: square corners, ruled only along the bottom. */
  banner?: boolean;
}

export function Alert({
  title,
  children,
  variant = "info",
  icon,
  closable = false,
  onClose,
  action,
  banner = false,
  className,
  ...props
}: AlertProps) {
  const tone = variant ?? "info";
  const iconName = icon === false ? null : (icon ?? defaultIcons[tone]);

  return (
    <div className={cn(alertVariants({ variant, banner }), className)} role="alert" {...props}>
      {iconName ? <Icon className={cn("mt-0.5 shrink-0", iconTones[tone])} name={iconName} size="md" /> : null}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? <p className="font-semibold text-primary">{title}</p> : null}
        {children ? <div className="text-secondary">{children}</div> : null}
        {action ? <div className="mt-1 flex items-center gap-2">{action}</div> : null}
      </div>

      {closable ? (
        <button
          aria-label="Dismiss"
          className="-mr-1 -mt-1 shrink-0 self-start rounded p-1 text-secondary transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          onClick={onClose}
          type="button"
        >
          <Icon name="x" size="sm" />
        </button>
      ) : null}
    </div>
  );
}
