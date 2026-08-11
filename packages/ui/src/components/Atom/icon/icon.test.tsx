import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";
import { iconNames } from "./icon-registry";

describe("Icon", () => {
  it("renders an svg hidden from assistive tech", () => {
    const { container } = render(<Icon name="map-pin" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it.each([
    ["sm", "size-4"],
    ["md", "size-5"],
    ["lg", "size-6"],
    ["xl", "size-7"],
    ["2xl", "size-8"],
    ["3xl", "size-10"],
    ["4xl", "size-12"],
    ["5xl", "size-16"],
  ] as const)("maps size %s to %s", (size, expected) => {
    const { container } = render(<Icon name="plus" size={size} />);
    expect(container.querySelector("svg")).toHaveClass(expected);
  });

  it("defaults to md and merges className", () => {
    const { container } = render(<Icon className="text-error" name="x" />);
    expect(container.querySelector("svg")).toHaveClass("size-5", "text-error");
  });

  it("renders every registered name", () => {
    for (const name of iconNames) {
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      unmount();
    }
  });
});
