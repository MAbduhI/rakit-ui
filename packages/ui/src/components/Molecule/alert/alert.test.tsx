import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it("announces itself as an alert", () => {
    render(<Alert title="Heads up" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Heads up");
  });

  it("renders title and body together", () => {
    render(<Alert title="Payment failed">Your card was declined.</Alert>);
    expect(screen.getByText("Payment failed")).toBeInTheDocument();
    expect(screen.getByText("Your card was declined.")).toBeInTheDocument();
  });

  it.each([
    ["info", "bg-accent/10"],
    ["success", "bg-success/10"],
    ["warning", "bg-warning/10"],
    ["error", "bg-error/10"],
  ] as const)("tints the %s variant", (variant, expected) => {
    render(<Alert title="x" variant={variant} />);
    expect(screen.getByRole("alert")).toHaveClass(expected);
  });

  describe("icon", () => {
    it("picks a default per variant", () => {
      const { container } = render(<Alert title="x" variant="success" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("can be turned off", () => {
      const { container } = render(<Alert icon={false} title="x" />);
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });

    it("can be overridden", () => {
      const { container } = render(<Alert icon="bell" title="x" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("closable", () => {
    it("has no dismiss button by default", () => {
      render(<Alert title="x" />);
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    });

    it("reports the dismissal", async () => {
      const onClose = vi.fn();
      render(<Alert closable onClose={onClose} title="x" />);

      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("renders trailing actions", () => {
    render(
      <Alert action={<button type="button">Retry</button>} title="Upload failed" variant="error">
        The connection dropped.
      </Alert>,
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("goes square and bottom-ruled as a banner", () => {
    render(<Alert banner title="Scheduled maintenance" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-b");
    expect(alert).not.toHaveClass("rounded-md");
  });
});
