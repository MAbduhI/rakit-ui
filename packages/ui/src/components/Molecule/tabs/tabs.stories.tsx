import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../../Atom/badge";
import { Tab, Tabs } from "./tabs";

const meta = {
  title: "Components/Molecule/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "panel"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    width: { control: "select", options: ["fit", "fill", "compact", "span"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    notePosition: { control: "inline-radio", options: ["left", "right"] },
    maxView: { control: { type: "number", min: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="w-[40rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Panel = ({ children }: { children: string }) => <p className="text-secondary text-sm">{children}</p>;

const basic = [
  <Tab key="overview" label="Overview" value="overview">
    <Panel>Totals, recent activity, and anything worth seeing first.</Panel>
  </Tab>,
  <Tab key="invoices" label="Invoices" value="invoices">
    <Panel>Every invoice, filterable by client and status.</Panel>
  </Tab>,
  <Tab key="settings" label="Settings" value="settings">
    <Panel>Workspace preferences and billing details.</Panel>
  </Tab>,
];

export const Default: Story = {
  args: { children: basic },
};

export const PanelVariant: Story = {
  args: { children: basic, variant: "panel" },
};

export const Vertical: Story = {
  args: { children: basic, orientation: "vertical" },
};

/** `icon` takes any name from the Icon registry; `note` takes any node. */
export const IconsAndNotes: Story = {
  args: {
    children: [
      <Tab key="a" icon="home" label="Overview" value="a">
        <Panel>Icon only.</Panel>
      </Tab>,
      <Tab key="b" icon="download" label="Invoices" note={<Badge variant="error">12</Badge>} value="b">
        <Panel>Icon and a Badge note, side by side.</Panel>
      </Tab>,
      <Tab key="c" label="Settings" note={<Badge variant="secondary">new</Badge>} value="c">
        <Panel>Note only.</Panel>
      </Tab>,
    ],
  },
};

export const Positions: Story = {
  args: { children: basic },
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(
        [
          ["left", "left"],
          ["right", "left"],
          ["left", "right"],
          ["right", "right"],
        ] as const
      ).map(([iconPosition, notePosition]) => (
        <div key={`${iconPosition}-${notePosition}`} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">
            icon={iconPosition} / note={notePosition}
          </code>
          <Tabs {...args} iconPosition={iconPosition} notePosition={notePosition}>
            <Tab icon="home" label="Overview" note={<Badge variant="secondary">3</Badge>} value="a">
              <Panel>Content.</Panel>
            </Tab>
            <Tab icon="download" label="Invoices" note={<Badge variant="error">12</Badge>} value="b">
              <Panel>Content.</Panel>
            </Tab>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

/** `size` scales the type, padding, gap, and icon together. */
export const Sizes: Story = {
  args: { children: basic },
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">size="{size}"</code>
          <Tabs {...args} size={size}>
            <Tab icon="home" label="Overview" value="a">
              <Panel>Panel content.</Panel>
            </Tab>
            <Tab icon="settings" label="Settings" value="b">
              <Panel>Second panel.</Panel>
            </Tab>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

export const Widths: Story = {
  args: { children: basic },
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(["fit", "fill", "compact", "span"] as const).map((width) => (
        <div key={width} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">width="{width}"</code>
          <Tabs {...args} width={width} />
        </div>
      ))}
    </div>
  ),
};

/** Past `maxView`, the rest collapse into a counted disclosure. */
export const MaxView: Story = {
  args: {
    maxView: 3,
    children: ["Overview", "Invoices", "Clients", "Reports", "Settings", "Billing"].map((label) => (
      <Tab key={label} label={label} value={label.toLowerCase()}>
        <Panel>{`The ${label} panel.`}</Panel>
      </Tab>
    )),
  },
};

export const Disabled: Story = {
  args: {
    children: [
      <Tab key="a" label="Overview" value="a">
        <Panel>Arrow keys skip the disabled tab entirely.</Panel>
      </Tab>,
      <Tab key="b" disabled label="Invoices" value="b">
        <Panel>Unreachable.</Panel>
      </Tab>,
      <Tab key="c" label="Settings" value="c">
        <Panel>Third panel.</Panel>
      </Tab>,
    ],
  },
};

/**
 * `renderTrigger` replaces the built-in trigger entirely. `state.active` is
 * what you branch on to style the active one.
 */
export const CustomTrigger: Story = {
  args: {
    children: basic,
    renderTrigger: (tab, state) => (
      <button
        className={`w-full rounded-md border px-4 py-2 text-left text-sm transition-colors ${
          state.active
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-surface text-secondary hover:bg-surface-alt"
        }`}
        onClick={state.select}
        type="button"
      >
        {tab.label}
      </button>
    ),
    width: "fill",
  },
};

/** A custom trigger keeps working vertically — it is only the trigger. */
export const CustomTriggerVertical: Story = {
  args: {
    children: basic,
    orientation: "vertical",
    renderTrigger: (tab, state) => (
      <button
        className={`flex w-40 items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          state.active ? "bg-accent-secondary text-accent-secondary-foreground" : "text-secondary hover:bg-surface-alt"
        }`}
        onClick={state.select}
        type="button"
      >
        <span className={state.active ? "size-1.5 rounded-full bg-current" : "size-1.5 rounded-full bg-border"} />
        {tab.label}
      </button>
    ),
  },
};
