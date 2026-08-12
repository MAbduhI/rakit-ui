import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToasterProvider } from "./toaster";
import { type ToastOptions, useToaster } from "./use-toaster";

function Harness({ toast }: { toast?: ToastOptions }) {
  const { showToaster, closeAllToast, closeToast, toasts } = useToaster();
  return (
    <div>
      <button onClick={() => showToaster(toast ?? { title: "Saved" })} type="button">
        show
      </button>
      <button onClick={closeAllToast} type="button">
        close all
      </button>
      <button onClick={() => toasts[0] && closeToast(toasts[0].id)} type="button">
        close first
      </button>
      <span data-testid="count">{toasts.length}</span>
    </div>
  );
}

const renderToaster = (props: Partial<Parameters<typeof ToasterProvider>[0]> = {}, toast?: ToastOptions) =>
  render(
    <ToasterProvider {...props}>
      <Harness toast={toast} />
    </ToasterProvider>,
  );

describe("Toaster", () => {
  it("throws when the hook is used outside the provider", () => {
    // React logs the error boundary trace; the throw itself is what matters.
    expect(() => render(<Harness />)).toThrow(/useToaster must be used inside/);
  });

  it("shows a toast", async () => {
    renderToaster();
    await userEvent.click(screen.getByRole("button", { name: "show" }));
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("stacks several and closes them all", async () => {
    renderToaster();
    const show = screen.getByRole("button", { name: "show" });
    await userEvent.click(show);
    await userEvent.click(show);
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    await userEvent.click(screen.getByRole("button", { name: "close all" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("closes one by id", async () => {
    renderToaster();
    const show = screen.getByRole("button", { name: "show" });
    await userEvent.click(show);
    await userEvent.click(show);

    await userEvent.click(screen.getByRole("button", { name: "close first" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("closes from the toast's own button", async () => {
    renderToaster();
    await userEvent.click(screen.getByRole("button", { name: "show" }));
    await userEvent.click(screen.getByRole("button", { name: "Close notification" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("drops the oldest past max", async () => {
    renderToaster({ max: 2 });
    const show = screen.getByRole("button", { name: "show" });
    await userEvent.click(show);
    await userEvent.click(show);
    await userEvent.click(show);
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("renders a custom toast through the render prop", async () => {
    renderToaster({}, {
      variant: "custom",
      render: ({ close }) => (
        <button onClick={close} type="button">
          bespoke toast
        </button>
      ),
    });

    await userEvent.click(screen.getByRole("button", { name: "show" }));
    const custom = screen.getByRole("button", { name: "bespoke toast" });
    expect(custom).toBeInTheDocument();

    await userEvent.click(custom);
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  describe("variant colours", () => {
    it.each([
      ["success", "bg-success", "text-success-foreground"],
      ["error", "bg-error", "text-error-foreground"],
      ["warning", "bg-warning", "text-warning-foreground"],
    ] as const)("dresses the %s card in the Badge tone", async (variant, fill, foreground) => {
      renderToaster({}, { variant, title: variant });
      await userEvent.click(screen.getByRole("button", { name: "show" }));

      const card = screen.getByText(variant).closest("[data-toast-id]");
      expect(card).toHaveClass(fill, foreground);
    });

    it("uses the outlined tone for a highlight variant", async () => {
      renderToaster({}, { variant: "error-highlight", title: "Overdue" });
      await userEvent.click(screen.getByRole("button", { name: "show" }));

      const card = screen.getByText("Overdue").closest("[data-toast-id]");
      expect(card).toHaveClass("border-error", "text-error");
    });

    it("falls back to primary when no variant is given", async () => {
      renderToaster({}, { title: "Plain" });
      await userEvent.click(screen.getByRole("button", { name: "show" }));

      const card = screen.getByText("Plain").closest("[data-toast-id]");
      expect(card).toHaveClass("bg-accent", "text-accent-foreground");
    });
  });

  it.each(["top-left", "bottom-center", "top-right"] as const)("positions the region %s", (position) => {
    renderToaster({ position });
    expect(screen.getByRole("status")).toHaveClass("fixed");
  });

  describe("duration", () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it("dismisses itself after the duration", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderToaster({ duration: 1000 });

      await user.click(screen.getByRole("button", { name: "show" }));
      expect(screen.getByTestId("count")).toHaveTextContent("1");

      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByTestId("count")).toHaveTextContent("0");
    });

    it("stays put when duration is 0", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderToaster({}, { title: "Sticky", duration: 0 });

      await user.click(screen.getByRole("button", { name: "show" }));
      act(() => vi.advanceTimersByTime(60000));
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });
  });
});
