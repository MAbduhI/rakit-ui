import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../Atom/badge";
import { Collapse, type CollapseItem } from "./collapse";

const meta = {
  title: "Components/Molecule/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  argTypes: {
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: Array<CollapseItem> = [
  {
    key: "billing",
    label: "How is billing calculated?",
    children: "Per seat, per month, prorated to the day when you add or remove someone mid-cycle.",
  },
  {
    key: "invoices",
    label: "Can I export invoices?",
    children: "Yes — CSV and PDF, individually or in bulk from the Invoices screen.",
  },
  {
    key: "cancel",
    label: "What happens if I cancel?",
    children: "Access continues to the end of the paid period, then the workspace becomes read-only.",
  },
];

export const Default: Story = {
  args: { items },
};

export const OpenByDefault: Story = {
  args: { items, defaultActiveKeys: ["billing"] },
};

/** `accordion` closes whatever else is open — one panel at a time. */
export const Accordion: Story = {
  args: { items, accordion: true, defaultActiveKeys: ["billing"] },
};

export const IconOnTheRight: Story = {
  args: { items, iconPosition: "right" },
};

export const Borderless: Story = {
  args: { items, bordered: false },
};

export const WithIconsAndExtra: Story = {
  args: {
    items: [
      {
        key: "a",
        label: "Delivery",
        icon: "truck-delivery",
        extra: <Badge variant="success">On time</Badge>,
        children: "Picked up 09:14, out for delivery 11:02.",
      },
      {
        key: "b",
        label: "Payment",
        icon: "download",
        extra: <Badge variant="warning">Pending</Badge>,
        children: "Awaiting bank confirmation.",
      },
      {
        key: "c",
        label: "Archived",
        icon: "trash",
        disabled: true,
        children: "Unreachable while disabled.",
      },
    ],
  },
};

/** Controlled — the parent owns which panels are open. */
export const Controlled: Story = {
  args: { items },
  render: (args) => {
    const [keys, setKeys] = useState<Array<string>>(["invoices"]);
    return (
      <div className="flex flex-col gap-3">
        <Collapse {...args} activeKeys={keys} onChange={setKeys} />
        <code className="text-secondary text-xs">open: {keys.join(", ") || "none"}</code>
      </div>
    );
  },
};
