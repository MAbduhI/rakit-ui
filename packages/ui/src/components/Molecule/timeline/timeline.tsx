import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";
import { Loading } from "../../Atom/loading";

export type TimelineMode = "left" | "right" | "alternate";
export type TimelineStatus = "default" | "accent" | "success" | "warning" | "error";

export interface TimelineItem {
  /** Heading for the entry. */
  title?: ReactNode;
  children?: ReactNode;
  /** Timestamp or caption. In `alternate` mode it sits on the opposite side. */
  label?: ReactNode;
  icon?: IconName;
  status?: TimelineStatus;
  /** Replaces the dot entirely. */
  dot?: ReactNode;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: Array<TimelineItem>;
  /** Which side the content sits on. `alternate` zig-zags around the rail. */
  mode?: TimelineMode;
  /** Appends an unfinished entry with a spinner — a job still running. */
  pending?: ReactNode;
  /** Newest first. */
  reverse?: boolean;
}

const dotTones: Record<TimelineStatus, string> = {
  default: "border-border bg-surface text-secondary",
  accent: "border-accent bg-accent text-accent-foreground",
  success: "border-success bg-success text-success-foreground",
  warning: "border-warning bg-warning text-warning-foreground",
  error: "border-error bg-error text-error-foreground",
};

export function Timeline({ items, mode = "left", pending, reverse = false, className, ...props }: TimelineProps) {
  const entries: Array<TimelineItem> = pending
    ? [...items, { children: pending, status: "default", dot: <Loading size="sm" variant="spinner" /> }]
    : [...items];
  const ordered = reverse ? [...entries].reverse() : entries;
  const isAlternate = mode === "alternate";

  /*
   * `reverse` genuinely reorders the list, so positional keys would remount
   * every entry when it flips. Derive from content instead, with a
   * deterministic suffix for repeats.
   */
  const seen = new Map<string, number>();
  const keyed = ordered.map((item) => {
    const base =
      (typeof item.title === "string" && item.title) || (typeof item.label === "string" && item.label) || "entry";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { item, key: count === 0 ? base : `${base}~${count}` };
  });

  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {keyed.map(({ item, key }, position) => {
        const last = position === keyed.length - 1;
        const status = item.status ?? "default";
        // Alternate flips every other entry; `right` flips all of them.
        const flipped = isAlternate ? position % 2 === 1 : mode === "right";

        const marker = (
          <div className="flex flex-col items-center self-stretch">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                item.dot ? "border-transparent bg-transparent" : dotTones[status],
              )}
            >
              {item.dot ?? (item.icon ? <Icon name={item.icon} size="sm" /> : null)}
            </span>
            {/* The rail is drawn per entry, so the last one simply omits it. */}
            {last ? null : <span aria-hidden className="w-0.5 flex-1 bg-border" />}
          </div>
        );

        const body = (
          <div className={cn("flex flex-col gap-1 pb-6", flipped ? "items-end text-right" : "items-start")}>
            {item.title ? <p className="font-medium text-primary text-sm">{item.title}</p> : null}
            {item.children ? <div className="text-secondary text-sm">{item.children}</div> : null}
          </div>
        );

        const aside = item.label ? (
          <div className={cn("pb-6 text-secondary text-xs", flipped ? "text-left" : "text-right")}>{item.label}</div>
        ) : (
          <div />
        );

        if (isAlternate) {
          return (
            <li key={key} className="grid grid-cols-[1fr_auto_1fr] gap-4">
              {flipped ? aside : body}
              {marker}
              {flipped ? body : aside}
            </li>
          );
        }

        return (
          <li key={key} className={cn("flex gap-4", mode === "right" && "flex-row-reverse")}>
            {item.label ? (
              <div
                className={cn(
                  "w-24 shrink-0 pb-6 text-secondary text-xs",
                  mode === "right" ? "text-left" : "text-right",
                )}
              >
                {item.label}
              </div>
            ) : null}
            {marker}
            <div className="min-w-0 flex-1">{body}</div>
          </li>
        );
      })}
    </ol>
  );
}
