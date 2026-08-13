import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "../input";
import { Label } from "./label";

const meta = {
  title: "Components/Atom/Label",
  component: Label,
  tags: ["autodocs"],
  args: { children: "Email address" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Label {...args} key={size} size={size}>
          Label {size}
        </Label>
      ))}
    </div>
  ),
};

/** Clicking the label focuses the field it names. */
export const WithField: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <Label htmlFor="email" required>
        Email address
      </Label>
      <Input id="email" leftIcon="user" placeholder="you@example.com" required type="email" />
    </div>
  ),
};
