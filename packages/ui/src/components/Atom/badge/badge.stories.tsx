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
      options: ["primary", "secondary", "outline", "accent", "success", "warning", "error"],
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

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Highlighted",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Paid",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "Pending",
  },
};

/** Named `ErrorStatus` rather than `Error` so it does not shadow the global. */
export const ErrorStatus: Story = {
  name: "Error",
  args: {
    variant: "error",
    children: "Overdue",
  },
};

/** The status trio as it appears in a row — check both themes with the toolbar. */
export const Statuses: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="success">Paid</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Overdue</Badge>
    </div>
  ),
};
