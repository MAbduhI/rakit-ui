import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Components/Atom/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "destructive"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};
