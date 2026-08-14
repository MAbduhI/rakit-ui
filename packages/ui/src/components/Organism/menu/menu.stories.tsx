import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../Atom/badge";
import { Menu, type MenuItem } from "./menu";

const meta = {
  title: "Components/Organism/Menu",
  component: Menu,
  tags: ["autodocs"],
  argTypes: {
    animateType: { control: "inline-radio", options: ["collapse", "fade", "slide", "none"] },
    mode: { control: "inline-radio", options: ["inline", "vertical"] },
    indent: { control: { type: "range", min: 0, max: 32, step: 4 } },
  },
  decorators: [
    (Story) => (
      <div className="w-64 rounded-md border border-border p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: Array<MenuItem> = [
  { key: "workspace", label: "Workspace", group: true },
  { key: "overview", label: "Overview", icon: "home" },
  { key: "clients", label: "Clients", icon: "user" },
  {
    key: "billing",
    label: "Billing",
    icon: "download",
    children: [
      { key: "invoices", label: "Invoices", extra: <Badge variant="error">12</Badge> },
      { key: "plans", label: "Plans" },
      {
        key: "history",
        label: "History",
        children: [
          { key: "2026", label: "2026" },
          { key: "2025", label: "2025" },
        ],
      },
    ],
  },
  { key: "account", label: "Account", group: true },
  { key: "settings", label: "Settings", icon: "settings" },
  { key: "archived", label: "Archived", icon: "trash", disabled: true },
];

export const Default: Story = {
  args: { items, defaultOpenKeys: ["billing"], defaultSelectedKey: "overview" },
};

/** Nesting goes as deep as the data does; each level indents by `indent`. */
export const Nested: Story = {
  args: { items, defaultOpenKeys: ["billing", "history"], defaultSelectedKey: "2026" },
};

/** `accordion` keeps one submenu open at a time. */
export const Accordion: Story = {
  args: { items, accordion: true, defaultOpenKeys: ["billing"] },
};

/**
 * `collapse` transitions the height and keeps panels mounted; the others mount
 * and unmount, so they animate in only.
 */
export const AnimateTypes: Story = {
  args: { items },
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(["collapse", "fade", "slide", "none"] as const).map((animateType) => (
        <div key={animateType} className="flex flex-col gap-1">
          <code className="text-secondary text-xs">animateType="{animateType}"</code>
          <Menu {...args} animateType={animateType} defaultOpenKeys={[]} />
        </div>
      ))}
    </div>
  ),
};

/** The icon rail. Labels survive as tooltips, so nothing becomes unreachable. */
export const Collapsed: Story = {
  args: { items, collapsed: true, defaultSelectedKey: "overview" },
  decorators: [
    (Story) => (
      <div className="w-16 rounded-md border border-border p-2">
        <Story />
      </div>
    ),
  ],
};

/** Items with `href` render as links, so middle-click and copy-link work. */
export const AsLinks: Story = {
  args: {
    defaultSelectedKey: "overview",
    items: [
      { key: "overview", label: "Overview", icon: "home", href: "#overview" },
      { key: "clients", label: "Clients", icon: "user", href: "#clients" },
      { key: "settings", label: "Settings", icon: "settings", href: "#settings" },
    ],
  },
};

/** Selection and expansion are independently controllable. */
export const Controlled: Story = {
  args: { items },
  render: (args) => {
    const [selected, setSelected] = useState("overview");
    const [open, setOpen] = useState<Array<string>>(["billing"]);
    return (
      <div className="flex flex-col gap-3">
        <Menu
          {...args}
          onOpenChange={setOpen}
          onSelect={(item) => setSelected(item.key)}
          openKeys={open}
          selectedKey={selected}
        />
        <div className="flex flex-col gap-1 text-secondary text-xs">
          <code>selected: {selected}</code>
          <code>open: {open.join(", ") || "none"}</code>
        </div>
      </div>
    );
  },
};
