import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../Atom/button";
import { Input } from "../../Atom/input";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

const meta = {
  title: "Components/Organism/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    animation: { control: "select", options: ["none", "slide", "fade", "scale", "slide-fade"] },
    duration: { control: { type: "range", min: 0, max: 1500, step: 50 } },
    ease: {
      control: "select",
      options: ["ease", "linear", "ease-out", "cubic-bezier(0.34, 1.56, 0.64, 1)"],
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: false, children: null },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer {...args} onClose={() => setOpen(false)} open={open}>
          <DrawerContent>
            <DrawerHeader devider>
              <DrawerTitle>Filter invoices</DrawerTitle>
              <DrawerDescription>Narrow the list without leaving the page.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-3 py-4">
              <Input leftIcon="search" placeholder="Client name" />
              <Input placeholder="Minimum amount" type="number" />
              <Input placeholder="Issued after" type="date" />
            </DrawerBody>
            <DrawerFooter devider>
              <Button onClick={() => setOpen(false)} variant="outline">
                Reset
              </Button>
              <Button onClick={() => setOpen(false)}>Apply</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};

/** All four edges. Left/right size on width, top/bottom on height. */
export const Sides: Story = {
  args: { open: false, children: null },
  render: () => {
    const [side, setSide] = useState<"left" | "right" | "top" | "bottom" | null>(null);
    return (
      <div className="flex flex-wrap gap-2">
        {(["left", "right", "top", "bottom"] as const).map((edge) => (
          <Button key={edge} onClick={() => setSide(edge)} variant="outline">
            {edge}
          </Button>
        ))}
        <Drawer onClose={() => setSide(null)} open={side !== null} side={side ?? "right"}>
          <DrawerContent>
            <DrawerHeader devider>
              <DrawerTitle>side="{side}"</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="py-4">
              <p className="text-secondary text-sm">Escape and the backdrop both close it.</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

export const Sizes: Story = {
  args: { open: false, children: null },
  render: () => {
    const [size, setSize] = useState<"sm" | "md" | "lg" | "xl" | "full" | null>(null);
    return (
      <div className="flex flex-wrap gap-2">
        {(["sm", "md", "lg", "xl", "full"] as const).map((value) => (
          <Button key={value} onClick={() => setSize(value)} variant="outline">
            {value}
          </Button>
        ))}
        <Drawer onClose={() => setSize(null)} open={size !== null} size={size ?? "md"}>
          <DrawerContent>
            <DrawerHeader devider>
              <DrawerTitle>size="{size}"</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="py-4">
              <p className="text-secondary text-sm">Sized along the inline axis for a side drawer.</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

/** Backdrop clicks do nothing; Escape still works, as it must. */
export const NoClickOutside: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open locked drawer</Button>
        <Drawer clickOutside={false} onClose={() => setOpen(false)} open={open}>
          <DrawerContent>
            <DrawerHeader devider showClose={false}>
              <DrawerTitle>Unsaved edits</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="py-4">
              <p className="text-secondary text-sm">Choose an action below.</p>
            </DrawerBody>
            <DrawerFooter devider>
              <Button onClick={() => setOpen(false)} variant="outline">
                Discard
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};

/**
 * Both directions animate, including the exit — that needs
 * `transition-behavior: allow-discrete` and `@starting-style`, which live in
 * `styles.css`. Watch the close, not just the open.
 */
export const Animations: Story = {
  args: { open: false, children: null },
  render: () => {
    const [animation, setAnimation] = useState<"none" | "slide" | "fade" | "scale" | "slide-fade" | null>(null);
    return (
      <div className="flex flex-wrap gap-2">
        {(["slide", "fade", "scale", "slide-fade", "none"] as const).map((value) => (
          <Button key={value} onClick={() => setAnimation(value)} variant="outline">
            {value}
          </Button>
        ))}
        <Drawer animation={animation ?? "slide"} onClose={() => setAnimation(null)} open={animation !== null}>
          <DrawerContent>
            <DrawerHeader devider>
              <DrawerTitle>animation="{animation}"</DrawerTitle>
              <DrawerDescription>Close it and watch the exit.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody className="py-4">
              <p className="text-secondary text-sm">The backdrop fades with the panel.</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};

/** A slow, springy curve, to make the easing obvious. */
export const SlowAndSpringy: Story = {
  args: { open: false, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open slowly</Button>
        <Drawer duration={900} ease="cubic-bezier(0.34, 1.56, 0.64, 1)" onClose={() => setOpen(false)} open={open}>
          <DrawerContent>
            <DrawerHeader devider>
              <DrawerTitle>900ms, springy</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="py-4">
              <p className="text-secondary text-sm">duration and ease are both props.</p>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    );
  },
};
