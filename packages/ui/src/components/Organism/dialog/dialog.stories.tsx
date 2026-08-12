import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../Atom/button";
import { Input } from "../../Atom/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const meta = {
  title: "Components/Organism/Dialog",
  component: Dialog,
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog onClose={() => setOpen(false)} open={open}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete invoice</DialogTitle>
              <DialogDescription>INV-1043 — Teras Digital</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p className="text-secondary text-sm">
                This removes the invoice and its payment history. It cannot be undone.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)} variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** `devider` rules the header and footer off from the body. */
export const WithDeviders: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open ruled dialog</Button>
        <Dialog onClose={() => setOpen(false)} open={open}>
          <DialogContent>
            <DialogHeader devider>
              <DialogTitle>Edit client</DialogTitle>
              <DialogDescription>Changes apply to future invoices only.</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3 py-4">
              <Input defaultValue="Rakit Mimpi" leftIcon="user" placeholder="Client name" />
              <Input defaultValue="+62 812 3456 7890" leftIcon="phone" placeholder="Phone" />
              <Input defaultValue="Jakarta Pusat" leftIcon="map-pin" placeholder="City" />
            </DialogBody>
            <DialogFooter devider>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** A destructive confirm has no ✕ — the choice should be deliberate. */
export const WithoutClose: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)} variant="destructive">
          Open confirm
        </Button>
        <Dialog onClose={() => setOpen(false)} open={open}>
          <DialogContent>
            <DialogHeader showClose={false}>
              <DialogTitle>Cancel the subscription?</DialogTitle>
              <DialogDescription>Access ends immediately and cannot be restored.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setOpen(false)} variant="outline">
                Keep it
              </Button>
              <Button onClick={() => setOpen(false)} variant="destructive">
                Cancel subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/**
 * `clickOutside={false}` makes the backdrop inert, so the dialog can only be
 * dismissed deliberately. Pair it with `showClose={false}` to force a choice.
 */
export const NoClickOutside: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open locked dialog</Button>
        <Dialog clickOutside={false} onClose={() => setOpen(false)} open={open}>
          <DialogContent>
            <DialogHeader devider showClose={false}>
              <DialogTitle>Unsaved changes</DialogTitle>
              <DialogDescription>Clicking the backdrop will not dismiss this one.</DialogDescription>
            </DialogHeader>
            <DialogBody className="py-4">
              <p className="text-secondary text-sm">
                Escape still works — that is the browser's own behaviour on a modal &lt;dialog&gt; and cannot be
                switched off without breaking the keyboard exit.
              </p>
            </DialogBody>
            <DialogFooter devider>
              <Button onClick={() => setOpen(false)} variant="outline">
                Discard
              </Button>
              <Button onClick={() => setOpen(false)}>Save and close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** Long bodies scroll inside the dialog; the header and footer stay put. */
export const Scrolling: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open long dialog</Button>
        <Dialog onClose={() => setOpen(false)} open={open}>
          <DialogContent>
            <DialogHeader devider>
              <DialogTitle>Terms of service</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3 py-4">
              {Array.from({ length: 20 }, (_, index) => `clause-${index + 1}`).map((clause, index) => (
                <p key={clause} className="text-secondary text-sm">
                  {index + 1}. Clause text that exists purely to overflow the body and prove the header and footer stay
                  pinned while this scrolls.
                </p>
              ))}
            </DialogBody>
            <DialogFooter devider>
              <Button onClick={() => setOpen(false)}>Accept</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** `onOpen` and `onClose` both fire — Escape and backdrop clicks included. */
export const Callbacks: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    const [log, setLog] = useState<Array<string>>([]);
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog
          onClose={() => {
            setOpen(false);
            setLog((entries) => [...entries, "onClose"]);
          }}
          onOpen={() => setLog((entries) => [...entries, "onOpen"])}
          open={open}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Try Escape or click the backdrop</DialogTitle>
            </DialogHeader>
            <DialogBody className="pb-4">
              <p className="text-secondary text-sm">Both routes report through onClose.</p>
            </DialogBody>
          </DialogContent>
        </Dialog>
        <code className="text-secondary text-xs">{log.join(" → ") || "no events yet"}</code>
      </div>
    );
  },
};
