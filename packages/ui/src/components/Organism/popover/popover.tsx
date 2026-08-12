import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils";
import { useDismiss } from "./use-dismiss";

export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

/*
 * ponytail: positioned with plain absolute offsets against a `relative`
 * wrapper — no collision detection, and an ancestor with `overflow: hidden`
 * will clip the panel. That covers the common cases at a fraction of the code;
 * swap in a real positioning engine (or the P4 primitive library) if flipping
 * near a viewport edge starts mattering.
 */
const placements: Record<PopoverPlacement, string> = {
  top: "-translate-x-1/2 bottom-full left-1/2 mb-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "right-0 bottom-full mb-2",
  bottom: "-translate-x-1/2 top-full left-1/2 mt-2",
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end": "top-full right-0 mt-2",
  left: "-translate-y-1/2 top-1/2 right-full mr-2",
  "left-start": "top-0 right-full mr-2",
  "left-end": "right-full bottom-0 mr-2",
  right: "-translate-y-1/2 top-1/2 left-full ml-2",
  "right-start": "top-0 left-full ml-2",
  "right-end": "bottom-0 left-full ml-2",
};

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /** The element that opens it. Cloned to receive onClick and aria-expanded. */
  trigger: ReactElement;
  children: ReactNode;
  placement?: PopoverPlacement;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes for the floating panel — `className` styles the wrapper. */
  contentClassName?: string;
  role?: "dialog" | "menu" | "listbox";
}

export function Popover({
  trigger,
  children,
  placement = "bottom-start",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  contentClassName,
  role = "dialog",
  ...props
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolled;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolled(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const dismiss = useCallback(() => setOpen(false), [setOpen]);
  useDismiss(wrapperRef, open, dismiss);

  const triggerNode = isValidElement<HTMLAttributes<HTMLElement>>(trigger)
    ? cloneElement(trigger, {
        "aria-controls": open ? contentId : undefined,
        "aria-expanded": open,
        "aria-haspopup": role,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          trigger.props.onClick?.(event);
          setOpen(!open);
        },
      })
    : trigger;

  return (
    <div ref={wrapperRef} className={cn("relative inline-block", className)} {...props}>
      {triggerNode}
      {open ? (
        <div
          className={cn(
            "absolute z-50 min-w-max rounded-md border border-border bg-surface p-1 text-primary shadow-lg",
            placements[placement],
            contentClassName,
          )}
          id={contentId}
          role={role}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
