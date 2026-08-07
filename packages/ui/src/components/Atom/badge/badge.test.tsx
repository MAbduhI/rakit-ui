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
    expect(screen.getByText("New")).toHaveClass("bg-secondary");
  });
});
