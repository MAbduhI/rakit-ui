import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  it("scrolls vertically by default", () => {
    render(<ScrollArea data-testid="area">content</ScrollArea>);
    expect(screen.getByTestId("area")).toHaveClass("overflow-y-auto", "overflow-x-hidden");
  });

  it.each([
    ["horizontal", "overflow-x-auto"],
    ["both", "overflow-auto"],
  ] as const)("handles %s", (orientation, expected) => {
    render(
      <ScrollArea data-testid="area" orientation={orientation}>
        content
      </ScrollArea>,
    );
    expect(screen.getByTestId("area")).toHaveClass(expected);
  });

  it("styles the native scrollbar rather than replacing it", () => {
    render(<ScrollArea data-testid="area">content</ScrollArea>);
    const area = screen.getByTestId("area");
    // Firefox surface and WebKit surface both, so the rail matches in each.
    expect(area).toHaveClass("[scrollbar-width:thin]");
    expect(area.className).toContain("::-webkit-scrollbar");
  });

  it("hides the rail without disabling scrolling", () => {
    render(
      <ScrollArea data-testid="area" scrollbar="hidden">
        content
      </ScrollArea>,
    );
    const area = screen.getByTestId("area");
    expect(area).toHaveClass("[scrollbar-width:none]", "overflow-y-auto");
  });

  it("masks the edges when faded", () => {
    render(
      <ScrollArea data-testid="area" fade>
        content
      </ScrollArea>,
    );
    expect(screen.getByTestId("area").className).toContain("mask-image");
  });

  it("fades along the scroll axis", () => {
    render(
      <ScrollArea data-testid="area" fade orientation="horizontal">
        content
      </ScrollArea>,
    );
    expect(screen.getByTestId("area").className).toContain("to_right");
  });

  it("merges className", () => {
    render(
      <ScrollArea className="h-40" data-testid="area">
        content
      </ScrollArea>,
    );
    expect(screen.getByTestId("area")).toHaveClass("h-40");
  });
});
