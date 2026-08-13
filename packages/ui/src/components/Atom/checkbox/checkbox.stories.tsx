import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./checkbox";

const meta = {
  title: "Components/Atom/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = { args: { id: "terms", label: "Accept the terms" } };

export const WithDescription: Story = {
  args: {
    id: "emails",
    label: "Product emails",
    description: "Occasional release notes. You can opt out at any time.",
  },
};

export const Checked: Story = { args: { defaultChecked: true, id: "on", label: "Selected" } };

export const Indeterminate: Story = { args: { indeterminate: true, id: "some", label: "Some selected" } };

export const Disabled: Story = { args: { disabled: true, id: "off", label: "Unavailable" } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Checkbox {...args} key={size} defaultChecked id={`size-${size}`} label={`size ${size}`} size={size} />
      ))}
    </div>
  ),
};

/** The parent goes indeterminate whenever the children disagree. */
export const ParentChild: Story = {
  render: () => {
    const [checked, setChecked] = useState([true, false, false]);
    const all = checked.every(Boolean);
    const some = checked.some(Boolean) && !all;

    return (
      <div className="flex flex-col gap-3">
        <Checkbox
          checked={all}
          id="all"
          indeterminate={some}
          label="Select all invoices"
          onCheckedChange={(next) => setChecked(checked.map(() => next))}
        />
        <div className="flex flex-col gap-3 pl-6">
          {checked.map((value, index) => (
            <Checkbox
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length demo list
              key={index}
              checked={value}
              id={`inv-${index}`}
              label={`INV-104${index + 1}`}
              onCheckedChange={(next) =>
                setChecked((current) => current.map((item, position) => (position === index ? next : item)))
              }
            />
          ))}
        </div>
      </div>
    );
  },
};
