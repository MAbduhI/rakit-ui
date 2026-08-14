import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ScrollArea } from "../../Atom/scroll-area";
import { ResizeContainer } from "./resize-container";

const meta = {
  title: "Components/Molecule/ResizeContainer",
  component: ResizeContainer,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    minSize: { control: { type: "range", min: 0, max: 40, step: 5 } },
  },
} satisfies Meta<typeof ResizeContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Pane = ({ label }: { label: string }) => (
  <div className="flex h-full items-center justify-center bg-surface-alt p-4 text-secondary text-sm">{label}</div>
);

export const Default: Story = {
  args: {
    className: "h-72 overflow-hidden rounded-md border border-border",
    children: [<Pane key="a" label="Panel A" />, <Pane key="b" label="Panel B" />],
  },
};

/** Drag any boundary — a move only ever trades space between two neighbours. */
export const ThreePanels: Story = {
  args: {
    className: "h-72 overflow-hidden rounded-md border border-border",
    defaultSizes: [25, 50, 25],
    children: [<Pane key="a" label="Sidebar" />, <Pane key="b" label="Editor" />, <Pane key="c" label="Inspector" />],
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    className: "h-96 overflow-hidden rounded-md border border-border",
    defaultSizes: [65, 35],
    children: [<Pane key="a" label="Preview" />, <Pane key="b" label="Console" />],
  },
};

/** `minSize` is the floor a panel can be dragged to. */
export const MinimumSize: Story = {
  args: {
    className: "h-72 overflow-hidden rounded-md border border-border",
    minSize: 30,
    children: [<Pane key="a" label="Cannot go below 30%" />, <Pane key="b" label="Nor can this" />],
  },
};

/** Focus a handle and use the arrow keys — the drag is not mouse-only. */
export const Controlled: Story = {
  args: { children: null },
  render: (args) => {
    const [sizes, setSizes] = useState([40, 60]);
    return (
      <div className="flex flex-col gap-3">
        <ResizeContainer
          {...args}
          className="h-72 overflow-hidden rounded-md border border-border"
          onChange={setSizes}
          sizes={sizes}
        >
          <Pane label={`${Math.round(sizes[0] ?? 0)}%`} />
          <Pane label={`${Math.round(sizes[1] ?? 0)}%`} />
        </ResizeContainer>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-border px-3 py-1 text-sm"
            onClick={() => setSizes([50, 50])}
            type="button"
          >
            Reset to 50/50
          </button>
          <code className="self-center text-secondary text-xs">[{sizes.map(Math.round).join(", ")}]</code>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    className: "h-72 overflow-hidden rounded-md border border-border",
    children: [<Pane key="a" label="Fixed" />, <Pane key="b" label="Fixed" />],
  },
};

/** Panels compose — each one can hold its own ScrollArea. */
export const WithScrollAreas: Story = {
  args: { children: null },
  render: (args) => (
    <ResizeContainer {...args} className="h-80 overflow-hidden rounded-md border border-border" defaultSizes={[35, 65]}>
      <ScrollArea className="h-full">
        <ul className="flex flex-col gap-1 p-3">
          {Array.from({ length: 30 }, (_, index) => `row-${index}`).map((key, index) => (
            <li key={key} className="rounded px-2 py-1 text-secondary text-sm hover:bg-surface-alt">
              Item {index + 1}
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 12 }, (_, index) => `line-${index}`).map((key, index) => (
            <p key={key} className="text-secondary text-sm">
              Detail paragraph {index + 1}.
            </p>
          ))}
        </div>
      </ScrollArea>
    </ResizeContainer>
  ),
};
