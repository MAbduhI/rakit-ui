import {
  Children,
  type HTMLAttributes,
  isValidElement,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils";
import { Icon, type IconName, type IconProps } from "../../Atom/icon";

export type TabsVariant = "default" | "panel";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsSide = "left" | "right";
export type TabsSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
/**
 * `fit` sizes each trigger to its label, `fill` shares the row equally,
 * `span` pushes the triggers to the edges, `compact` is `fit` with tighter
 * padding.
 */
export type TabsWidth = "fit" | "fill" | "compact" | "span";

/*
 * `size` owns the type scale and padding; `width="compact"` only tightens the
 * padding within whichever size is set, so the two stay independent.
 */
const sizeStyles: Record<
  TabsSize,
  { text: string; padding: string; compactPadding: string; gap: string; icon: IconProps["size"] }
> = {
  sm: { text: "text-xs", padding: "px-3 py-1.5", compactPadding: "px-2 py-1", gap: "gap-1.5", icon: "sm" },
  md: { text: "text-sm", padding: "px-4 py-2", compactPadding: "px-2.5 py-1", gap: "gap-2", icon: "sm" },
  lg: { text: "text-base", padding: "px-5 py-2.5", compactPadding: "px-3 py-1.5", gap: "gap-2", icon: "md" },
  xl: { text: "text-lg", padding: "px-6 py-3", compactPadding: "px-3.5 py-2", gap: "gap-2.5", icon: "md" },
  "2xl": { text: "text-xl", padding: "px-7 py-3.5", compactPadding: "px-4 py-2", gap: "gap-3", icon: "lg" },
  "3xl": { text: "text-2xl", padding: "px-8 py-4", compactPadding: "px-5 py-2.5", gap: "gap-3", icon: "xl" },
  "4xl": { text: "text-3xl", padding: "px-10 py-5", compactPadding: "px-6 py-3", gap: "gap-4", icon: "2xl" },
  "5xl": { text: "text-4xl", padding: "px-12 py-6", compactPadding: "px-7 py-3.5", gap: "gap-4", icon: "3xl" },
};

export interface TabProps {
  value: string;
  label: ReactNode;
  icon?: IconName;
  /** Anything — a count, a Badge, a dot. Sits beside the icon. */
  note?: ReactNode;
  disabled?: boolean;
  /** Panel content, rendered when this tab is active. */
  children?: ReactNode;
}

/**
 * Configuration only — `Tabs` reads these props and renders the trigger and
 * panel itself, so a `<Tab>` never renders anything on its own.
 */
export function Tab(_props: TabProps): ReactNode {
  return null;
}

export interface TabsTriggerState {
  active: boolean;
  disabled: boolean;
  select: () => void;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "defaultValue"> {
  children: ReactNode;
  variant?: TabsVariant;
  orientation?: TabsOrientation;
  width?: TabsWidth;
  size?: TabsSize;
  iconPosition?: TabsSide;
  notePosition?: TabsSide;
  /** Triggers past this count collapse into a "N+ more Option" menu. */
  maxView?: number;
  /** Controlled active value. Pair with `onClick`. */
  value?: string;
  defaultValue?: string;
  onClick?: (value: string) => void;
  /** Replace the built-in trigger. `state.active` is what styles the active one. */
  renderTrigger?: (tab: TabProps, state: TabsTriggerState) => ReactNode;
}

const listVariants: Record<TabsVariant, Record<TabsOrientation, string>> = {
  default: {
    horizontal: "border-border border-b",
    vertical: "border-border border-r",
  },
  panel: {
    horizontal: "gap-1 rounded-md bg-surface-alt p-1",
    vertical: "gap-1 rounded-md bg-surface-alt p-1",
  },
};

const triggerVariants: Record<TabsVariant, { base: string; active: string; idle: string }> = {
  default: {
    base: "border-b-2 border-transparent -mb-px",
    active: "border-accent text-accent",
    idle: "text-secondary hover:text-primary",
  },
  panel: {
    base: "rounded-md",
    active: "bg-surface text-primary shadow-sm",
    idle: "text-secondary hover:text-primary",
  },
};

export function Tabs({
  children,
  variant = "default",
  orientation = "horizontal",
  width = "fit",
  size = "md",
  iconPosition = "left",
  notePosition = "left",
  maxView,
  value,
  defaultValue,
  onClick,
  renderTrigger,
  className,
  ...props
}: TabsProps) {
  const tabs = Children.toArray(children)
    .filter((node): node is ReactElement<TabProps> => isValidElement(node))
    .map((node) => node.props);

  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? tabs[0]?.value ?? "");
  // Controlled as soon as `value` is passed, matching a native input.
  const active = value ?? uncontrolled;

  const baseId = useId();
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [overflowOpen, setOverflowOpen] = useState(false);

  const isVertical = orientation === "vertical";

  const select = (next: string) => {
    if (next === active) {
      return;
    }
    if (value === undefined) {
      setUncontrolled(next);
    }
    onClick?.(next);
  };

  const visible = maxView !== undefined && maxView < tabs.length ? tabs.slice(0, maxView) : tabs;
  const overflow = maxView !== undefined && maxView < tabs.length ? tabs.slice(maxView) : [];

  /* APG tabs: arrows move and activate, Home/End jump to the ends. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const previousKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const selectable = visible.filter((tab) => !tab.disabled);
    if (selectable.length === 0) {
      return;
    }

    const current = selectable.findIndex((tab) => tab.value === active);
    let target: number | undefined;

    if (event.key === previousKey) {
      target = (current - 1 + selectable.length) % selectable.length;
    } else if (event.key === nextKey) {
      target = (current + 1) % selectable.length;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = selectable.length - 1;
    }

    if (target === undefined) {
      return;
    }
    event.preventDefault();
    const tab = selectable[target];
    if (!tab) {
      return;
    }
    select(tab.value);
    triggerRefs.current[visible.indexOf(tab)]?.focus();
  };

  const renderContent = (tab: TabProps) => {
    const icon = tab.icon ? <Icon name={tab.icon} size={sizeStyles[size].icon} /> : null;
    return (
      <>
        {iconPosition === "left" ? icon : null}
        {notePosition === "left" ? tab.note : null}
        <span>{tab.label}</span>
        {notePosition === "right" ? tab.note : null}
        {iconPosition === "right" ? icon : null}
      </>
    );
  };

  const defaultTrigger = (tab: TabProps, position: number, state: TabsTriggerState) => (
    <button
      key={tab.value}
      ref={(node) => {
        triggerRefs.current[position] = node;
      }}
      aria-controls={`${baseId}-panel`}
      aria-selected={state.active}
      className={cn(
        "inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        sizeStyles[size].text,
        sizeStyles[size].gap,
        width === "compact" ? sizeStyles[size].compactPadding : sizeStyles[size].padding,
        width === "fill" && "flex-1 justify-center",
        triggerVariants[variant].base,
        state.active ? triggerVariants[variant].active : triggerVariants[variant].idle,
      )}
      disabled={state.disabled}
      id={`${baseId}-trigger-${tab.value}`}
      onClick={state.select}
      role="tab"
      // Roving tabindex — one stop for the whole tablist.
      tabIndex={state.active ? 0 : -1}
      type="button"
    >
      {renderContent(tab)}
    </button>
  );

  const activeTab = tabs.find((tab) => tab.value === active);

  return (
    <div className={cn("flex gap-4", isVertical ? "flex-row" : "flex-col", className)} {...props}>
      <div
        aria-orientation={orientation}
        className={cn(
          "flex",
          isVertical ? "flex-col items-stretch" : "flex-row items-center",
          width === "fill" && "w-full",
          width === "span" && "w-full justify-between",
          listVariants[variant][orientation],
        )}
        onKeyDown={onKeyDown}
        role="tablist"
      >
        {visible.map((tab, position) => {
          const state: TabsTriggerState = {
            active: tab.value === active,
            disabled: Boolean(tab.disabled),
            select: () => select(tab.value),
          };
          return renderTrigger ? (
            <div key={tab.value} className={cn(width === "fill" && "flex-1")}>
              {renderTrigger(tab, state)}
            </div>
          ) : (
            defaultTrigger(tab, position, state)
          );
        })}

        {overflow.length > 0 ? (
          /*
           * ponytail: a native <details> disclosure, not a real menu — no
           * portal, no collision detection, no outside-click close. Swap for
           * DropdownMenu when P4 lands one.
           */
          <details
            className="relative"
            onToggle={(event) => setOverflowOpen(event.currentTarget.open)}
            open={overflowOpen}
          >
            <summary
              className={cn(
                "cursor-pointer list-none whitespace-nowrap font-medium text-secondary hover:text-primary",
                sizeStyles[size].text,
                width === "compact" ? sizeStyles[size].compactPadding : sizeStyles[size].padding,
              )}
            >
              {overflow.length}+ more Option
            </summary>
            <div className="absolute z-10 mt-1 flex min-w-40 flex-col rounded-md border border-border bg-surface p-1 shadow-md">
              {overflow.map((tab) => (
                <button
                  key={tab.value}
                  className={cn(
                    "flex items-center rounded px-3 py-2 text-left transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50",
                    sizeStyles[size].text,
                    sizeStyles[size].gap,
                    tab.value === active ? "text-accent" : "text-primary",
                  )}
                  disabled={tab.disabled}
                  onClick={() => {
                    select(tab.value);
                    setOverflowOpen(false);
                  }}
                  type="button"
                >
                  {renderContent(tab)}
                </button>
              ))}
            </div>
          </details>
        ) : null}
      </div>

      <div
        aria-labelledby={`${baseId}-trigger-${active}`}
        className="min-w-0 flex-1"
        id={`${baseId}-panel`}
        role="tabpanel"
      >
        {activeTab?.children}
      </div>
    </div>
  );
}
