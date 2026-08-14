import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

const emptyStateVariants = cva("flex flex-col items-center justify-center text-center", {
  variants: {
    size: {
      sm: "gap-2 py-6",
      md: "gap-3 py-10",
      lg: "gap-4 py-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const iconSizes = { sm: "2xl", md: "3xl", lg: "5xl" } as const;
const titleSizes = { sm: "text-sm", md: "text-base", lg: "text-lg" } as const;

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof emptyStateVariants> {
  title?: ReactNode;
  description?: ReactNode;
  /** Defaults to an inbox. Ignored when `image` is supplied. */
  icon?: IconName;
  /** Replaces the icon entirely — an illustration, an SVG, a photo. */
  image?: ReactNode;
  /** Buttons or links below the copy. */
  children?: ReactNode;
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon = "inbox",
  image,
  size = "md",
  children,
  className,
  ...props
}: EmptyStateProps) {
  const scale = size ?? "md";

  return (
    <div className={cn(emptyStateVariants({ size }), className)} {...props}>
      {image ?? (
        <span className="flex items-center justify-center rounded-full bg-surface-alt p-4 text-secondary">
          <Icon name={icon} size={iconSizes[scale]} />
        </span>
      )}

      <div className="flex max-w-sm flex-col gap-1">
        {title ? <p className={cn("font-semibold text-primary", titleSizes[scale])}>{title}</p> : null}
        {description ? <p className="text-secondary text-sm">{description}</p> : null}
      </div>

      {children ? <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  );
}
