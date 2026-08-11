import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("defaults to type=button", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges a custom className with the variant classes", () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class", "bg-accent");
  });

  it("uses the error token for the destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-error", "text-error-foreground");
  });

  describe("loading", () => {
    it("swaps children for the indicator and marks itself busy", () => {
      render(<Button loading>Save</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
      expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    });

    it("stays inert while loading", async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Save
        </Button>,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });

    it.each([
      ["spinner", 1],
      ["dots", 3],
      ["bars", 3],
    ] as const)("renders the %s indicator", (loadingType, shapes) => {
      render(
        <Button loading loadingType={loadingType}>
          Save
        </Button>,
      );
      expect(screen.getByRole("status").children).toHaveLength(shapes);
    });

    it("leaves children and busy state alone when not loading", () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });
      expect(button).not.toHaveAttribute("aria-busy");
      expect(button).toBeEnabled();
    });
  });
});
