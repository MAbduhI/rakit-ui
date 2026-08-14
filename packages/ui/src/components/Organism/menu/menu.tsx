import { type HTMLAttributes, type ReactNode, useId, useState } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

export type MenuMode = "inline" | "vertical";
/** How a submenu opens and closes. `collapse` animates the height. */
export type MenuAnimateType = "none" | "fade" | "slide" | "collapse";

export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: IconName;
  /** Trailing content — a count, a badge, a shortcut. */
  extra?: ReactNode;
  disabled?: boolean;
  /** Renders the item as a link instead of a button. */
  href?: string;
  onSelect?: () => void;
  /** Nesting. An item with children is a submenu, not a destination. */
  children?: Array<MenuItem>;
  /** Non-interactive heading above a run of items. */
  group?: boolean;
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  items: Array<MenuItem>;
  mode?: MenuMode;
  /** Controlled selection. Pair with `onSelect`. */
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelect?: (item: MenuItem) => void;
  /** Controlled expansion. Pair with `onOpenChange`. */
  openKeys?: Array<string>;
  defaultOpenKeys?: Array<string>;
  onOpenChange?: (keys: Array<string>) => void;
  /** Only one submenu open at a time. */
  accordion?: boolean;
  animateType?: MenuAnimateType;
  /** Icon rail — labels and submenus are hidden. */
  collapsed?: boolean;
  /** Extra indent per nesting level, in pixels. */
  indent?: number;
  label?: string;
}

const DURATION = 200;

export function Menu({
  items,
  mode = "inline",
  selectedKey,
  defaultSelectedKey,
  onSelect,
  openKeys,
  defaultOpenKeys = [],
  onOpenChange,
  accordion = false,
  animateType = "collapse",
  collapsed = false,
  indent = 12,
  label = "Menu",
  className,
  ...props
}: MenuProps) {
  const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelectedKey);
  const [uncontrolledOpen, setUncontrolledOpen] = useState<Array<string>>(defaultOpenKeys);

  const selected = selectedKey ?? uncontrolledSelected;
  const open = openKeys ?? uncontrolledOpen;
  const baseId = useId();

  const select = (item: MenuItem) => {
    if (selectedKey === undefined) {
      setUncontrolledSelected(item.key);
    }
    item.onSelect?.();
    onSelect?.(item);
  };

  const toggle = (key: string) => {
    const isOpen = open.includes(key);
    const next = accordion ? (isOpen ? [] : [key]) : isOpen ? open.filter((entry) => entry !== key) : [...open, key];

    if (openKeys === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  const itemClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      active
        ? "bg-accent font-medium text-accent-foreground"
        : "text-secondary hover:bg-surface-alt hover:text-primary",
      collapsed && "justify-center px-0",
    );

  const renderItems = (list: Array<MenuItem>, depth: number): ReactNode =>
    list.map((item) => {
      if (item.group) {
        // A heading, not a target — hidden entirely in the rail.
        return collapsed ? null : (
          <li key={item.key}>
            <p
              className="px-3 pt-4 pb-1 font-semibold text-secondary text-xs uppercase tracking-wide"
              style={{ paddingLeft: depth * indent + 12 }}
            >
              {item.label}
            </p>
          </li>
        );
      }

      const hasChildren = Boolean(item.children?.length);
      const isOpen = open.includes(item.key);
      const active = item.key === selected;
      const pad = { paddingLeft: collapsed ? undefined : depth * indent + 12 };

      if (hasChildren) {
        return (
          <li key={item.key}>
            <button
              aria-controls={`${baseId}-${item.key}`}
              aria-expanded={isOpen}
              className={itemClass(false)}
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
              style={pad}
              type="button"
            >
              {item.icon ? <Icon className="shrink-0" name={item.icon} size="md" /> : null}
              {collapsed ? null : (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.extra}
                  <Icon
                    className={cn(
                      "shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                      isOpen && "rotate-180",
                    )}
                    name="chevron-down"
                    size="sm"
                  />
                </>
              )}
            </button>

            {/*
              `collapse` animates a grid row from 0fr to 1fr, which is the one
              way to transition to an unknown height without measuring it. The
              other modes mount and unmount, so they need no height at all.
            */}
            {collapsed ? null : animateType === "collapse" ? (
              <div
                className="grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none"
                id={`${baseId}-${item.key}`}
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <ul className="overflow-hidden">{renderItems(item.children ?? [], depth + 1)}</ul>
              </div>
            ) : isOpen ? (
              <ul
                id={`${baseId}-${item.key}`}
                style={
                  animateType === "none"
                    ? undefined
                    : {
                        animationName: animateType === "fade" ? "rakit-fade-in" : "rakit-slide-in",
                        animationDuration: `${DURATION}ms`,
                        animationTimingFunction: "ease-out",
                      }
                }
              >
                {renderItems(item.children ?? [], depth + 1)}
              </ul>
            ) : null}
          </li>
        );
      }

      const content = (
        <>
          {item.icon ? <Icon className="shrink-0" name={item.icon} size="md" /> : null}
          {collapsed ? null : (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.extra}
            </>
          )}
        </>
      );

      return (
        <li key={item.key}>
          {item.href ? (
            <a
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
              href={item.href}
              onClick={() => select(item)}
              style={pad}
              title={collapsed && typeof item.label === "string" ? item.label : undefined}
            >
              {content}
            </a>
          ) : (
            <button
              aria-current={active ? "page" : undefined}
              className={itemClass(active)}
              disabled={item.disabled}
              onClick={() => select(item)}
              style={pad}
              title={collapsed && typeof item.label === "string" ? item.label : undefined}
              type="button"
            >
              {content}
            </button>
          )}
        </li>
      );
    });

  return (
    <nav aria-label={label} className={cn("w-full", className)} {...props}>
      <ul className={cn("flex flex-col gap-0.5", mode === "vertical" && "gap-1")}>{renderItems(items, 0)}</ul>
    </nav>
  );
}
