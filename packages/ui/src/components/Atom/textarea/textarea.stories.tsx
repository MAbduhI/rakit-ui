import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "Components/Atom/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { placeholder: "Add a note…" },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: "Delivered to the Jakarta Pusat depot at 14:20." } };

/** Grows with the content — antd calls this `autoSize`. */
export const AutoResize: Story = {
  args: { autoResize: true, placeholder: "Type several lines and watch it grow…" },
};

export const WithCount: Story = { args: { showCount: true, maxLength: 200 } };

export const CountWithoutLimit: Story = { args: { showCount: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: "Read only" } };

export const Rows: Story = { args: { rows: 8, placeholder: "Eight rows tall" } };
