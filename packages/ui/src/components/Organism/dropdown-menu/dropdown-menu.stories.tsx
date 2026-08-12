import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../Atom/button";
import { DropdownMenu } from "./dropdown-menu";

const meta = {
  title: "Components/Organism/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="flex min-h-64 items-start justify-center p-12">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button variant="outline">Actions</Button>,
    items: [
      { label: "Edit", value: "edit", icon: "edit", hint: "⌘E" },
      { label: "Duplicate", value: "duplicate", icon: "upload" },
      { label: "Download", value: "download", icon: "download", hint: "⌘D" },
      { separator: true },
      { label: "Archive", value: "archive", icon: "trash", disabled: true },
      { label: "Delete", value: "delete", icon: "trash", destructive: true },
    ],
  },
};

/** Selection is reported, and the menu closes unless you say otherwise. */
export const Selection: Story = {
  args: { trigger: <Button>Sort</Button>, items: [] },
  render: () => {
    const [chosen, setChosen] = useState("none");
    return (
      <div className="flex flex-col items-center gap-3">
        <DropdownMenu
          items={[
            { label: "Newest first", value: "newest" },
            { label: "Oldest first", value: "oldest" },
            { label: "Amount, high to low", value: "amount-desc" },
            { label: "Amount, low to high", value: "amount-asc" },
          ]}
          onSelect={(item) => setChosen(String(item.value))}
          trigger={<Button variant="outline">Sort: {chosen}</Button>}
        />
        <code className="text-secondary text-xs">selected: {chosen}</code>
      </div>
    );
  },
};

/** `closeOnSelect={false}` suits a menu of toggles. */
export const StaysOpen: Story = {
  args: {
    trigger: <Button variant="outline">Columns</Button>,
    closeOnSelect: false,
    items: [
      { label: "Invoice", value: "invoice", icon: "check" },
      { label: "Client", value: "client", icon: "check" },
      { label: "Total", value: "total", icon: "check" },
      { label: "Status", value: "status" },
    ],
  },
};

export const Placements: Story = {
  args: { trigger: <Button>x</Button>, items: [] },
  render: () => (
    <div className="flex gap-12">
      {(["bottom-start", "bottom-end", "right-start", "top-start"] as const).map((placement) => (
        <DropdownMenu
          key={placement}
          items={[
            { label: "First", value: "1" },
            { label: "Second", value: "2" },
          ]}
          placement={placement}
          trigger={
            <Button size="sm" variant="outline">
              {placement}
            </Button>
          }
        />
      ))}
    </div>
  ),
};
