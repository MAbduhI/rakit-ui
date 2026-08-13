import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarGroup } from "./avatar";

const meta = {
  title: "Components/Atom/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Rakit Mimpi" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "2xl", "3xl"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    status: { control: "select", options: [undefined, "online", "offline", "busy", "away"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const WithImage: Story = {
  args: { src: "https://i.pravatar.cc/150?img=12", alt: "Rakit Mimpi", size: "xl" },
};

/** A broken URL falls through to initials, not a broken-image icon. */
export const BrokenImage: Story = {
  args: { src: "https://example.invalid/missing.png", size: "xl" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      {(["sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((size) => (
        <Avatar {...args} key={size} size={size} />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} shape="circle" size="xl" />
      <Avatar {...args} shape="square" size="xl" />
    </div>
  ),
};

export const Statuses: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {(["online", "away", "busy", "offline"] as const).map((status) => (
        <Avatar {...args} key={status} size="xl" status={status} />
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup>
        {["Ana Rai", "Budi Santo", "Citra Dewi"].map((name) => (
          <Avatar key={name} className="ring-2 ring-surface" name={name} />
        ))}
      </AvatarGroup>
      <AvatarGroup max={3}>
        {["Ana Rai", "Budi Santo", "Citra Dewi", "Dian Putra", "Eka Sari", "Fajar Nur"].map((name) => (
          <Avatar key={name} className="ring-2 ring-surface" name={name} />
        ))}
      </AvatarGroup>
    </div>
  ),
};
