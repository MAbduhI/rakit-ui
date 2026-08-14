import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../Atom/button";
import { Icon } from "../../Atom/icon";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Components/Molecule/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  decorators: [
    (Story) => (
      <div className="w-lg max-w-full rounded-md border border-border border-dashed">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    title: "No invoices yet",
    description: "Invoices you create will show up here, with their status and totals.",
  },
};

export const WithActions: Story = {
  args: {
    title: "No invoices yet",
    description: "Create your first invoice to get started.",
    children: (
      <>
        <Button size="sm">New invoice</Button>
        <Button size="sm" variant="outline">
          Import CSV
        </Button>
      </>
    ),
  },
};

/** A filtered list that came back empty wants a different icon and copy. */
export const NoResults: Story = {
  args: {
    icon: "search",
    title: "No matches",
    description: "No invoices match “Nusantara”. Try a different client or clear the filters.",
    children: (
      <Button size="sm" variant="outline">
        Clear filters
      </Button>
    ),
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col divide-y divide-border">
      {(["sm", "md", "lg"] as const).map((size) => (
        <EmptyState {...args} key={size} description={`size="${size}"`} size={size} title="Nothing here" />
      ))}
    </div>
  ),
};

/** `image` replaces the icon shell entirely. */
export const CustomArt: Story = {
  args: {
    title: "Inbox zero",
    description: "You are all caught up.",
    image: (
      <span className="flex size-24 items-center justify-center rounded-full bg-success/10 text-success">
        <Icon name="circle-check" size="5xl" />
      </span>
    ),
  },
};
