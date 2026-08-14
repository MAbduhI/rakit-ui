import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../../Atom/badge";
import { Timeline, type TimelineItem } from "./timeline";

const meta = {
  title: "Components/Molecule/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["left", "right", "alternate"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[36rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: Array<TimelineItem> = [
  {
    title: "Invoice created",
    label: "09:00",
    children: "INV-1041 raised for Rakit Mimpi.",
    status: "accent",
    icon: "plus",
  },
  {
    title: "Sent to client",
    label: "09:04",
    children: "Emailed to finance@rakitmimpi.id.",
    status: "accent",
    icon: "upload",
  },
  { title: "Viewed", label: "11:32", children: "Opened from Jakarta.", status: "success", icon: "check" },
  {
    title: "Payment overdue",
    label: "17:00",
    children: "No payment received by the due date.",
    status: "error",
    icon: "alert-triangle",
  },
];

export const Default: Story = {
  args: { items },
};

/** Without labels the rail sits flush against the content. */
export const WithoutLabels: Story = {
  args: {
    items: items.map(({ label, ...rest }) => rest),
  },
};

export const Modes: Story = {
  args: { items },
  render: (args) => (
    <div className="flex flex-col gap-10">
      {(["left", "right", "alternate"] as const).map((mode) => (
        <div key={mode} className="flex flex-col gap-2">
          <code className="text-secondary text-xs">mode="{mode}"</code>
          <Timeline {...args} mode={mode} />
        </div>
      ))}
    </div>
  ),
};

/** Newest first — the data stays in chronological order. */
export const Reversed: Story = {
  args: { items, reverse: true },
};

/** `pending` appends an unfinished entry with a spinner for its dot. */
export const Pending: Story = {
  args: { items, pending: "Waiting for bank settlement…" },
};

export const RichContent: Story = {
  args: {
    items: [
      {
        title: "Order placed",
        label: "12 Aug",
        status: "success",
        icon: "check",
        children: (
          <div className="flex flex-col gap-1">
            <span>Three items, Rp 12.400.000</span>
            <Badge variant="success-highlight">Paid</Badge>
          </div>
        ),
      },
      {
        title: "Out for delivery",
        label: "14 Aug",
        status: "accent",
        icon: "truck-delivery",
        children: "Driver B 9021 TXW, ETA 14:20.",
      },
      {
        title: "Delivered",
        label: "—",
        status: "default",
        children: "Not yet.",
      },
    ],
  },
};
