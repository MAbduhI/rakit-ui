import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Carousel } from "./carousel";

const slides = [<div key="a">Slide A</div>, <div key="b">Slide B</div>, <div key="c">Slide C</div>];

const renderCarousel = (props: Partial<Parameters<typeof Carousel>[0]> = {}) =>
  render(<Carousel {...props}>{slides}</Carousel>);

describe("Carousel", () => {
  it("renders every slide and marks the inactive ones hidden", () => {
    renderCarousel();
    expect(screen.getByText("Slide A")).toBeInTheDocument();
    expect(screen.getByText("Slide B").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes itself as a carousel region", () => {
    renderCarousel();
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carousel");
  });

  describe("nav", () => {
    it("shows one dot per slide, with the current one selected", () => {
      renderCarousel();
      const dots = screen.getAllByRole("tab");
      expect(dots).toHaveLength(3);
      expect(dots[0]).toHaveAttribute("aria-selected", "true");
    });

    it("moves to the clicked slide", async () => {
      renderCarousel();
      await userEvent.click(screen.getByRole("tab", { name: "Go to slide 3" }));
      expect(screen.getByRole("tab", { name: "Go to slide 3" })).toHaveAttribute("aria-selected", "true");
    });

    it("can be hidden", () => {
      renderCarousel({ nav: false });
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });

    it.each([
      ["bottom", "flex-col"],
      ["top", "flex-col-reverse"],
      ["right", "flex-row"],
      ["left", "flex-row-reverse"],
    ] as const)("lays out %s", (navPosition, expected) => {
      renderCarousel({ navPosition });
      expect(screen.getByRole("region")).toHaveClass(expected);
    });
  });

  describe("chevron", () => {
    it("is absent unless asked for", () => {
      renderCarousel();
      expect(screen.queryByRole("button", { name: "Next slide" })).not.toBeInTheDocument();
    });

    it("steps forward and back", async () => {
      renderCarousel({ chevron: "horizontal" });
      await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute("aria-selected", "true");

      await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
      expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute("aria-selected", "true");
    });

    it("disables at the ends without infinity", async () => {
      renderCarousel({ chevron: "horizontal" });
      expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();

      await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    });

    it("never disables with infinity", () => {
      renderCarousel({ chevron: "horizontal", infinity: true });
      expect(screen.getByRole("button", { name: "Previous slide" })).toBeEnabled();
    });
  });

  describe("axis", () => {
    it("translates on X by default", () => {
      renderCarousel({ chevron: "horizontal" });
      expect(screen.getByText("Slide A").parentElement?.parentElement).toHaveStyle({
        transform: "translateX(-0%)",
      });
    });

    it("treats vertical as winning over horizontal", async () => {
      renderCarousel({ vertical: true, horizontal: true, chevron: "vertical" });
      await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      expect(screen.getByText("Slide A").parentElement?.parentElement).toHaveStyle({
        transform: "translateY(-100%)",
      });
    });

    it("treats horizontal={false} as vertical", () => {
      renderCarousel({ horizontal: false });
      expect(screen.getByText("Slide A").parentElement?.parentElement).toHaveClass("flex-col");
    });
  });

  describe("effect", () => {
    it("fades via opacity when fade is set", () => {
      renderCarousel({ fade: true });
      expect(screen.getByText("Slide B").parentElement).toHaveStyle({ opacity: "0" });
      expect(screen.getByText("Slide A").parentElement).toHaveStyle({ opacity: "1" });
    });

    it("lets an explicit effect win over the fade shorthand", () => {
      renderCarousel({ fade: true, effect: "scroll" });
      expect(screen.getByText("Slide A").parentElement?.parentElement).toHaveStyle({
        transform: "translateX(-0%)",
      });
    });

    it("applies the ease to the transition", () => {
      renderCarousel({ ease: "linear" });
      expect(screen.getByText("Slide A").parentElement?.parentElement).toHaveStyle({
        transition: "transform 400ms linear",
      });
    });
  });

  describe("infinity", () => {
    it("wraps past the end", async () => {
      renderCarousel({ chevron: "horizontal", infinity: true });
      for (let step = 0; step < 3; step++) {
        await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      }
      expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute("aria-selected", "true");
    });

    it("wraps backwards from the start", async () => {
      renderCarousel({ chevron: "horizontal", infinity: true });
      await userEvent.click(screen.getByRole("button", { name: "Previous slide" }));
      expect(screen.getByRole("tab", { name: "Go to slide 3" })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("callbacks", () => {
    it("reports the move before it happens", async () => {
      const beforeChange = vi.fn();
      renderCarousel({ beforeChange, chevron: "horizontal" });

      await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
      expect(beforeChange).toHaveBeenCalledWith(0, 1);
    });

    it("does not fire for a move to the current slide", async () => {
      const beforeChange = vi.fn();
      renderCarousel({ beforeChange });

      await userEvent.click(screen.getByRole("tab", { name: "Go to slide 1" }));
      expect(beforeChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard", () => {
    it("steps with the arrow keys on the active axis", async () => {
      renderCarousel();
      // Focus a control inside the carousel — the keydown bubbles to the region.
      screen.getByRole("tab", { name: "Go to slide 1" }).focus();

      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute("aria-selected", "true");

      await userEvent.keyboard("{ArrowLeft}");
      expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute("aria-selected", "true");
    });

    it("uses up and down when vertical", async () => {
      renderCarousel({ vertical: true });
      screen.getByRole("tab", { name: "Go to slide 1" }).focus();

      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("autoScroll", () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
      );
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it("advances on the speed interval", () => {
      renderCarousel({ autoScroll: true, speed: 1000 });
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByRole("tab", { name: "Go to slide 2" })).toHaveAttribute("aria-selected", "true");
    });

    it("stops at the last slide without infinity", () => {
      renderCarousel({ autoScroll: true, speed: 1000 });
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByRole("tab", { name: "Go to slide 3" })).toHaveAttribute("aria-selected", "true");
    });

    it("wraps with infinity", () => {
      renderCarousel({ autoScroll: true, infinity: true, speed: 1000 });
      act(() => vi.advanceTimersByTime(3000));
      expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute("aria-selected", "true");
    });

    it("does not autoplay when the OS asks for reduced motion", () => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
      );
      renderCarousel({ autoScroll: true, speed: 1000 });
      act(() => vi.advanceTimersByTime(5000));
      expect(screen.getByRole("tab", { name: "Go to slide 1" })).toHaveAttribute("aria-selected", "true");
    });
  });
});
