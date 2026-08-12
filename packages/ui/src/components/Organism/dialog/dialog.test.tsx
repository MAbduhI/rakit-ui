import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";

/*
 * jsdom ships <dialog> without showModal/close, so they are stubbed to flip
 * `open` and fire the close event the way a browser does. What is under test is
 * our wiring, not the browser's modal behaviour.
 */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

const renderDialog = (props: Partial<Parameters<typeof Dialog>[0]> = {}) =>
  render(
    <Dialog open {...props}>
      <DialogContent>
        <DialogHeader devider>
          <DialogTitle>Delete invoice</DialogTitle>
        </DialogHeader>
        <DialogBody>This cannot be undone.</DialogBody>
        <DialogFooter devider>
          <button type="button">Confirm</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );

describe("Dialog", () => {
  it("opens as a modal when open is true", () => {
    renderDialog();
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Delete invoice")).toBeInTheDocument();
  });

  it("stays closed when open is false", () => {
    renderDialog({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onOpen once as it opens", () => {
    const onOpen = vi.fn();
    const { rerender } = render(
      <Dialog onOpen={onOpen} open={false}>
        <DialogContent>body</DialogContent>
      </Dialog>,
    );
    expect(onOpen).not.toHaveBeenCalled();

    rerender(
      <Dialog onOpen={onOpen} open>
        <DialogContent>body</DialogContent>
      </Dialog>,
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("reports onClose when it closes", () => {
    const onClose = vi.fn();
    const { rerender } = renderDialog({ onClose });

    rerender(
      <Dialog onClose={onClose} open={false}>
        <DialogContent>body</DialogContent>
      </Dialog>,
    );
    expect(onClose).toHaveBeenCalled();
  });

  describe("header", () => {
    it("shows a close button by default and wires it to onClose", async () => {
      const onClose = vi.fn();
      renderDialog({ onClose });

      await userEvent.click(screen.getByRole("button", { name: "Close" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("can hide the close button", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader showClose={false}>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    });
  });

  describe("devider", () => {
    it("rules the header and footer when set", () => {
      renderDialog();
      expect(screen.getByText("Delete invoice").parentElement?.parentElement).toHaveClass("border-b");
      expect(screen.getByRole("button", { name: "Confirm" }).parentElement).toHaveClass("border-t");
    });

    it("leaves them unruled by default", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <button type="button">OK</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
      expect(screen.getByRole("button", { name: "OK" }).parentElement).not.toHaveClass("border-t");
    });
  });
});
