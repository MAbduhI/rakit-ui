import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RunBanner } from "./run-banner";

const logos = [<span key="a">Alpha</span>, <span key="b">Beta</span>, <span key="c">Gamma</span>];

const renderBanner = (props: Partial<Parameters<typeof RunBanner>[0]> = {}) =>
  render(<RunBanner {...props}>{logos}</RunBanner>);

/** The animated track — the element carrying the keyframes. */
const track = (container: HTMLElement) => container.firstElementChild?.firstElementChild as HTMLElement;

describe("RunBanner", () => {
  it("renders the content twice so the loop has no seam", () => {
    renderBanner();
    expect(screen.getAllByText("Alpha")).toHaveLength(2);
  });

  it("hides the duplicate copy from assistive tech", () => {
    const { container } = renderBanner();
    const copies = track(container).children;
    expect(copies[0]).not.toHaveAttribute("aria-hidden");
    expect(copies[1]).toHaveAttribute("aria-hidden", "true");
  });

  describe("axis", () => {
    it("runs horizontally by default", () => {
      const { container } = renderBanner();
      expect(track(container)).toHaveStyle({ animationName: "rakit-run-x" });
    });

    it("runs vertically when asked", () => {
      const { container } = renderBanner({ orientation: "vertical" });
      expect(track(container)).toHaveStyle({ animationName: "rakit-run-y" });
    });

    it("lets nav imply the axis over orientation", () => {
      const { container } = renderBanner({ orientation: "horizontal", nav: "bottom" });
      expect(track(container)).toHaveStyle({ animationName: "rakit-run-y" });
    });
  });

  describe("nav", () => {
    it.each([
      ["left", "normal"],
      ["top", "normal"],
      ["right", "reverse"],
      ["bottom", "reverse"],
    ] as const)("runs %s as %s", (nav, expected) => {
      const { container } = renderBanner({ nav });
      expect(track(container)).toHaveStyle({ animationDirection: expected });
    });
  });

  describe("size", () => {
    it.each([
      ["sm", "h-8"],
      ["lg", "h-12"],
      ["3xl", "h-24"],
      ["5xl", "h-40"],
    ] as const)("sets the band height for %s", (size, expected) => {
      const { container } = renderBanner({ size });
      expect(container.firstElementChild).toHaveClass(expected);
    });

    it("sets a width instead when vertical", () => {
      const { container } = renderBanner({ orientation: "vertical", size: "2xl" });
      expect(container.firstElementChild).toHaveClass("w-20");
    });
  });

  it("applies speed as the lap duration", () => {
    const { container } = renderBanner({ speed: 5000 });
    expect(track(container)).toHaveStyle({ animationDuration: "5000ms" });
  });

  describe("gap and endGap", () => {
    it("slides exactly one copy when there is no end gap", () => {
      const { container } = renderBanner({ gap: 40, endGap: false });
      const element = track(container);
      expect(element.style.getPropertyValue("--rakit-run-shift")).toBe("-50%");
      // No gap between the two copies, so item 1 follows the last immediately.
      expect(element).toHaveStyle({ gap: "0px" });
    });

    it("corrects the slide by half a gap when there is one", () => {
      const { container } = renderBanner({ gap: 40, endGap: true });
      const element = track(container);
      // One copy is 50% + gap/2 of the track, so -50% alone would drift each lap.
      expect(element.style.getPropertyValue("--rakit-run-shift")).toBe("calc(-50% - 20px)");
      expect(element).toHaveStyle({ gap: "40px" });
    });

    it("spaces the items inside each copy either way", () => {
      const { container } = renderBanner({ gap: 12 });
      expect(track(container).firstElementChild).toHaveStyle({ gap: "12px" });
    });
  });

  it("stops animating under reduced motion", () => {
    const { container } = renderBanner();
    expect(track(container)).toHaveClass("motion-reduce:animate-none");
  });

  it("merges className onto the band", () => {
    const { container } = renderBanner({ className: "bg-surface-alt" });
    expect(container.firstElementChild).toHaveClass("bg-surface-alt", "overflow-hidden");
  });
});
