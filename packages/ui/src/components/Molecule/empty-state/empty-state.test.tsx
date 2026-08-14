import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("falls back to a default title and icon", () => {
    const { container } = render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders title and description", () => {
    render(<EmptyState description="Create one to get started." title="No invoices" />);
    expect(screen.getByText("No invoices")).toBeInTheDocument();
    expect(screen.getByText("Create one to get started.")).toBeInTheDocument();
  });

  it("renders actions as children", () => {
    render(
      <EmptyState title="No invoices">
        <button type="button">New invoice</button>
      </EmptyState>,
    );
    expect(screen.getByRole("button", { name: "New invoice" })).toBeInTheDocument();
  });

  it("swaps the icon when asked", () => {
    const { container } = render(<EmptyState icon="search" title="No results" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("replaces the icon entirely with an image", () => {
    const { container } = render(<EmptyState image={<div data-testid="art" />} title="x" />);
    expect(screen.getByTestId("art")).toBeInTheDocument();
    // The default icon shell is gone, not merely hidden.
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it.each([
    ["sm", "py-6"],
    ["md", "py-10"],
    ["lg", "py-16"],
  ] as const)("scales at %s", (size, expected) => {
    const { container } = render(<EmptyState size={size} title="x" />);
    expect(container.firstElementChild).toHaveClass(expected);
  });
});
