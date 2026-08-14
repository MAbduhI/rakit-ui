import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Result } from "./result";

describe("Result", () => {
  it("renders a default title per status", () => {
    render(<Result status="404" />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });

  it.each([
    ["success", "Success"],
    ["error", "Something went wrong"],
    ["403", "You do not have access"],
    ["500", "Server error"],
  ] as const)("titles the %s status", (status, expected) => {
    render(<Result status={status} />);
    expect(screen.getByRole("heading", { name: expected })).toBeInTheDocument();
  });

  it("takes an explicit title and subtitle", () => {
    render(<Result status="success" subTitle="INV-1041 is now paid." title="Payment received" />);
    expect(screen.getByRole("heading", { name: "Payment received" })).toBeInTheDocument();
    expect(screen.getByText("INV-1041 is now paid.")).toBeInTheDocument();
  });

  it("draws its glyph from the Icon registry", () => {
    const { container } = render(<Result status="success" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("lets the icon be overridden", () => {
    const { container } = render(<Result icon="star" status="success" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it.each([
    ["success", "text-success"],
    ["error", "text-error"],
    ["warning", "text-warning"],
    ["403", "text-warning"],
  ] as const)("tones the %s glyph", (status, expected) => {
    const { container } = render(<Result status={status} />);
    expect(container.querySelector(`.${expected}`)).toBeInTheDocument();
  });

  it("renders actions in extra", () => {
    render(<Result extra={<button type="button">Go home</button>} status="404" />);
    expect(screen.getByRole("button", { name: "Go home" })).toBeInTheDocument();
  });

  it("renders detail content below the actions", () => {
    render(
      <Result status="500">
        <pre>stack trace</pre>
      </Result>,
    );
    expect(screen.getByText("stack trace")).toBeInTheDocument();
  });
});
