import type { Meta, StoryObj } from "@storybook/react-vite";
import { iconNames } from "../icon";
import { FlyButton } from "./fly-button";

/* Same containing-block trick as FlyContainer — see that story for why. */
const meta = {
  title: "Components/Atom/FlyButton",
  component: FlyButton,
  tags: ["autodocs"],
  args: {
    icon: "message-circle",
  },
  argTypes: {
    icon: {
      control: "select",
      options: iconNames,
    },
    vertical: {
      control: "select",
      options: ["top", "mid", "bottom", 25, 50, 75],
    },
    horizontal: {
      control: "select",
      options: ["left", "center", "right", 25, 50, 75],
    },
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-96 w-full translate-x-0 rounded-md border border-border bg-surface-alt">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FlyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    icon: "plus",
    children: "New order",
  },
};

export const Positions: Story = {
  render: () => (
    <>
      <FlyButton horizontal="left" icon="menu" vertical="top" />
      <FlyButton horizontal="right" icon="search" vertical="top" />
      <FlyButton horizontal="left" icon="phone" variant="secondary" vertical="bottom" />
      <FlyButton horizontal="right" icon="message-circle" vertical="bottom" />
      <FlyButton horizontal="center" icon="arrow-up" variant="outline" vertical="mid" />
    </>
  ),
};

/** `vertical={40}` puts it at `40vh`, `horizontal={15}` at `15vw`. */
export const ViewportUnits: Story = {
  args: {
    icon: "brand-whatsapp",
    vertical: 40,
    horizontal: 15,
  },
};

export const Variants: Story = {
  render: () => (
    <>
      <FlyButton horizontal="left" icon="check" vertical={20} />
      <FlyButton horizontal="left" icon="edit" variant="secondary" vertical={40} />
      <FlyButton horizontal="left" icon="filter" variant="outline" vertical={60} />
      <FlyButton horizontal="left" icon="trash" variant="destructive" vertical={80} />
    </>
  ),
};

/** Loading works because FlyButton forwards every Button prop. */
export const Loading: Story = {
  args: {
    icon: "refresh",
    loading: true,
  },
};
