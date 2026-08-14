import { type HTMLAttributes, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "../../../utils";
import { Icon } from "../../Atom/icon";
import {
  addMonths,
  addYears,
  type CalendarWeekStart,
  getMonthGrid,
  getWeekdayLabels,
  getWeekNumber,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithin,
  startOfDay,
} from "./calendar-utils";

export type CalendarMode = "single" | "range";

export interface CalendarRange {
  from: Date | null;
  to: Date | null;
}

interface CalendarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "onChange" | "defaultValue"> {
  /** Month on screen. Uncontrolled unless paired with `onMonthChange`. */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Blocks a day from selection. Blocked days are still rendered, greyed. */
  disabledDate?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  /** 0 = Sunday, 1 = Monday. */
  weekStart?: CalendarWeekStart;
  /** BCP 47 tag for weekday and month names. */
  locale?: string;
  showWeekNumbers?: boolean;
  /** Hides the leading/trailing days of adjacent months. */
  hideOutsideDays?: boolean;
  /** antd's `dateCellRender` — extra content under the day number. */
  cellRender?: (date: Date) => ReactNode;
  /** Replaces the header entirely. */
  renderHeader?: (state: { month: Date; setMonth: (month: Date) => void }) => ReactNode;
  /** Adds year jump buttons either side of the month arrows. */
  showYearNav?: boolean;
  footer?: ReactNode;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onSelect?: (date: Date | null) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  value?: CalendarRange;
  defaultValue?: CalendarRange;
  onSelect?: (range: CalendarRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const EMPTY_RANGE: CalendarRange = { from: null, to: null };

export function Calendar(props: CalendarProps) {
  const {
    /*
     * Pulled out only to keep them from reaching the DOM — the union-specific
     * ones are read back off `props` below, where the `mode` discriminant can
     * still narrow them.
     */
    mode: _mode,
    value: _value,
    defaultValue: _defaultValue,
    onSelect: _onSelect,
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    disabledDate,
    minDate,
    maxDate,
    weekStart = 1,
    locale = "en-GB",
    showWeekNumbers = false,
    hideOutsideDays = false,
    cellRender,
    renderHeader,
    showYearNav = false,
    footer,
    className,
    ...rest
  } = props;

  const mode = props.mode ?? "single";
  const isRange = mode === "range";

  const [uncontrolledMonth, setUncontrolledMonth] = useState<Date>(
    () =>
      defaultMonth ??
      (props.mode === "range" ? (props.defaultValue?.from ?? new Date()) : (props.defaultValue ?? new Date())),
  );
  const month = controlledMonth ?? uncontrolledMonth;

  const [uncontrolledSingle, setUncontrolledSingle] = useState<Date | null>(() =>
    props.mode === "range" ? null : (props.defaultValue ?? null),
  );
  const [uncontrolledRange, setUncontrolledRange] = useState<CalendarRange>(() =>
    props.mode === "range" ? (props.defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE,
  );

  const singleValue = props.mode === "range" ? null : (props.value ?? uncontrolledSingle);
  const rangeValue = props.mode === "range" ? (props.value ?? uncontrolledRange) : EMPTY_RANGE;

  /** Hovered day while a range is half-open, so the preview follows the cursor. */
  const [preview, setPreview] = useState<Date | null>(null);

  /*
   * APG grid: exactly one day is tabbable, and the arrows move between them.
   * Without this the month is 42 consecutive tab stops, and `role="grid"`
   * would be promising a navigation model that is not there.
   */
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => (props.mode === "range" ? props.defaultValue?.from : props.defaultValue) ?? new Date(),
  );
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldFocus = useRef(false);

  useEffect(() => {
    if (!shouldFocus.current) {
      return;
    }
    shouldFocus.current = false;
    dayRefs.current.get(startOfDay(focusedDate).toDateString())?.focus();
  }, [focusedDate]);

  const setMonth = (next: Date) => {
    if (controlledMonth === undefined) {
      setUncontrolledMonth(next);
    }
    onMonthChange?.(next);
  };

  const isDisabled = (date: Date): boolean => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return Boolean(disabledDate?.(date));
  };

  const select = (date: Date) => {
    if (isDisabled(date)) {
      return;
    }

    if (props.mode === "range") {
      const { from, to } = rangeValue;
      // A complete range restarts; an open one closes, ordered low-to-high.
      const next: CalendarRange =
        !from || (from && to)
          ? { from: date, to: null }
          : isBefore(date, from)
            ? { from: date, to: from }
            : { from, to: date };

      if (props.value === undefined) {
        setUncontrolledRange(next);
      }
      setPreview(null);
      props.onSelect?.(next);
      return;
    }

    // Clicking the selected day clears it, matching a radio you can unset.
    const next = isSameDay(date, singleValue) ? null : date;
    if (props.value === undefined) {
      setUncontrolledSingle(next);
    }
    props.onSelect?.(next);
  };

  const moveFocus = (next: Date) => {
    shouldFocus.current = true;
    setFocusedDate(next);
    // Paging past an edge follows the focus into the neighbouring month.
    if (!isSameMonth(next, month)) {
      setMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLTableElement>) => {
    const from = focusedDate;
    const shift = (offset: number) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
    // Index of the day within its own week, so Home/End land on the edges.
    const dayOfWeek = (from.getDay() - weekStart + 7) % 7;

    let next: Date | undefined;
    if (event.key === "ArrowLeft") {
      next = shift(-1);
    } else if (event.key === "ArrowRight") {
      next = shift(1);
    } else if (event.key === "ArrowUp") {
      next = shift(-7);
    } else if (event.key === "ArrowDown") {
      next = shift(7);
    } else if (event.key === "Home") {
      next = shift(-dayOfWeek);
    } else if (event.key === "End") {
      next = shift(6 - dayOfWeek);
    } else if (event.key === "PageUp") {
      next = new Date(from.getFullYear(), from.getMonth() - 1, from.getDate());
    } else if (event.key === "PageDown") {
      next = new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());
    }

    if (!next) {
      return;
    }
    event.preventDefault();
    moveFocus(next);
  };

  const days = getMonthGrid(month, weekStart);
  const weekdays = getWeekdayLabels(locale, weekStart);
  const today = startOfDay(new Date());
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);

  const openFrom = isRange && rangeValue.from && !rangeValue.to ? rangeValue.from : null;
  const rangeTo = rangeValue.to ?? (openFrom ? preview : null);

  const navButton =
    "rounded-md p-1.5 text-secondary transition-colors hover:bg-surface-alt hover:text-primary focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div
      className={cn("w-fit rounded-md border border-border bg-surface p-3 text-primary", className)}
      // `rest` is a union of both members' leftovers; every member extends
      // HTMLAttributes, so the widening is sound and TS just cannot see it.
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {renderHeader ? (
        renderHeader({ month, setMonth })
      ) : (
        <div className="flex items-center justify-between gap-2 pb-3">
          <div className="flex items-center gap-1">
            {showYearNav ? (
              <button
                aria-label="Previous year"
                className={navButton}
                onClick={() => setMonth(addYears(month, -1))}
                type="button"
              >
                <Icon name="chevrons-left" size="sm" />
              </button>
            ) : null}
            <button
              aria-label="Previous month"
              className={navButton}
              onClick={() => setMonth(addMonths(month, -1))}
              type="button"
            >
              <Icon name="chevron-left" size="sm" />
            </button>
          </div>

          <span aria-live="polite" className="font-medium text-sm">
            {monthLabel}
          </span>

          <div className="flex items-center gap-1">
            <button
              aria-label="Next month"
              className={navButton}
              onClick={() => setMonth(addMonths(month, 1))}
              type="button"
            >
              <Icon name="chevron-right" size="sm" />
            </button>
            {showYearNav ? (
              <button
                aria-label="Next year"
                className={navButton}
                onClick={() => setMonth(addYears(month, 1))}
                type="button"
              >
                <Icon name="chevrons-right" size="sm" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/*
        Native table semantics rather than role="grid". The substance of the
        grid pattern — one tab stop, arrow keys between days — is in
        onGridKeyDown either way; `grid`/`gridcell` would only change how it is
        announced, and it requires suppressing three a11y lints to say it.
      */}
      <table className="border-collapse" onKeyDown={onGridKeyDown}>
        <thead>
          <tr>
            {showWeekNumbers ? <th className="w-8" /> : null}
            {weekdays.map((day) => (
              <th key={day} className="pb-1 font-normal text-secondary text-xs" scope="col">
                <abbr aria-label={day} className="no-underline">
                  {day}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => days.slice(week * 7, week * 7 + 7)).map((row) => {
            const firstOfRow = row[0];
            if (!firstOfRow) {
              return null;
            }
            return (
              <tr key={firstOfRow.toISOString()}>
                {showWeekNumbers ? (
                  <td className="pr-2 text-right align-middle text-secondary text-xs tabular-nums">
                    {getWeekNumber(firstOfRow)}
                  </td>
                ) : null}

                {row.map((date) => {
                  const outside = !isSameMonth(date, month);
                  const disabled = isDisabled(date);
                  const selectedSingle = !isRange && isSameDay(date, singleValue);
                  const isStart = isRange && isSameDay(date, rangeValue.from);
                  const isEnd = isRange && isSameDay(date, rangeTo);
                  const inRange = isRange && isWithin(date, rangeValue.from, rangeTo);
                  const selected = selectedSingle || isStart || isEnd;

                  if (outside && hideOutsideDays) {
                    // A placeholder keeps the row shape when outside days are hidden.
                    return <td key={date.toISOString()} className="p-0" />;
                  }

                  return (
                    <td
                      key={date.toISOString()}
                      className={cn(
                        "p-0",
                        // The connecting tint sits on the cell, not the button,
                        // so the run reads as continuous between days.
                        inRange && !selected && "bg-accent/10",
                        isStart && rangeTo && !isSameDay(rangeValue.from, rangeTo) && "rounded-l-md bg-accent/10",
                        isEnd && rangeValue.from && !isSameDay(rangeValue.from, rangeTo) && "rounded-r-md bg-accent/10",
                      )}
                    >
                      <button
                        ref={(node) => {
                          const key = date.toDateString();
                          if (node) {
                            dayRefs.current.set(key, node);
                          } else {
                            dayRefs.current.delete(key);
                          }
                        }}
                        aria-current={isSameDay(date, today) ? "date" : undefined}
                        aria-pressed={selected}
                        className={cn(
                          "flex size-9 flex-col items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]",
                          "disabled:pointer-events-none disabled:opacity-30",
                          cellRender && "size-auto min-h-14 w-full justify-start gap-0.5 p-1",
                          selected
                            ? "bg-accent font-medium text-accent-foreground"
                            : outside
                              ? "text-secondary/60 hover:bg-surface-alt"
                              : "hover:bg-surface-alt",
                          !selected && isSameDay(date, today) && "font-semibold text-accent",
                        )}
                        disabled={disabled}
                        onClick={() => select(date)}
                        onFocus={() => {
                          setFocusedDate(date);
                          if (openFrom) {
                            setPreview(date);
                          }
                        }}
                        onMouseEnter={() => openFrom && setPreview(date)}
                        tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                        type="button"
                      >
                        <span>{date.getDate()}</span>
                        {cellRender ? <span className="w-full">{cellRender(date)}</span> : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {footer ? <div className="pt-3">{footer}</div> : null}
    </div>
  );
}
