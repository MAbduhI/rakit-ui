import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

export interface BreadcrumbItem {
  /** Reconciliation key. Falls back to `href`, then a string `label`. */
  id?: string;
  label: ReactNode;
  /** Renders an anchor. Omit both this and `onClick` for a plain label. */
  href?: string;
  onClick?: () => void;
  icon?: IconName;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  items: Array<BreadcrumbItem>;
  /** Defaults to a chevron. Any node works — a slash, a dot. */
  separator?: ReactNode;
  /**
   * Collapse the middle into an ellipsis once the trail exceeds this many
   * crumbs. The first and last are always kept.
   */
  maxItems?: number;
}

const linkClass =
  "rounded transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2";

export function Breadcrumb({ items, separator, maxItems, className, ...props }: BreadcrumbProps) {
  /*
   * Collapsing keeps the first crumb and the last `maxItems - 1`, so the
   * trail's width stays put as you go deeper — the same reasoning behind
   * Pagination's constant slot count.
   */
  const collapsed = maxItems !== undefined && maxItems > 1 && items.length > maxItems;
  const shown: Array<BreadcrumbItem | "ellipsis"> = collapsed
    ? [items[0] as BreadcrumbItem, "ellipsis", ...items.slice(items.length - (maxItems - 1))]
    : items;

  const gap = separator ?? <Icon className="shrink-0 text-secondary" name="chevron-right" size="sm" />;

  /*
   * Keys are derived from identity, not position, so a trail that grows or
   * collapses does not remount every crumb. Duplicates get a deterministic
   * suffix rather than falling back to the index.
   */
  const seen = new Map<string, number>();
  const keyed = shown.map((entry) => {
    if (entry === "ellipsis") {
      return { entry, key: "ellipsis" };
    }
    const base = entry.id ?? entry.href ?? (typeof entry.label === "string" ? entry.label : "crumb");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { entry, key: count === 0 ? base : `${base}~${count}` };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {keyed.map(({ entry, key }, position) => {
          const last = position === keyed.length - 1;

          if (entry === "ellipsis") {
            return (
              <li key="ellipsis" className="flex items-center gap-1.5">
                <span aria-hidden className="px-1 text-secondary">
                  …
                </span>
                {gap}
              </li>
            );
          }

          const content = (
            <>
              {entry.icon ? <Icon className="shrink-0" name={entry.icon} size="sm" /> : null}
              {entry.label}
            </>
          );

          return (
            <li key={key} className="flex items-center gap-1.5">
              {last ? (
                // The current page is not a link — there is nowhere to go.
                <span aria-current="page" className="flex items-center gap-1.5 font-medium text-primary">
                  {content}
                </span>
              ) : entry.href ? (
                <a className={cn("flex items-center gap-1.5 text-secondary", linkClass)} href={entry.href}>
                  {content}
                </a>
              ) : entry.onClick ? (
                <button
                  className={cn("flex items-center gap-1.5 text-secondary", linkClass)}
                  onClick={entry.onClick}
                  type="button"
                >
                  {content}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 text-secondary">{content}</span>
              )}
              {last ? null : gap}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
