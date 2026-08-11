import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon, iconNames } from "../../Atom/icon";
import { RunBanner } from "./run-banner";

const meta = {
  title: "Components/Molecule/RunBanner",
  component: RunBanner,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    nav: {
      control: "select",
      options: [undefined, "left", "right", "top", "bottom"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"],
    },
    speed: {
      control: { type: "range", min: 2000, max: 40000, step: 1000 },
    },
    gap: {
      control: { type: "range", min: 0, max: 96, step: 4 },
    },
  },
} satisfies Meta<typeof RunBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Stand-ins for the logos a real banner would carry. */
const logos = iconNames.slice(0, 8).map((name) => <Icon key={name} name={name} size="2xl" />);

const words = ["Rakit Mimpi", "Nusantara Logistik", "Teras Digital", "Bumi Karya"].map((label) => (
  <span key={label} className="whitespace-nowrap font-semibold text-secondary text-sm uppercase tracking-widest">
    {label}
  </span>
));

export const Default: Story = {
  args: { children: logos },
};

export const Wordmarks: Story = {
  args: { children: words, gap: 48, speed: 25000 },
};

/** `nav` is the edge the content runs towards. */
export const Directions: Story = {
  args: { children: logos },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(["left", "right"] as const).map((nav) => (
        <div key={nav} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">nav="{nav}"</code>
          <RunBanner {...args} nav={nav} />
        </div>
      ))}
    </div>
  ),
};

/** A vertical run — `nav` implies the axis, so `orientation` is redundant here. */
export const Vertical: Story = {
  args: { children: logos },
  render: (args) => (
    <div className="flex gap-8">
      {(["top", "bottom"] as const).map((nav) => (
        <div key={nav} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">nav="{nav}"</code>
          <RunBanner {...args} className="h-72" nav={nav} size="2xl" />
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  args: { children: logos },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["sm", "lg", "2xl", "4xl", "5xl"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <code className="w-10 shrink-0 text-secondary text-xs">{size}</code>
          <RunBanner {...args} className="flex-1" size={size} />
        </div>
      ))}
    </div>
  ),
};

/**
 * `endGap={false}` runs item 1 straight after the last one; `true` keeps the
 * same spacing across the seam. Watch the moment the loop repeats.
 */
export const EndGap: Story = {
  args: { children: logos.slice(0, 3), gap: 64, speed: 6000 },
  render: (args) => (
    <div className="flex flex-col gap-4">
      {([false, true] as const).map((endGap) => (
        <div key={String(endGap)} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">endGap={String(endGap)}</code>
          <RunBanner {...args} endGap={endGap} />
        </div>
      ))}
    </div>
  ),
};

export const Fast: Story = {
  args: { children: logos, speed: 4000 },
};

/** On a filled band — the banner is transparent, so the surface is yours. */
export const OnSurface: Story = {
  args: {
    children: logos,
    className: "rounded-md border border-border bg-surface-alt px-4",
    size: "2xl",
  },
};
