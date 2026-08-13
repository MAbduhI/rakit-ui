import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("associates with a control through htmlFor", async () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
      </>,
    );
    await userEvent.click(screen.getByText("Email"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("hides the required marker from assistive tech", () => {
    render(<Label required>Email</Label>);
    const marker = screen.getByText("*");
    expect(marker).toHaveAttribute("aria-hidden", "true");
    // The accessible name stays clean — no spoken "asterisk".
    expect(screen.getByText("Email").textContent).toBe("Email*");
  });

  it("omits the marker unless required", () => {
    render(<Label>Email</Label>);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("dims when disabled", () => {
    render(<Label disabled>Email</Label>);
    expect(screen.getByText("Email")).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it.each([
    ["sm", "text-xs"],
    ["md", "text-sm"],
    ["lg", "text-base"],
  ] as const)("sizes %s", (size, expected) => {
    render(<Label size={size}>Email</Label>);
    expect(screen.getByText("Email")).toHaveClass(expected);
  });
});
