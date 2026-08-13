import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Popover } from "./popover";

const trigger = <button type="button">Open</button>;

describe("Popover", () => {
  it("starts closed and opens on the trigger", async () => {
    render(<Popover trigger={trigger}>panel content</Popover>);
    expect(screen.queryByText("panel content")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("panel content")).toBeInTheDocument();
  });

  it("toggles shut on a second trigger click", async () => {
    render(<Popover trigger={trigger}>panel content</Popover>);
    const button = screen.getByRole("button", { name: "Open" });

    await userEvent.click(button);
    await userEvent.click(button);
    expect(screen.queryByText("panel content")).not.toBeInTheDocument();
  });

  it("honours defaultOpen", () => {
    render(
      <Popover defaultOpen trigger={trigger}>
        panel content
      </Popover>,
    );
    expect(screen.getByText("panel content")).toBeInTheDocument();
  });

  it("wires aria on the trigger", async () => {
    render(<Popover trigger={trigger}>panel content</Popover>);
    const button = screen.getByRole("button", { name: "Open" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", screen.getByRole("dialog").id);
  });

  it("keeps the trigger's own onClick", async () => {
    const onClick = vi.fn();
    render(
      <Popover
        trigger={
          <button onClick={onClick} type="button">
            Open
          </button>
        }
      >
        panel content
      </Popover>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe("dismissal", () => {
    it("closes on an outside pointerdown", async () => {
      render(
        <div>
          <Popover defaultOpen trigger={trigger}>
            panel content
          </Popover>
          <button type="button">outside</button>
        </div>,
      );

      await userEvent.click(screen.getByRole("button", { name: "outside" }));
      expect(screen.queryByText("panel content")).not.toBeInTheDocument();
    });

    it("stays open for a click inside the panel", async () => {
      render(
        <Popover defaultOpen trigger={trigger}>
          <button type="button">inside</button>
        </Popover>,
      );

      await userEvent.click(screen.getByRole("button", { name: "inside" }));
      expect(screen.getByRole("button", { name: "inside" })).toBeInTheDocument();
    });

    it("closes on Escape", async () => {
      render(
        <Popover defaultOpen trigger={trigger}>
          panel content
        </Popover>,
      );

      await userEvent.keyboard("{Escape}");
      expect(screen.queryByText("panel content")).not.toBeInTheDocument();
    });
  });

  describe("controlled", () => {
    it("reports changes without moving on its own", async () => {
      const onOpenChange = vi.fn();
      render(
        <Popover onOpenChange={onOpenChange} open={false} trigger={trigger}>
          panel content
        </Popover>,
      );

      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByText("panel content")).not.toBeInTheDocument();
    });
  });

  describe("onHover", () => {
    it("does not open on hover by default", async () => {
      render(<Popover trigger={trigger}>panel content</Popover>);
      await userEvent.hover(screen.getByRole("button", { name: "Open" }));
      expect(screen.queryByText("panel content")).not.toBeInTheDocument();
    });

    it("opens on pointer enter when set", async () => {
      render(
        <Popover onHover trigger={trigger}>
          panel content
        </Popover>,
      );
      await userEvent.hover(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("panel content")).toBeInTheDocument();
    });

    it("opens on focus too, so it is reachable without a mouse", async () => {
      render(
        <Popover onHover trigger={trigger}>
          panel content
        </Popover>,
      );
      act(() => screen.getByRole("button", { name: "Open" }).focus());
      expect(screen.getByText("panel content")).toBeInTheDocument();
    });

    it("keeps a click from slamming shut what hover just opened", async () => {
      render(
        <Popover onHover trigger={trigger}>
          panel content
        </Popover>,
      );
      await userEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getByText("panel content")).toBeInTheDocument();
    });

    it("waits out the grace period before closing on leave", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Popover hoverCloseDelay={200} onHover trigger={trigger}>
          panel content
        </Popover>,
      );

      await user.hover(screen.getByRole("button", { name: "Open" }));
      await user.unhover(screen.getByRole("button", { name: "Open" }));
      // Still open while the pointer crosses the gap to the panel.
      expect(screen.getByText("panel content")).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(200));
      expect(screen.queryByText("panel content")).not.toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  it.each([
    ["bottom-start", "top-full"],
    ["top-end", "bottom-full"],
    ["right", "left-full"],
    ["left-start", "right-full"],
  ] as const)("places %s", (placement, expected) => {
    render(
      <Popover defaultOpen placement={placement} trigger={trigger}>
        panel content
      </Popover>,
    );
    expect(screen.getByRole("dialog")).toHaveClass(expected);
  });
});
