import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./calendar";

/* Fixed month so the grid never shifts under the assertions. */
const AUGUST = new Date(2026, 7, 1);
/*
 * A six-week grid carries days from the neighbouring months, so a number can
 * appear twice — August 2026 shows both Aug 3 and Sep 3. The in-month day comes
 * first in DOM order for every number these tests use.
 */
const day = (n: number) => screen.getAllByRole("button", { name: String(n) })[0] as HTMLElement;

describe("Calendar", () => {
  it("renders the month and a full six-week grid", () => {
    render(<Calendar defaultMonth={AUGUST} />);
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    // Always 42 cells, so paging months never resizes the panel.
    expect(screen.getAllByRole("cell")).toHaveLength(42);
  });

  it("pages between months", async () => {
    render(<Calendar defaultMonth={AUGUST} />);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("September 2026")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("August 2026")).toBeInTheDocument();
  });

  it("adds year jumps only when asked", async () => {
    const { rerender } = render(<Calendar defaultMonth={AUGUST} />);
    expect(screen.queryByRole("button", { name: "Next year" })).not.toBeInTheDocument();

    rerender(<Calendar defaultMonth={AUGUST} showYearNav />);
    await userEvent.click(screen.getByRole("button", { name: "Next year" }));
    expect(screen.getByText("August 2027")).toBeInTheDocument();
  });

  describe("single mode", () => {
    it("reports the picked day", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} onSelect={onSelect} />);

      await userEvent.click(day(14));
      expect(onSelect).toHaveBeenCalledWith(expect.any(Date));
      expect(onSelect.mock.calls[0]?.[0]?.getDate()).toBe(14);
      expect(day(14)).toHaveAttribute("aria-pressed", "true");
    });

    it("clears when the selected day is clicked again", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} defaultValue={new Date(2026, 7, 14)} onSelect={onSelect} />);

      await userEvent.click(day(14));
      expect(onSelect).toHaveBeenCalledWith(null);
    });

    it("stays put when controlled", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} onSelect={onSelect} value={new Date(2026, 7, 3)} />);

      await userEvent.click(day(14));
      expect(onSelect).toHaveBeenCalled();
      expect(day(3)).toHaveAttribute("aria-pressed", "true");
      expect(day(14)).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("range mode", () => {
    it("takes two clicks to close a range", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} mode="range" onSelect={onSelect} />);

      await userEvent.click(day(10));
      expect(onSelect).toHaveBeenLastCalledWith({ from: expect.any(Date), to: null });

      await userEvent.click(day(15));
      const range = onSelect.mock.calls[1]?.[0];
      expect(range.from.getDate()).toBe(10);
      expect(range.to.getDate()).toBe(15);
    });

    it("orders the range when picked backwards", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} mode="range" onSelect={onSelect} />);

      await userEvent.click(day(20));
      await userEvent.click(day(5));
      const range = onSelect.mock.calls[1]?.[0];
      expect(range.from.getDate()).toBe(5);
      expect(range.to.getDate()).toBe(20);
    });

    it("restarts once a range is complete", async () => {
      const onSelect = vi.fn();
      render(
        <Calendar
          defaultMonth={AUGUST}
          defaultValue={{ from: new Date(2026, 7, 5), to: new Date(2026, 7, 9) }}
          mode="range"
          onSelect={onSelect}
        />,
      );

      await userEvent.click(day(20));
      expect(onSelect).toHaveBeenLastCalledWith({ from: expect.any(Date), to: null });
    });
  });

  describe("disabled days", () => {
    it("blocks via disabledDate", async () => {
      const onSelect = vi.fn();
      render(<Calendar defaultMonth={AUGUST} disabledDate={(date) => date.getDate() === 14} onSelect={onSelect} />);

      expect(day(14)).toBeDisabled();
      await userEvent.click(day(14));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("blocks outside minDate and maxDate", () => {
      render(<Calendar defaultMonth={AUGUST} maxDate={new Date(2026, 7, 20)} minDate={new Date(2026, 7, 10)} />);
      expect(day(9)).toBeDisabled();
      expect(day(10)).toBeEnabled();
      expect(day(21)).toBeDisabled();
    });
  });

  describe("keyboard", () => {
    it("moves a day at a time with the arrows", async () => {
      render(<Calendar defaultMonth={AUGUST} defaultValue={new Date(2026, 7, 14)} />);
      day(14).focus();

      await userEvent.keyboard("{ArrowRight}");
      expect(day(15)).toHaveFocus();

      await userEvent.keyboard("{ArrowDown}");
      expect(day(22)).toHaveFocus();
    });

    it("uses one tab stop for the whole grid", () => {
      render(<Calendar defaultMonth={AUGUST} defaultValue={new Date(2026, 7, 14)} />);
      expect(day(14)).toHaveAttribute("tabindex", "0");
      expect(day(15)).toHaveAttribute("tabindex", "-1");
    });

    it("pages the month with PageDown", async () => {
      render(<Calendar defaultMonth={AUGUST} defaultValue={new Date(2026, 7, 14)} />);
      day(14).focus();

      await userEvent.keyboard("{PageDown}");
      expect(screen.getByText("September 2026")).toBeInTheDocument();
    });
  });

  it("renders extra cell content", () => {
    render(<Calendar cellRender={(date) => (date.getDate() === 14 ? <span>2 due</span> : null)} defaultMonth={AUGUST} />);
    expect(screen.getByText("2 due")).toBeInTheDocument();
  });

  it("shows ISO week numbers when asked", () => {
    render(<Calendar defaultMonth={AUGUST} showWeekNumbers />);
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  it("hides adjacent-month days when asked", () => {
    render(<Calendar defaultMonth={AUGUST} hideOutsideDays />);
    // 1 August 2026 is a Saturday, so a Monday-start grid leads with July days.
    expect(screen.getAllByRole("button", { name: "31" })).toHaveLength(1);
  });

  it("takes a custom header", () => {
    render(<Calendar defaultMonth={AUGUST} renderHeader={() => <p>custom header</p>} />);
    expect(screen.getByText("custom header")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next month" })).not.toBeInTheDocument();
  });

  it("renders a footer", () => {
    render(<Calendar defaultMonth={AUGUST} footer={<button type="button">Today</button>} />);
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
  });
});
