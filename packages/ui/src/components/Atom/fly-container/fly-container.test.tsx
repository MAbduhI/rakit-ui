import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlyContainer } from "./fly-container";

describe("FlyContainer", () => {
  it("defaults to bottom-right and stays fixed", () => {
    render(<FlyContainer>content</FlyContainer>);
    const container = screen.getByText("content");
    expect(container).toHaveClass("fixed", "bottom-6", "right-6");
  });

  it.each([
    ["top", "top-6"],
    ["mid", "top-1/2"],
    ["bottom", "bottom-6"],
  ] as const)("places vertical=%s with %s", (vertical, expected) => {
    render(<FlyContainer vertical={vertical}>content</FlyContainer>);
    expect(screen.getByText("content")).toHaveClass(expected);
  });

  it.each([
    ["left", "left-6"],
    ["center", "left-1/2"],
    ["right", "right-6"],
  ] as const)("places horizontal=%s with %s", (horizontal, expected) => {
    render(<FlyContainer horizontal={horizontal}>content</FlyContainer>);
    expect(screen.getByText("content")).toHaveClass(expected);
  });

  it("reads numbers as viewport units", () => {
    render(
      <FlyContainer horizontal={40} vertical={30}>
        content
      </FlyContainer>,
    );
    const container = screen.getByText("content");
    expect(container).toHaveStyle({ top: "30vh", left: "40vw" });
    // Keyword classes must not linger alongside the inline offsets.
    expect(container).not.toHaveClass("bottom-6", "right-6");
  });

  it("clamps viewport units to 1–100 so nothing lands off-screen", () => {
    const { rerender } = render(
      <FlyContainer horizontal={-20} vertical={999}>
        content
      </FlyContainer>,
    );
    expect(screen.getByText("content")).toHaveStyle({ top: "100vh", left: "1vw" });

    rerender(
      <FlyContainer horizontal={50} vertical={0}>
        content
      </FlyContainer>,
    );
    expect(screen.getByText("content")).toHaveStyle({ top: "1vh", left: "50vw" });
  });

  it("mixes a keyword axis with a numeric one", () => {
    render(
      <FlyContainer horizontal="center" vertical={25}>
        content
      </FlyContainer>,
    );
    const container = screen.getByText("content");
    expect(container).toHaveClass("left-1/2", "-translate-x-1/2");
    expect(container).toHaveStyle({ top: "25vh" });
  });

  it("lets style and className override the defaults", () => {
    render(
      <FlyContainer className="z-10" style={{ top: "10px" }}>
        content
      </FlyContainer>,
    );
    const container = screen.getByText("content");
    expect(container).toHaveClass("z-10");
    expect(container).toHaveStyle({ top: "10px" });
  });
});
