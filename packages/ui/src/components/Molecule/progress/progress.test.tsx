import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
  it("exposes itself as a progressbar with the value", () => {
    render(<Progress value={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it.each([
    [-20, "0"],
    [150, "100"],
    [Number.NaN, "0"],
  ])("clamps %s to %s", (value, expected) => {
    render(<Progress value={value} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", expected);
  });

  describe("percent", () => {
    it("sets the fill width and shows the reading", () => {
      const { container } = render(<Progress value={30} />);
      expect(container.querySelector(".bg-accent")).toHaveStyle({ width: "30%" });
      expect(screen.getByText("30%")).toBeInTheDocument();
    });

    it("takes a custom reading", () => {
      render(<Progress formatValue={(value) => `${value} of 100`} value={30} />);
      expect(screen.getByText("30 of 100")).toBeInTheDocument();
    });

    it("can hide the reading", () => {
      render(<Progress showValue={false} value={30} />);
      expect(screen.queryByText("30%")).not.toBeInTheDocument();
    });
  });

  describe("dot", () => {
    it("fills the dots matching the value", () => {
      const { container } = render(<Progress steps={5} value={60} variant="dot" />);
      expect(container.querySelectorAll(".bg-accent")).toHaveLength(3);
      expect(container.querySelectorAll(".bg-border")).toHaveLength(2);
    });

    it("honours the step count", () => {
      const { container } = render(<Progress steps={10} value={100} variant="dot" />);
      expect(container.querySelectorAll(".bg-accent")).toHaveLength(10);
    });
  });

  describe("stepper", () => {
    it("marks completed steps with a check and numbers the rest", () => {
      const { container } = render(<Progress steps={4} value={50} variant="stepper" />);
      expect(container.querySelectorAll("svg")).toHaveLength(2);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("renders labels when given", () => {
      render(<Progress labels={["Cart", "Address", "Pay"]} steps={3} value={33} variant="stepper" />);
      expect(screen.getByText("Address")).toBeInTheDocument();
    });
  });

  describe("round", () => {
    it("shows the value in the centre", () => {
      render(<Progress value={75} variant="round" />);
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("offsets the stroke by the remaining fraction", () => {
      const { container } = render(<Progress size="md" value={0} variant="round" />);
      const [, indicator] = Array.from(container.querySelectorAll("circle"));
      // At 0 the dash offset equals the full circumference — nothing drawn.
      expect(indicator?.getAttribute("stroke-dashoffset")).toBe(indicator?.getAttribute("stroke-dasharray"));
    });
  });

  describe("animate", () => {
    it("drops the transition when none", () => {
      const { container } = render(<Progress animate="none" value={40} />);
      expect(container.querySelector(".bg-accent")).not.toHaveStyle({ transition: "all 400ms ease-in-out" });
    });

    it("ties opacity to the value when fade", () => {
      const { container } = render(<Progress animate="fade" value={50} />);
      expect(container.querySelector(".bg-accent")).toHaveStyle({ opacity: "0.5" });
    });

    it("adds the pulse class", () => {
      const { container } = render(<Progress animate="pulse" value={50} />);
      expect(container.querySelector(".bg-accent")).toHaveClass("animate-pulse");
    });
  });

  describe("callbacks", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it("reports before and after a change", () => {
      const beforeChange = vi.fn();
      const afterChange = vi.fn();
      const { rerender } = render(<Progress afterChange={afterChange} beforeChange={beforeChange} value={20} />);

      rerender(<Progress afterChange={afterChange} beforeChange={beforeChange} value={80} />);
      expect(beforeChange).toHaveBeenCalledWith(20, 80);

      vi.advanceTimersByTime(400);
      expect(afterChange).toHaveBeenCalledWith(80);
    });

    it("does not fire before for an unchanged value", () => {
      const beforeChange = vi.fn();
      const { rerender } = render(<Progress beforeChange={beforeChange} value={20} />);
      rerender(<Progress beforeChange={beforeChange} value={20} />);
      expect(beforeChange).not.toHaveBeenCalled();
    });
  });

  it.each(["success", "warning", "error"] as const)("paints the %s status", (status) => {
    const { container } = render(<Progress status={status} value={50} />);
    expect(container.querySelector(`.bg-${status}`)).toBeInTheDocument();
  });

  describe("as a Steps navigator", () => {
    it("stays a read-out until onStepChange is supplied", () => {
      render(<Progress steps={4} value={50} variant="stepper" />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("becomes buttons once it is navigable", () => {
      render(<Progress onStepChange={vi.fn()} steps={4} value={50} variant="stepper" />);
      expect(screen.getAllByRole("button")).toHaveLength(4);
      // A list of controls is not a progressbar — that role is for a read-out.
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("reports the clicked index", async () => {
      const onStepChange = vi.fn();
      render(<Progress labels={["One", "Two", "Three"]} onStepChange={onStepChange} steps={3} value={0} variant="stepper" />);

      await userEvent.click(screen.getByRole("button", { name: /Three/ }));
      expect(onStepChange).toHaveBeenCalledWith(2);
    });

    it("marks the active step", () => {
      render(<Progress labels={["One", "Two", "Three"]} onStepChange={vi.fn()} steps={3} value={34} variant="stepper" />);
      expect(screen.getByRole("button", { name: /Two/ })).toHaveAttribute("aria-current", "step");
    });

    it("disables the steps it is told to", async () => {
      const onStepChange = vi.fn();
      render(
        <Progress
          disabledSteps={[2]}
          labels={["One", "Two", "Three"]}
          onStepChange={onStepChange}
          steps={3}
          value={0}
          variant="stepper"
        />,
      );

      expect(screen.getByRole("button", { name: /Three/ })).toBeDisabled();
      await userEvent.click(screen.getByRole("button", { name: /Three/ }));
      expect(onStepChange).not.toHaveBeenCalled();
    });

    it("renders descriptions under the labels", () => {
      render(
        <Progress
          descriptions={["Pick items", "Enter address"]}
          labels={["Cart", "Address"]}
          steps={2}
          value={0}
          variant="stepper"
        />,
      );
      expect(screen.getByText("Pick items")).toBeInTheDocument();
    });

    it("lets an explicit status override what value implies", () => {
      const { container } = render(
        <Progress statuses={["finish", "error", "wait"]} steps={3} value={34} variant="stepper" />,
      );
      // Step 2 would be `process` from the value alone; `error` wins.
      expect(container.querySelector(".bg-error")).toBeInTheDocument();
    });
  });
});
