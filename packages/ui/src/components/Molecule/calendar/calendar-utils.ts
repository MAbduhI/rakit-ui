/*
 * Local-date helpers, no date library.
 *
 * Everything compares by year/month/day rather than by timestamp: a Date
 * carries a time, so two "same day" values an hour apart are not `===`, and
 * anything built on `getTime()` breaks across a DST boundary. Keeping the
 * comparisons calendar-based sidesteps both.
 */

export type CalendarWeekStart = 0 | 1;

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined): boolean =>
  Boolean(
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(),
  );

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const addMonths = (date: Date, count: number): Date =>
  // Day 1 first: adding a month to the 31st would otherwise skip a month.
  new Date(date.getFullYear(), date.getMonth() + count, 1);

export const addYears = (date: Date, count: number): Date => new Date(date.getFullYear() + count, date.getMonth(), 1);

/** Midnight-normalised comparison, so a time component cannot flip the result. */
export const isBefore = (a: Date, b: Date): boolean => startOfDay(a).getTime() < startOfDay(b).getTime();
export const isAfter = (a: Date, b: Date): boolean => startOfDay(a).getTime() > startOfDay(b).getTime();

export const isWithin = (date: Date, from: Date | null, to: Date | null): boolean => {
  if (!from || !to) return false;
  const [start, end] = isAfter(from, to) ? [to, from] : [from, to];
  return !isBefore(date, start) && !isAfter(date, end);
};

/**
 * The 6×7 grid for `month`, including the leading and trailing days that keep
 * every month the same height — a grid that reflows between months makes the
 * whole panel jump as you page through it.
 */
export function getMonthGrid(month: Date, weekStart: CalendarWeekStart = 1): Array<Date> {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);

  return Array.from(
    { length: 42 },
    (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

/** Weekday headers in the locale's short form, rotated to `weekStart`. */
export function getWeekdayLabels(locale: string, weekStart: CalendarWeekStart = 1): Array<string> {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2024-01-07 is a Sunday, so index 0 lines up with getDay() === 0.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, 7 + ((index + weekStart) % 7))));
}

/** ISO-8601 week number — the one users expect on a business calendar. */
export function getWeekNumber(date: Date): number {
  const target = startOfDay(date);
  // Shift to the Thursday of this week; ISO weeks are numbered by their Thursday.
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
}
