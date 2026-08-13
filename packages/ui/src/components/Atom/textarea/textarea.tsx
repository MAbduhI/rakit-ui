import { type TextareaHTMLAttributes, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Grows with the content instead of scrolling. antd calls this `autoSize`. */
  autoResize?: boolean;
  /** Character counter in the corner. Pairs with `maxLength`. */
  showCount?: boolean;
  containerClassName?: string;
}

export function Textarea({
  autoResize = false,
  showCount = false,
  className,
  containerClassName,
  onChange,
  rows = 3,
  maxLength,
  value,
  defaultValue,
  ...props
}: TextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [count, setCount] = useState(String(value ?? defaultValue ?? "").length);

  const resize = useCallback(() => {
    const element = ref.current;
    if (!element || !autoResize) {
      return;
    }
    // Reset first — scrollHeight only shrinks if the box is allowed to.
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [autoResize]);

  /*
   * `value` is a re-run trigger, not something the effect reads: when a
   * controlled value changes from outside, the box has to re-measure. Biome
   * only counts dependencies that appear in the body.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: `value` is the signal to re-measure, not a value the effect reads
  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-md border border-input bg-surface px-3 py-2 text-primary text-sm placeholder:text-secondary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          autoResize ? "resize-none overflow-hidden" : "resize-y",
          showCount && "pb-6",
          className,
        )}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={(event) => {
          setCount(event.target.value.length);
          resize();
          onChange?.(event);
        }}
        rows={rows}
        value={value}
        {...props}
      />
      {showCount ? (
        <span aria-hidden className="pointer-events-none absolute right-3 bottom-2 text-secondary text-xs tabular-nums">
          {count}
          {maxLength ? ` / ${maxLength}` : null}
        </span>
      ) : null}
    </div>
  );
}
