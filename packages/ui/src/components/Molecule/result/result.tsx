import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

/** The four outcomes, plus the three HTTP statuses worth their own screen. */
export type ResultStatus = "success" | "error" | "info" | "warning" | "404" | "403" | "500";

/* Every glyph comes from the Icon registry — no bespoke illustrations, so a
 * Result themes and scales like the rest of the library. */
const statusIcons: Record<ResultStatus, IconName> = {
  success: "circle-check",
  error: "circle-x",
  info: "info-circle",
  warning: "alert-triangle",
  "404": "search",
  "403": "lock",
  "500": "server-off",
};

const statusTones: Record<ResultStatus, string> = {
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  info: "bg-accent/10 text-accent",
  warning: "bg-warning/10 text-warning",
  "404": "bg-surface-alt text-secondary",
  "403": "bg-warning/10 text-warning",
  "500": "bg-error/10 text-error",
};

const defaultTitles: Record<ResultStatus, string> = {
  success: "Success",
  error: "Something went wrong",
  info: "For your information",
  warning: "Check this before continuing",
  "404": "Page not found",
  "403": "You do not have access",
  "500": "Server error",
};

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  status?: ResultStatus;
  title?: ReactNode;
  subTitle?: ReactNode;
  /** Overrides the per-status glyph. */
  icon?: IconName;
  /** Primary actions — usually a Button or two. */
  extra?: ReactNode;
  /** Detail below the actions: an error dump, a support reference. */
  children?: ReactNode;
}

export function Result({ status = "info", title, subTitle, icon, extra, children, className, ...props }: ResultProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 px-6 py-12 text-center", className)} {...props}>
      <span className={cn("flex items-center justify-center rounded-full p-5", statusTones[status])}>
        <Icon name={icon ?? statusIcons[status]} size="5xl" />
      </span>

      <div className="flex max-w-md flex-col gap-2">
        <h2 className="font-semibold text-primary text-xl tracking-tight">{title ?? defaultTitles[status]}</h2>
        {subTitle ? <p className="text-secondary text-sm">{subTitle}</p> : null}
      </div>

      {extra ? <div className="flex flex-wrap items-center justify-center gap-2">{extra}</div> : null}
      {children ? <div className="w-full max-w-lg text-left">{children}</div> : null}
    </div>
  );
}
