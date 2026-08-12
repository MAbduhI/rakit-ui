import { type KeyboardEvent, type ReactElement, type ReactNode, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Icon, type IconName } from "../../Atom/icon";
import { Popover, type PopoverPlacement } from "../popover";

export interface DropdownMenuItem {
  /** Omit `label` and set `separator` to draw a rule instead of an item. */
  label?: ReactNode;
  value?: string;
  icon?: IconName;
  /** Right-aligned hint — a shortcut, a count. */
  hint?: ReactNode;
  disabled?: boolean;
  separator?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
}

export interface DropdownMenuProps {
  trigger: ReactElement;
  items: Array<DropdownMenuItem>;
  placement?: PopoverPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (item: DropdownMenuItem) => void;
  /** Keep the menu open after a selection — useful for toggles. */
  closeOnSelect?: boolean;
  className?: string;
  contentClassName?: string;
}

export function DropdownMenu({
  trigger,
  items,
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  closeOnSelect = true,
  className,
  contentClassName,
}: DropdownMenuProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolled;
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(-1);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolled(next);
    }
    if (!next) {
      setActive(-1);
    }
    onOpenChange?.(next);
  };

  const selectable = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.separator && !item.disabled);

  const focusAt = (position: number) => {
    if (selectable.length === 0) {
      return;
    }
    const entry = selectable[(position + selectable.length) % selectable.length];
    if (!entry) {
      return;
    }
    setActive(entry.index);
    itemRefs.current[entry.index]?.focus();
  };

  /*
   * APG menu keys. The handler sits on each item rather than a wrapper div —
   * a div carrying interaction handlers is a static-element a11y breach, and
   * the buttons are the real focus targets anyway.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const current = selectable.findIndex(({ index }) => index === active);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAt(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAt(current - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusAt(selectable.length - 1);
    }
  };

  return (
    <Popover
      className={className}
      contentClassName={cn("flex min-w-48 flex-col", contentClassName)}
      onOpenChange={setOpen}
      open={open}
      placement={placement}
      role="menu"
      trigger={trigger}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: separators carry no identity of their own
            <hr key={`separator-${index}`} className="my-1 border-0 border-border border-t" />
          );
        }
        return (
          <button
            key={item.value ?? `item-${index}`}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className={cn(
              "flex items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px] disabled:cursor-not-allowed disabled:opacity-50",
              item.destructive ? "text-error hover:bg-error/10" : "text-primary hover:bg-surface-alt",
            )}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.();
              onSelect?.(item);
              if (closeOnSelect) {
                setOpen(false);
              }
            }}
            // Keeps `active` in step with real focus — without it, arrowing
            // after a Tab or a click starts from the wrong item.
            onFocus={() => setActive(index)}
            onKeyDown={onKeyDown}
            role="menuitem"
            tabIndex={-1}
            type="button"
          >
            {item.icon ? <Icon className="shrink-0" name={item.icon} size="sm" /> : null}
            <span className="flex-1">{item.label}</span>
            {item.hint ? <span className="shrink-0 text-secondary text-xs">{item.hint}</span> : null}
          </button>
        );
      })}
    </Popover>
  );
}
