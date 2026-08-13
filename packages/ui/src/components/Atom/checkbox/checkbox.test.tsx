import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("renders an unchecked checkbox", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("toggles and reports the new state", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("still calls a plain onChange", async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("labels itself and toggles from the label", async () => {
    render(<Checkbox id="terms" label="Accept terms" />);
    await userEvent.click(screen.getByText("Accept terms"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("renders a description alongside the label", () => {
    render(<Checkbox description="You can opt out later" label="Emails" />);
    expect(screen.getByText("You can opt out later")).toBeInTheDocument();
  });

  it("sets the indeterminate DOM property, which has no attribute", () => {
    render(<Checkbox indeterminate />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
  });

  it("clears indeterminate when it turns off", () => {
    const { rerender } = render(<Checkbox indeterminate />);
    rerender(<Checkbox indeterminate={false} />);
    expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(false);
  });

  it("is disabled when asked", () => {
    render(<Checkbox disabled label="Nope" />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it.each([
    ["sm", "size-4"],
    ["md", "size-5"],
    ["lg", "size-6"],
  ] as const)("sizes the box at %s", (size, expected) => {
    const { container } = render(<Checkbox size={size} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });
});
