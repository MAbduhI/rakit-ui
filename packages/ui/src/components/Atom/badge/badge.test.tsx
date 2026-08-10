import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the secondary variant classes", () => {
    render(<Badge variant="secondary">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("bg-surface-alt");
  });

  it.each([
    ["success", "bg-success", "text-success-foreground"],
    ["warning", "bg-warning", "text-warning-foreground"],
    ["error", "bg-error", "text-error-foreground"],
  ] as const)("renders the %s status with its own token pair", (variant, fill, foreground) => {
    render(<Badge variant={variant}>Status</Badge>);
    expect(screen.getByText("Status")).toHaveClass(fill, foreground);
  });
});
