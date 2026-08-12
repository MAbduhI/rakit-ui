import { type HTMLAttributes, type ReactNode, useState } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "../drawer";

/**
 * - `static` — pinned beside the content, always visible.
 * - `sticky` — scrolls with the page until it reaches `stickyTop`, then holds.
 * - `mini` — collapses to an icon rail; `collapsed` controls the width.
 * - `offcanvas` — off screen until opened, then slides over as a modal Drawer.
 * - `floating` — detached card hovering over the content, with its own surface.
 */
export type SidebarMode = "static" | "sticky" | "mini" | "offcanvas" | "floating";
export type SidebarSide = "left" | "right";

export interface SidebarItem {
  label: ReactNode;
  value: string;
  icon?: IconName;
  badge?: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect" | "children"> {
  items?: Array<SidebarItem>;
  mode?: SidebarMode;
  side?: SidebarSide;
  /** `mini` only — the icon rail when true, full width when false. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** `offcanvas` only. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Distance from the top once a `sticky` sidebar locks. Defaults to `1rem`. */
  stickyTop?: string;
  /** Active item value. */
  value?: string;
  onSelect?: (item: SidebarItem) => void;
  header?: ReactNode;
  footer?: ReactNode;
  /** Free-form content below the items. */
  children?: ReactNode;
  title?: string;
}

const WIDTH = "w-64";
const RAIL = "w-16";

export function Sidebar({
  items = [],
  mode = "static",
  side = "left",
  collapsed = false,
  onCollapsedChange,
  open = false,
  onOpenChange,
  stickyTop = "1rem",
  value,
  onSelect,
  header,
  footer,
  children,
  title = "Navigation",
  className,
  ...props
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(collapsed);
  const isMini = mode === "mini";
  // Controlled as soon as a handler is supplied, like the other components here.
  const railed = isMini && (onCollapsedChange ? collapsed : internalCollapsed);

  const nav = (
    <nav aria-label={title} className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-50",
              active ? "bg-accent text-accent-foreground" : "text-secondary hover:bg-surface-alt hover:text-primary",
              railed && "justify-center px-0",
            )}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.();
              onSelect?.(item);
            }}
            title={railed && typeof item.label === "string" ? item.label : undefined}
            type="button"
          >
            {item.icon ? <Icon className="shrink-0" name={item.icon} size="md" /> : null}
            {railed ? null : (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge}
              </>
            )}
          </button>
        );
      })}
      {railed ? null : children}
    </nav>
  );

  const panel = (
    <>
      {header || isMini ? (
        <div className={cn("flex shrink-0 items-center gap-2 border-border border-b p-3", railed && "justify-center")}>
          {railed ? null : <div className="min-w-0 flex-1">{header}</div>}
          {isMini ? (
            <button
              aria-label={railed ? "Expand sidebar" : "Collapse sidebar"}
              className="shrink-0 rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              onClick={() => {
                const next = !railed;
                setInternalCollapsed(next);
                onCollapsedChange?.(next);
              }}
              type="button"
            >
              <Icon name={railed === (side === "left") ? "chevron-right" : "chevron-left"} size="sm" />
            </button>
          ) : null}
        </div>
      ) : null}
      {nav}
      {footer && !railed ? <div className="shrink-0 border-border border-t p-3">{footer}</div> : null}
    </>
  );

  /*
   * Off-canvas is the one mode that is not layout: it is a modal surface, so it
   * delegates to Drawer rather than reimplementing a focus trap.
   */
  if (mode === "offcanvas") {
    return (
      <Drawer onClose={() => onOpenChange?.(false)} open={open} side={side} size="md">
        <DrawerContent>
          <DrawerHeader devider>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="px-0 py-0">{nav}</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  const shared = "flex flex-col bg-surface text-primary";

  if (mode === "floating") {
    return (
      <aside
        aria-label={title}
        className={cn(
          shared,
          WIDTH,
          "fixed top-4 bottom-4 z-40 rounded-md border border-border shadow-lg",
          side === "left" ? "left-4" : "right-4",
          className,
        )}
        {...props}
      >
        {panel}
      </aside>
    );
  }

  if (mode === "sticky") {
    return (
      <aside
        aria-label={title}
        className={cn(
          shared,
          WIDTH,
          "sticky max-h-[calc(100dvh-2rem)] shrink-0 self-start rounded-md border border-border",
          className,
        )}
        style={{ top: stickyTop }}
        {...props}
      >
        {panel}
      </aside>
    );
  }

  // static and mini differ only in width — both are in-flow columns.
  return (
    <aside
      aria-label={title}
      className={cn(
        shared,
        "h-full shrink-0 transition-[width] duration-200 motion-reduce:transition-none",
        railed ? RAIL : WIDTH,
        side === "left" ? "border-border border-r" : "border-border border-l",
        className,
      )}
      {...props}
    >
      {panel}
    </aside>
  );
}
