import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loading } from "./loading";

const meta = {
  title: "Components/Atom/Loading",
  component: Loading,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["spinner", "dots", "bars"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Spin: Story = {};

export const Dots: Story = {
  args: { variant: "dots" },
};

export const Bars: Story = {
  args: { variant: "bars" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </div>
  ),
};

export const Recolored: Story = {
  args: { variant: "dots", className: "text-error" },
};
