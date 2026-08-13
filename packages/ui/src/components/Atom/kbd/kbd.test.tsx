import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("renders a <kbd> element", () => {
    const { container } = render(<Kbd>⌘</Kbd>);
    expect(container.querySelector("kbd")).toBeInTheDocument();
    expect(screen.getByText("⌘")).toBeInTheDocument();
  });

  it.each([
    ["sm", "h-5"],
    ["md", "h-6"],
    ["lg", "h-7"],
  ] as const)("sizes %s", (size, expected) => {
    render(<Kbd size={size}>K</Kbd>);
    expect(screen.getByText("K")).toHaveClass(expected);
  });

  it("merges className", () => {
    render(<Kbd className="text-accent">K</Kbd>);
    expect(screen.getByText("K")).toHaveClass("text-accent", "font-mono");
  });
});
