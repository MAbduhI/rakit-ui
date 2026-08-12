import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../Atom/badge";
import { Button } from "../../Atom/button";
import { Icon } from "../../Atom/icon";
import { Sidebar, type SidebarItem } from "./sidebar";

const meta = {
  title: "Components/Organism/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: ["static", "sticky", "mini", "offcanvas", "floating"] },
    side: { control: "inline-radio", options: ["left", "right"] },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: Array<SidebarItem> = [
  { label: "Overview", value: "overview", icon: "home" },
  { label: "Invoices", value: "invoices", icon: "download", badge: <Badge variant="error">12</Badge> },
  { label: "Clients", value: "clients", icon: "user" },
  { label: "Reports", value: "reports", icon: "star" },
  { label: "Settings", value: "settings", icon: "settings" },
  { label: "Billing", value: "billing", icon: "clock", disabled: true },
];

const Brand = () => (
  <span className="flex items-center gap-2 font-semibold text-sm">
    <Icon className="text-accent" name="star" size="md" />
    Rakit
  </span>
);

const Content = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-64 flex-1 rounded-md border border-border border-dashed p-6">
    <p className="text-secondary text-sm">{children ?? "Main content sits beside the sidebar."}</p>
  </div>
);

/** Pinned beside the content, always visible. */
export const Static: Story = {
  args: { items },
  render: (args) => {
    const [value, setValue] = useState("overview");
    return (
      <div className="flex h-96 gap-4 overflow-hidden rounded-md border border-border">
        <Sidebar {...args} header={<Brand />} onSelect={(item) => setValue(item.value)} value={value} />
        <div className="flex-1 p-4">
          <Content>Selected: {value}</Content>
        </div>
      </div>
    );
  },
};

/** Scrolls with the page, then locks at `stickyTop`. Scroll the frame. */
export const Sticky: Story = {
  args: { items, mode: "sticky" },
  render: (args) => (
    <div className="flex h-96 gap-4 overflow-y-auto rounded-md border border-border p-4">
      <Sidebar {...args} header={<Brand />} value="overview" />
      <div className="flex flex-1 flex-col gap-4">
        {Array.from({ length: 8 }, (_, index) => `block-${index}`).map((key) => (
          <Content key={key}>Scroll — the sidebar holds once it reaches the top.</Content>
        ))}
      </div>
    </div>
  ),
};

/** Collapses to an icon rail. The chevron toggles it. */
export const Mini: Story = {
  args: { items, mode: "mini" },
  render: (args) => {
    const [value, setValue] = useState("invoices");
    return (
      <div className="flex h-96 gap-4 overflow-hidden rounded-md border border-border">
        <Sidebar {...args} header={<Brand />} onSelect={(item) => setValue(item.value)} value={value} />
        <div className="flex-1 p-4">
          <Content>Selected: {value}</Content>
        </div>
      </div>
    );
  },
};

/** Hidden until triggered, then slides over the page as a modal. */
export const OffCanvas: Story = {
  args: { items, mode: "offcanvas" },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("overview");
    return (
      <div className="flex flex-col gap-4">
        <Button onClick={() => setOpen(true)} variant="outline">
          <Icon name="menu" size="sm" />
          Menu
        </Button>
        <Content>Selected: {value}</Content>
        <Sidebar
          {...args}
          onOpenChange={setOpen}
          onSelect={(item) => {
            setValue(item.value);
            setOpen(false);
          }}
          open={open}
          value={value}
        />
      </div>
    );
  },
};

/**
 * Floats over the content on its own surface. It is `position: fixed`, so the
 * `translate-x-0` on the frame below makes that frame the containing block.
 */
export const Floating: Story = {
  args: { items, mode: "floating" },
  render: (args) => (
    <div className="relative h-96 translate-x-0 overflow-hidden rounded-md border border-border bg-surface-alt p-4">
      <Sidebar {...args} header={<Brand />} value="clients" />
      <div className="ml-72">
        <Content>The sidebar hovers above this, with its own shadow.</Content>
      </div>
    </div>
  ),
};
