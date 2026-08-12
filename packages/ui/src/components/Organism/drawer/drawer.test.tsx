import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "./drawer";

/* jsdom has no showModal/close — stubbed the same way Dialog's suite does. */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

const renderDrawer = (props: Partial<Parameters<typeof Drawer>[0]> = {}) =>
  render(
    <Drawer open {...props}>
      <DrawerContent>
        <DrawerHeader devider>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>Body content</DrawerBody>
        <DrawerFooter devider>
          <button type="button">Apply</button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>,
  );

describe("Drawer", () => {
  it("opens as a modal", () => {
    renderDrawer();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("stays closed when open is false", () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    ["right", "ml-auto"],
    ["left", "mr-auto"],
    ["top", "mb-auto"],
    ["bottom", "mt-auto"],
  ] as const)("pins itself to the %s edge", (side, expected) => {
    renderDrawer({ side });
    expect(screen.getByRole("dialog")).toHaveClass(expected);
  });

  it("sizes along the inline axis for a side drawer", () => {
    renderDrawer({ side: "right", size: "lg" });
    expect(screen.getByRole("dialog")).toHaveClass("w-[min(32rem,100vw)]");
  });

  it("sizes along the block axis for a top or bottom drawer", () => {
    renderDrawer({ side: "bottom", size: "lg" });
    expect(screen.getByRole("dialog")).toHaveClass("h-[min(28rem,100dvh)]");
  });

  it("closes from the header button", async () => {
    const onClose = vi.fn();
    renderDrawer({ onClose });
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reports onOpen as it opens", () => {
    const onOpen = vi.fn();
    const { rerender } = render(
      <Drawer onOpen={onOpen} open={false}>
        <DrawerContent>body</DrawerContent>
      </Drawer>,
    );
    rerender(
      <Drawer onOpen={onOpen} open>
        <DrawerContent>body</DrawerContent>
      </Drawer>,
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  describe("clickOutside", () => {
    it("closes on a backdrop click by default", async () => {
      const onClose = vi.fn();
      renderDrawer({ onClose });
      await userEvent.click(screen.getByRole("dialog"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignores the backdrop when off", async () => {
      const onClose = vi.fn();
      renderDrawer({ onClose, clickOutside: false });
      await userEvent.click(screen.getByRole("dialog"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it("rules the header and footer when devider is set", () => {
    renderDrawer();
    expect(screen.getByText("Filters").parentElement?.parentElement).toHaveClass("border-b");
    expect(screen.getByRole("button", { name: "Apply" }).parentElement).toHaveClass("border-t");
  });
});
