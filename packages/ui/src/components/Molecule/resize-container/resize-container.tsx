import {
  Children,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "../../../utils";

export type ResizeOrientation = "horizontal" | "vertical";

export interface ResizeContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** One panel per child. Handles are inserted between them. */
  children: ReactNode;
  /** `horizontal` splits into columns, `vertical` into rows. */
  orientation?: ResizeOrientation;
  /** Starting sizes as percentages. Defaults to an even split. */
  defaultSizes?: Array<number>;
  /** Controlled sizes. Pair with `onChange`. */
  sizes?: Array<number>;
  onChange?: (sizes: Array<number>) => void;
  /** Smallest a panel may be dragged to, in percent. */
  minSize?: number;
  /** Percentage a keyboard arrow press moves the handle. */
  keyboardStep?: number;
  disabled?: boolean;
}

const evenSplit = (count: number): Array<number> => Array.from({ length: count }, () => 100 / count);

export function ResizeContainer({
  children,
  orientation = "horizontal",
  defaultSizes,
  sizes: controlledSizes,
  onChange,
  minSize = 10,
  keyboardStep = 5,
  disabled = false,
  className,
  ...props
}: ResizeContainerProps) {
  const panels = Children.toArray(children);
  const isHorizontal = orientation === "horizontal";
  const containerRef = useRef<HTMLDivElement>(null);

  const [uncontrolled, setUncontrolled] = useState<Array<number>>(
    () => defaultSizes ?? evenSplit(Math.max(1, panels.length)),
  );
  const sizes = controlledSizes ?? uncontrolled;

  const commit = useCallback(
    (next: Array<number>) => {
      if (controlledSizes === undefined) {
        setUncontrolled(next);
      }
      onChange?.(next);
    },
    [controlledSizes, onChange],
  );

  /*
   * A drag only ever moves the boundary between two neighbours: whatever one
   * gains the other loses. Resizing the whole row from one handle would make
   * every other handle jump, which is not what a splitter should feel like.
   */
  const resizeAt = useCallback(
    (index: number, deltaPercent: number) => {
      const current = sizes;
      const first = current[index] ?? 0;
      const second = current[index + 1] ?? 0;
      const total = first + second;

      const nextFirst = Math.min(total - minSize, Math.max(minSize, first + deltaPercent));
      if (nextFirst === first) {
        return;
      }

      const next = [...current];
      next[index] = nextFirst;
      next[index + 1] = total - nextFirst;
      commit(next);
    },
    [sizes, minSize, commit],
  );

  const onPointerDown = (index: number) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Capture on the handle so the drag survives the pointer leaving it.
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = container.getBoundingClientRect();
    const extent = isHorizontal ? rect.width : rect.height;
    const start = isHorizontal ? event.clientX : event.clientY;
    const startSizes = sizes;

    const onPointerMove = (move: PointerEvent) => {
      const position = isHorizontal ? move.clientX : move.clientY;
      const deltaPercent = ((position - start) / extent) * 100;

      const first = startSizes[index] ?? 0;
      const second = startSizes[index + 1] ?? 0;
      const total = first + second;
      const nextFirst = Math.min(total - minSize, Math.max(minSize, first + deltaPercent));

      const next = [...startSizes];
      next[index] = nextFirst;
      next[index + 1] = total - nextFirst;
      commit(next);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    const back = isHorizontal ? "ArrowLeft" : "ArrowUp";
    const forward = isHorizontal ? "ArrowRight" : "ArrowDown";

    if (event.key === back) {
      event.preventDefault();
      resizeAt(index, -keyboardStep);
    } else if (event.key === forward) {
      event.preventDefault();
      resizeAt(index, keyboardStep);
    }
  };

  return (
    <div ref={containerRef} className={cn("flex", isHorizontal ? "flex-row" : "flex-col", className)} {...props}>
      {panels.map((panel, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: panels are positional by definition — index is the identity
        <div key={`panel-${index}`} className="contents">
          <div className="min-h-0 min-w-0 overflow-hidden" style={{ flexBasis: `${sizes[index] ?? 0}%` }}>
            {panel}
          </div>

          {index < panels.length - 1 ? (
            // biome-ignore lint/a11y/useSemanticElements: APG's window-splitter pattern needs a focusable separator carrying aria-valuenow; <hr> is void, so it cannot host the widened hit area
            <div
              aria-orientation={isHorizontal ? "vertical" : "horizontal"}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(sizes[index] ?? 0)}
              className={cn(
                "group relative shrink-0 bg-border transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                isHorizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
                disabled ? "cursor-default opacity-50" : "hover:bg-accent",
              )}
              onKeyDown={onKeyDown(index)}
              onPointerDown={onPointerDown(index)}
              role="separator"
              tabIndex={disabled ? -1 : 0}
            >
              {/*
                The rail is 1px so it reads as a divider, but a 1px drag target
                is unusable — this widens the hit area without widening the line.
              */}
              <span
                aria-hidden
                className={cn(
                  "absolute",
                  isHorizontal ? "-inset-x-1.5 inset-y-0" : "-inset-y-1.5 inset-x-0",
                  disabled ? "cursor-default" : isHorizontal ? "cursor-col-resize" : "cursor-row-resize",
                )}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
