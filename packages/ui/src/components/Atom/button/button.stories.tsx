import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

const meta = {
  title: "Components/Atom/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

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

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading_: Story = {
  name: "Loading",
  args: {
    loading: true,
  },
};

export const LoadingTypes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} loading loadingType="spinner">
        Spinner
      </Button>
      <Button {...args} loading loadingType="dots">
        Dots
      </Button>
      <Button {...args} loading loadingType="bars">
        Bars
      </Button>
    </div>
  ),
};

export const LoadingAcrossVariants: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} loading variant="primary">
        Primary
      </Button>
      <Button {...args} loading variant="secondary">
        Secondary
      </Button>
      <Button {...args} loading variant="outline">
        Outline
      </Button>
      <Button {...args} loading variant="destructive">
        Destructive
      </Button>
    </div>
  ),
};
