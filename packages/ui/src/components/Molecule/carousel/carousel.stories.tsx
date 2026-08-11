import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Carousel } from "./carousel";

const meta = {
  title: "Components/Molecule/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  argTypes: {
    navPosition: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    chevron: {
      control: "select",
      options: [undefined, "horizontal", "vertical"],
    },
    effect: {
      control: "inline-radio",
      options: ["scroll", "fade"],
    },
    ease: {
      control: "select",
      options: ["ease-in-out", "linear", "ease-out", "cubic-bezier(0.34, 1.56, 0.64, 1)"],
    },
    speed: {
      control: { type: "range", min: 500, max: 8000, step: 500 },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[36rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const palette = ["bg-accent", "bg-accent-secondary", "bg-success", "bg-warning", "bg-error"] as const;

const Slide = ({ index, tone }: { index: number; tone: string }) => (
  <div className={`flex h-56 items-center justify-center rounded-md ${tone}`}>
    <span className="font-semibold text-2xl text-accent-foreground">Slide {index + 1}</span>
  </div>
);

const slides = palette.map((tone, index) => <Slide key={tone} index={index} tone={tone} />);

export const Default: Story = {
  args: { children: slides },
};

export const WithChevrons: Story = {
  args: { children: slides, chevron: "horizontal" },
};

/** Vertical wins over `horizontal`, and the chevrons stack to match. */
export const Vertical: Story = {
  args: { children: slides, vertical: true, chevron: "vertical", navPosition: "right" },
};

/** All four dot placements. */
export const NavPositions: Story = {
  args: { children: slides },
  render: (args) => (
    <div className="grid grid-cols-2 gap-8">
      {(["top", "bottom", "left", "right"] as const).map((navPosition) => (
        <div key={navPosition} className="flex flex-col gap-2">
          <code className="text-secondary text-xs">{navPosition}</code>
          <Carousel {...args} navPosition={navPosition} />
        </div>
      ))}
    </div>
  ),
};

/** `fade` is shorthand for `effect="fade"` — slides cross-fade in place. */
export const Fade: Story = {
  args: { children: slides, fade: true, chevron: "horizontal" },
};

/** Wraps past either end, so the chevrons never disable. */
export const Infinite: Story = {
  name: "Infinity",
  args: { children: slides, infinity: true, chevron: "horizontal" },
};

/** Advances every `speed` ms. Hover or focus to pause. */
export const AutoScroll: Story = {
  args: { children: slides, autoScroll: true, infinity: true, speed: 2000 },
};

export const AutoScrollFade: Story = {
  args: { children: slides, autoScroll: true, infinity: true, fade: true, speed: 2000, nav: false },
};

/** A springy curve — `ease` takes any CSS timing function. */
export const CustomEase: Story = {
  args: {
    children: slides,
    chevron: "horizontal",
    ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
};

export const NoNav: Story = {
  args: { children: slides, nav: false, chevron: "horizontal" },
};

/**
 * `beforeChange` fires on the way out, `afterChange` once the motion settles —
 * 400ms later, which is why the two lines below update at different moments.
 */
export const Callbacks: Story = {
  args: { children: slides },
  render: (args) => {
    const [log, setLog] = useState({ before: "—", after: "—" });
    return (
      <div className="flex flex-col gap-3">
        <Carousel
          {...args}
          afterChange={(index) => setLog((entry) => ({ ...entry, after: `settled on ${index + 1}` }))}
          beforeChange={(current, next) => setLog((entry) => ({ ...entry, before: `${current + 1} → ${next + 1}` }))}
          chevron="horizontal"
        />
        <div className="flex gap-6 text-secondary text-xs">
          <code>beforeChange: {log.before}</code>
          <code>afterChange: {log.after}</code>
        </div>
      </div>
    );
  },
};
