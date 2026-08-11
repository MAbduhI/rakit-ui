import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech and pulses", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstElementChild;
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("animate-pulse", "motion-reduce:animate-none", "bg-surface-hover");
  });

  it.each([
    ["rect", "rounded-md"],
    ["text", "rounded"],
    ["circle", "rounded-full"],
  ] as const)("shapes the %s variant", (variant, radius) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.firstElementChild).toHaveClass(radius);
  });

  it("takes its size from className", () => {
    const { container } = render(<Skeleton className="h-32 w-48" />);
    expect(container.firstElementChild).toHaveClass("h-32", "w-48");
  });
});
