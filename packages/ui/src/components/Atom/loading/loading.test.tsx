import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "./loading";

describe("Loading", () => {
  it("exposes a labelled status role", () => {
    render(<Loading />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it.each([
    ["spinner", 1],
    ["dots", 3],
    ["bars", 3],
  ] as const)("renders %s as %i shape(s)", (variant, count) => {
    render(<Loading variant={variant} />);
    expect(screen.getByRole("status").children).toHaveLength(count);
  });

  it("opts every shape out of animation under reduced motion", () => {
    render(<Loading variant="dots" />);
    for (const shape of screen.getByRole("status").children) {
      expect(shape).toHaveClass("motion-reduce:animate-none");
    }
  });

  it("merges className and lets the label be overridden", () => {
    render(<Loading aria-label="Saving" className="text-error" />);
    expect(screen.getByRole("status", { name: "Saving" })).toHaveClass("text-error");
  });
});
