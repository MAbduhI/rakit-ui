import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./divider";

const meta = {
  title: "Components/Atom/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  decorators: [
    (Story) => (
      <div className="flex h-16 items-center gap-4">
        <span className="text-secondary text-sm">Left</span>
        <Story />
        <span className="text-secondary text-sm">Right</span>
      </div>
    ),
  ],
};

export const Thickness: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      {(["sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Divider key={size} size={size} />
      ))}
    </div>
  ),
};
