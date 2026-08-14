import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../Atom/badge";
import { Button } from "../../Atom/button";
import { Calendar, type CalendarRange } from "./calendar";

const meta = {
  title: "Components/Molecule/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    weekStart: { control: "inline-radio", options: [0, 1] },
    locale: { control: "select", options: ["en-GB", "en-US", "id-ID", "de-DE", "ja-JP"] },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Fixed month so the stories look the same on any day. */
const AUGUST = new Date(2026, 7, 1);

export const Default: Story = {
  args: { defaultMonth: AUGUST },
};

export const WithSelection: Story = {
  args: { defaultMonth: AUGUST, defaultValue: new Date(2026, 7, 14) },
};

/**
 * Two clicks close a range, and the second is ordered against the first — a
 * backwards pick still comes back low-to-high. Hovering previews the span.
 */
export const Range: Story = {
  args: { defaultMonth: AUGUST },
  render: () => {
    const [range, setRange] = useState<CalendarRange>({ from: new Date(2026, 7, 10), to: new Date(2026, 7, 18) });
    const format = (date: Date | null) => (date ? date.toLocaleDateString("en-GB") : "—");
    return (
      <div className="flex flex-col gap-3">
        <Calendar defaultMonth={AUGUST} mode="range" onSelect={setRange} value={range} />
        <code className="text-secondary text-xs">
          {format(range.from)} → {format(range.to)}
        </code>
      </div>
    );
  },
};

/** `disabledDate` blocks by predicate; `minDate`/`maxDate` bound the window. */
export const DisabledDays: Story = {
  args: {
    defaultMonth: AUGUST,
    // Weekends off, and only the middle of the month bookable.
    disabledDate: (date) => date.getDay() === 0 || date.getDay() === 6,
    minDate: new Date(2026, 7, 5),
    maxDate: new Date(2026, 7, 25),
  },
};

/** antd's `dateCellRender` — arbitrary content under each day number. */
export const WithCellContent: Story = {
  args: {
    defaultMonth: AUGUST,
    cellRender: (date) => {
      if (date.getDate() === 12) return <Badge variant="error">2</Badge>;
      if (date.getDate() === 19) return <Badge variant="warning">1</Badge>;
      if (date.getDate() === 26) return <Badge variant="success">3</Badge>;
      return null;
    },
  },
};

export const WeekNumbers: Story = {
  args: { defaultMonth: AUGUST, showWeekNumbers: true },
};

export const HideOutsideDays: Story = {
  args: { defaultMonth: AUGUST, hideOutsideDays: true },
};

export const YearNavigation: Story = {
  args: { defaultMonth: AUGUST, showYearNav: true },
};

/** Weekday and month names come from `Intl`, so the locale drives both. */
export const Locales: Story = {
  args: { defaultMonth: AUGUST },
  render: (args) => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          ["en-GB", 1],
          ["en-US", 0],
          ["id-ID", 1],
          ["ja-JP", 0],
        ] as const
      ).map(([locale, weekStart]) => (
        <div key={locale} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">{locale}</code>
          <Calendar {...args} locale={locale} weekStart={weekStart} />
        </div>
      ))}
    </div>
  ),
};

export const WithFooter: Story = {
  args: { defaultMonth: AUGUST },
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 7, 14));
    return (
      <Calendar
        defaultMonth={AUGUST}
        footer={
          <div className="flex justify-between gap-2">
            <Button onClick={() => setValue(new Date())} size="sm" variant="outline">
              Today
            </Button>
            <Button disabled={!value} onClick={() => setValue(null)} size="sm" variant="ghost">
              Clear
            </Button>
          </div>
        }
        onSelect={setValue}
        value={value}
      />
    );
  },
};

/** `renderHeader` replaces the month bar outright. */
export const CustomHeader: Story = {
  args: {
    defaultMonth: AUGUST,
    renderHeader: ({ month, setMonth }) => (
      <div className="flex items-center justify-between pb-3">
        <Button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          size="sm"
          variant="ghost"
        >
          Back
        </Button>
        <span className="font-semibold text-sm">{month.getFullYear()}</span>
        <Button
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          size="sm"
          variant="ghost"
        >
          Next
        </Button>
      </div>
    ),
  },
};
