import { type HTMLAttributes, type ReactNode, useId, useState } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";

export type CollapseIconPosition = "left" | "right";

export interface CollapseItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  icon?: IconName;
  /** Trailing content in the header — a badge, a count, a menu. */
  extra?: ReactNode;
  disabled?: boolean;
}

export interface CollapseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  items: Array<CollapseItem>;
  /** One panel at a time — opening another closes the current one. */
  accordion?: boolean;
  /** Controlled open keys. Pair with `onChange`. */
  activeKeys?: Array<string>;
  defaultActiveKeys?: Array<string>;
  onChange?: (keys: Array<string>) => void;
  /** Outer border and dividers. Off gives a borderless, flush list. */
  bordered?: boolean;
  iconPosition?: CollapseIconPosition;
}

export function Collapse({
  items,
  accordion = false,
  activeKeys,
  defaultActiveKeys = [],
  onChange,
  bordered = true,
  iconPosition = "left",
  className,
  ...props
}: CollapseProps) {
  const [uncontrolled, setUncontrolled] = useState<Array<string>>(defaultActiveKeys);
  const open = activeKeys ?? uncontrolled;
  const baseId = useId();

  const toggle = (key: string) => {
    const isOpen = open.includes(key);
    // In accordion mode the next state is at most one key, never a union.
    const next = accordion ? (isOpen ? [] : [key]) : isOpen ? open.filter((entry) => entry !== key) : [...open, key];

    if (activeKeys === undefined) {
      setUncontrolled(next);
    }
    onChange?.(next);
  };

  return (
    <div
      className={cn("flex flex-col", bordered && "divide-y divide-border rounded-md border border-border", className)}
      {...props}
    >
      {items.map((item) => {
        const isOpen = open.includes(item.key);
        const chevron = (
          <Icon
            className={cn(
              "shrink-0 text-secondary transition-transform duration-200 motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            name="chevron-down"
            size="sm"
          />
        );

        return (
          <div key={item.key} className={cn(!bordered && "border-border border-b last:border-b-0")}>
            <h3>
              <button
                aria-controls={`${baseId}-${item.key}`}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium text-primary text-sm transition-colors hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={item.disabled}
                id={`${baseId}-${item.key}-trigger`}
                onClick={() => toggle(item.key)}
                type="button"
              >
                {iconPosition === "left" ? chevron : null}
                {item.icon ? <Icon className="shrink-0 text-secondary" name={item.icon} size="sm" /> : null}
                <span className="flex-1">{item.label}</span>
                {item.extra}
                {iconPosition === "right" ? chevron : null}
              </button>
            </h3>

            {/*
              Unmounted rather than hidden: a height transition needs a measured
              height, and `hidden` content still lands in the tab order and the
              accessibility tree unless carefully suppressed.
            */}
            {isOpen ? (
              // A <section> maps to the `region` role once it has an
              // accessible name — aria-labelledby supplies it from the trigger.
              <section
                aria-labelledby={`${baseId}-${item.key}-trigger`}
                className="px-4 pb-4 text-secondary text-sm"
                id={`${baseId}-${item.key}`}
              >
                {item.children}
              </section>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
