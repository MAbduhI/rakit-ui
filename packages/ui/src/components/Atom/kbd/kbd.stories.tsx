import type { Meta, StoryObj } from "@storybook/react-vite";
import { Kbd } from "./kbd";

const meta = {
  title: "Components/Atom/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: { children: "K" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Kbd {...args} key={size} size={size}>
          ⌘
        </Kbd>
      ))}
    </div>
  ),
};

export const Shortcuts: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-secondary text-sm">
      <span className="flex items-center gap-1.5">
        Open palette <Kbd>⌘</Kbd> <Kbd>K</Kbd>
      </span>
      <span className="flex items-center gap-1.5">
        Save <Kbd>Ctrl</Kbd> <Kbd>S</Kbd>
      </span>
      <span className="flex items-center gap-1.5">
        Dismiss <Kbd>Esc</Kbd>
      </span>
    </div>
  ),
};
