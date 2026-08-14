import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";
import { iconNames, iconRegistry } from "./icon-registry";

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

  /*
   * The registry now covers every Tabler icon, so rendering all of them takes
   * ~10s and proves little. A spread sample catches a broken lookup; the shape
   * assertion below catches junk exports leaking in, which is the failure that
   * actually happened before.
   */
  it("renders a sample spread across the registry", () => {
    const step = Math.floor(iconNames.length / 20);
    for (let index = 0; index < iconNames.length; index += step) {
      const name = iconNames[index];
      if (!name) continue;
      const { container, unmount } = render(<Icon name={name} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      unmount();
    }
  });

  it("covers the whole Tabler set", () => {
    expect(iconNames.length).toBeGreaterThan(6000);
    for (const name of ["map-pin", "check", "chevron-left", "chevrons-right", "menu", "x"]) {
      expect(iconNames).toContain(name);
    }
  });

  it("holds only components — no stray barrel exports", () => {
    // `createReactComponent`, `icons`, `iconsList` and `default` are exported
    // alongside the icons; any of them leaking in renders nothing at runtime.
    for (const junk of ["create-react-component", "icons-list", "default"]) {
      expect(iconNames).not.toContain(junk);
    }
    for (const name of iconNames) {
      expect(typeof iconRegistry[name]).toBe("object");
    }
  });

});
