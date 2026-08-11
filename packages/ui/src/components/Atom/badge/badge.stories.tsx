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
      options: [
        "primary",
        "primary-highlight",
        "secondary",
        "outline",
        "accent",
        "accent-highlight",
        "success",
        "success-highlight",
        "warning",
        "warning-highlight",
        "error",
        "error-highlight",
      ],
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

export const PrimaryHighlight: Story = {
  args: {
    variant: "primary-highlight",
    children: "Badge",
  },
};

export const AccentHighlight: Story = {
  args: {
    variant: "accent-highlight",
    children: "Highlighted",
  },
};

export const SuccessHighlight: Story = {
  args: {
    variant: "success-highlight",
    children: "Paid",
  },
};

export const WarningHighlight: Story = {
  args: {
    variant: "warning-highlight",
    children: "Pending",
  },
};

export const ErrorHighlight: Story = {
  args: {
    variant: "error-highlight",
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

/**
 * Filled against outlined, side by side. Flip the toolbar theme — the
 * `-highlight` row is the one to watch, it is pinned to `bg-white`.
 */
export const FilledVsHighlight: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="accent">Highlighted</Badge>
        <Badge variant="success">Paid</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="error">Overdue</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="primary-highlight">Primary</Badge>
        <Badge variant="accent-highlight">Highlighted</Badge>
        <Badge variant="success-highlight">Paid</Badge>
        <Badge variant="warning-highlight">Pending</Badge>
        <Badge variant="error-highlight">Overdue</Badge>
      </div>
    </div>
  ),
};

/** Every variant at once, for a palette change. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(
        [
          "primary",
          "primary-highlight",
          "secondary",
          "outline",
          "accent",
          "accent-highlight",
          "success",
          "success-highlight",
          "warning",
          "warning-highlight",
          "error",
          "error-highlight",
        ] as const
      ).map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};
