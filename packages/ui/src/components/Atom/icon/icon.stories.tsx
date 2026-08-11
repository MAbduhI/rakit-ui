import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./icon";
import { iconNames } from "./icon-registry";

const meta = {
  title: "Components/Atom/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: {
    name: "map-pin",
  },
  argTypes: {
    name: {
      control: "select",
      options: iconNames,
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-4">
      {(["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Icon {...args} size={size} />
          <code className="text-secondary text-xs">{size}</code>
        </div>
      ))}
    </div>
  ),
};

/** Icons inherit `currentColor`, so any text token recolours them. */
export const Colors: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Icon {...args} size="2xl" />
      <Icon {...args} className="text-accent" size="2xl" />
      <Icon {...args} className="text-success" size="2xl" />
      <Icon {...args} className="text-warning" size="2xl" />
      <Icon {...args} className="text-error" size="2xl" />
      <Icon {...args} className="text-secondary" size="2xl" />
    </div>
  ),
};

/** The whole registry. Adding an icon is two lines in `icon-registry.ts`. */
export const Registry: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {iconNames.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-md border border-border p-3">
          <Icon name={name} size="xl" />
          <code className="text-center text-secondary text-xs">{name}</code>
        </div>
      ))}
    </div>
  ),
};
