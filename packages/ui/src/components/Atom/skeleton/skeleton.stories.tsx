import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Atom/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["rect", "text", "circle"],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rect: Story = {
  args: { className: "h-24 w-64" },
};

export const Text: Story = {
  args: { variant: "text", className: "w-64" },
};

export const Circle: Story = {
  args: { variant: "circle", className: "w-12" },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex w-72 gap-3 rounded-md border border-border p-4">
      <Skeleton className="w-10 shrink-0" variant="circle" />
      <div className="flex w-full flex-col gap-2">
        <Skeleton variant="text" />
        <Skeleton className="w-2/3" variant="text" />
      </div>
    </div>
  ),
};
