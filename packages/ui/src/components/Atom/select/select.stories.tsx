import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, type SelectOption } from "./select";

const meta = {
  title: "Components/Atom/Select",
  component: Select,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-72 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options: Array<SelectOption> = [
  { label: "Standard — 4–6 days", value: "standard" },
  { label: "Express — 2 days", value: "express" },
  { label: "Overnight", value: "overnight", disabled: true },
];

export const Default: Story = { args: { options } };

export const WithPlaceholder: Story = { args: { options, placeholder: "Choose a shipping speed" } };

export const WithIcon: Story = { args: { options, leftIcon: "truck-delivery", placeholder: "Shipping" } };

export const Disabled: Story = { args: { options, disabled: true, defaultValue: "standard" } };

/** Pass children instead of `options` when you need grouping. */
export const Grouped: Story = {
  render: () => (
    <Select placeholder="Choose a city">
      <optgroup label="Java">
        <option value="jkt">Jakarta</option>
        <option value="bdg">Bandung</option>
        <option value="sby">Surabaya</option>
      </optgroup>
      <optgroup label="Bali">
        <option value="dps">Denpasar</option>
      </optgroup>
    </Select>
  ),
};
