import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Divider } from "./divider";

describe("Divider", () => {
  it("defaults to a thin horizontal separator", () => {
    render(<Divider />);
    const divider = screen.getByRole("separator");
    expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    expect(divider).toHaveClass("h-px", "w-full", "bg-border");
  });

  it.each([
    ["sm", "h-px"],
    ["md", "h-0.5"],
    ["lg", "h-1"],
    ["xl", "h-1.5"],
    ["2xl", "h-2"],
  ] as const)("grows horizontal thickness at %s", (size, thickness) => {
    render(<Divider size={size} />);
    expect(screen.getByRole("separator")).toHaveClass(thickness);
  });

  it.each([
    ["sm", "w-px"],
    ["md", "w-0.5"],
    ["lg", "w-1"],
    ["xl", "w-1.5"],
    ["2xl", "w-2"],
  ] as const)("grows vertical thickness at %s", (size, thickness) => {
    render(<Divider orientation="vertical" size={size} />);
    const divider = screen.getByRole("separator");
    expect(divider).toHaveAttribute("aria-orientation", "vertical");
    expect(divider).toHaveClass(thickness, "h-full");
  });
});
