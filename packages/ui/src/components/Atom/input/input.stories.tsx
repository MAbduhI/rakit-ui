import type { Meta, StoryObj } from "@storybook/react-vite";
import { iconNames } from "../icon";
import { Input } from "./input";

const meta = {
  title: "Components/Atom/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Type something…",
  },
  argTypes: {
    leftIcon: {
      control: "select",
      options: [undefined, ...iconNames],
    },
    rightIcon: {
      control: "select",
      options: [undefined, ...iconNames],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "hello@rakit-ui.dev",
    type: "email",
  },
};

export const LeftIcon: Story = {
  args: {
    leftIcon: "search",
    placeholder: "Search orders",
    type: "search",
  },
};

export const RightIcon: Story = {
  args: {
    rightIcon: "calendar",
    placeholder: "Pick a date",
  },
};

export const BothIcons: Story = {
  args: {
    leftIcon: "search",
    rightIcon: "x",
    defaultValue: "INV-1041",
  },
};

/** Icons dim with the field, and clicks on them still focus the input. */
export const DisabledWithIcon: Story = {
  args: {
    disabled: true,
    leftIcon: "user",
    placeholder: "Disabled",
  },
};

export const Fields: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Input {...args} leftIcon="user" placeholder="Full name" />
      <Input {...args} leftIcon="search" placeholder="Search" type="search" />
      <Input {...args} leftIcon="phone" placeholder="Phone number" type="tel" />
      <Input {...args} placeholder="Amount" rightIcon="check" type="number" />
      <Input {...args} leftIcon="filter" placeholder="Filter results" rightIcon="chevron-down" />
    </div>
  ),
};
