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

  describe("animation", () => {
    it("slides in from the pinned edge by default", () => {
      renderDrawer({ side: "right" });
      const drawer = screen.getByRole("dialog");
      expect(drawer).toHaveClass("rakit-anim");
      expect(drawer.style.getPropertyValue("--rakit-anim-translate")).toBe("100% 0");
    });

    it.each([
      ["left", "-100% 0"],
      ["right", "100% 0"],
      ["top", "0 -100%"],
      ["bottom", "0 100%"],
    ] as const)("slides from %s", (side, expected) => {
      renderDrawer({ side });
      expect(screen.getByRole("dialog").style.getPropertyValue("--rakit-anim-translate")).toBe(expected);
    });

    it("fades without translating", () => {
      renderDrawer({ animation: "fade" });
      const drawer = screen.getByRole("dialog");
      expect(drawer.style.getPropertyValue("--rakit-anim-opacity")).toBe("0");
      expect(drawer.style.getPropertyValue("--rakit-anim-translate")).toBe("");
    });

    it("scales and fades together", () => {
      renderDrawer({ animation: "scale" });
      const drawer = screen.getByRole("dialog");
      expect(drawer.style.getPropertyValue("--rakit-anim-scale")).toBe("0.96");
      expect(drawer.style.getPropertyValue("--rakit-anim-opacity")).toBe("0");
    });

    it("combines slide and fade", () => {
      renderDrawer({ animation: "slide-fade", side: "bottom" });
      const drawer = screen.getByRole("dialog");
      expect(drawer.style.getPropertyValue("--rakit-anim-translate")).toBe("0 100%");
      expect(drawer.style.getPropertyValue("--rakit-anim-opacity")).toBe("0");
    });

    it("drops the animation class entirely when none", () => {
      renderDrawer({ animation: "none" });
      expect(screen.getByRole("dialog")).not.toHaveClass("rakit-anim");
    });

    it("applies duration and ease", () => {
      renderDrawer({ duration: 500, ease: "cubic-bezier(0.4, 0, 0.2, 1)" });
      const drawer = screen.getByRole("dialog");
      expect(drawer.style.getPropertyValue("--rakit-anim-duration")).toBe("500ms");
      expect(drawer.style.getPropertyValue("--rakit-anim-ease")).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    });
  });

  it("rules the header and footer when devider is set", () => {
    renderDrawer();
    expect(screen.getByText("Filters").parentElement?.parentElement).toHaveClass("border-b");
    expect(screen.getByRole("button", { name: "Apply" }).parentElement).toHaveClass("border-t");
  });
});
