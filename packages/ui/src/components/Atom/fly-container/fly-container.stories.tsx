import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlyContainer } from "./fly-container";

/*
 * `position: fixed` normally anchors to the viewport, which would float these
 * demos over the whole Storybook frame. A `transform` on an ancestor makes that
 * ancestor the containing block instead, so each story stays inside its own box.
 */
const meta = {
  title: "Components/Atom/FlyContainer",
  component: FlyContainer,
  tags: ["autodocs"],
  argTypes: {
    vertical: {
      control: "select",
      options: ["top", "mid", "bottom", 25, 50, 75],
    },
    horizontal: {
      control: "select",
      options: ["left", "center", "right", 25, 50, 75],
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-96 w-full translate-x-0 rounded-md border border-border bg-surface-alt">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FlyContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Panel = ({ label }: { label: string }) => (
  <div className="rounded-md border border-border bg-surface px-4 py-3 text-primary text-sm shadow-lg">{label}</div>
);

export const Default: Story = {
  args: {
    children: <Panel label="bottom / right" />,
  },
};

export const Corners: Story = {
  render: () => (
    <>
      <FlyContainer horizontal="left" vertical="top">
        <Panel label="top / left" />
      </FlyContainer>
      <FlyContainer horizontal="right" vertical="top">
        <Panel label="top / right" />
      </FlyContainer>
      <FlyContainer horizontal="left" vertical="bottom">
        <Panel label="bottom / left" />
      </FlyContainer>
      <FlyContainer horizontal="right" vertical="bottom">
        <Panel label="bottom / right" />
      </FlyContainer>
      <FlyContainer horizontal="center" vertical="mid">
        <Panel label="mid / center" />
      </FlyContainer>
    </>
  ),
};

/** Numbers are viewport units — `vertical={30}` sits at `30vh`. */
export const ViewportUnits: Story = {
  render: () => (
    <>
      <FlyContainer horizontal={10} vertical={10}>
        <Panel label="10vh / 10vw" />
      </FlyContainer>
      <FlyContainer horizontal={30} vertical={30}>
        <Panel label="30vh / 30vw" />
      </FlyContainer>
      <FlyContainer horizontal="center" vertical={60}>
        <Panel label="60vh / center" />
      </FlyContainer>
    </>
  ),
};

/** The point of the component — arbitrary children, e.g. a chat panel. */
export const ChatPanel: Story = {
  render: () => (
    <FlyContainer horizontal="right" vertical="bottom">
      <div className="flex w-72 flex-col gap-3 rounded-md border border-border bg-surface p-4 shadow-lg">
        <p className="font-medium text-primary text-sm">Support</p>
        <p className="text-secondary text-sm">Hi! How can we help with your order today?</p>
        <div className="flex justify-end">
          <span className="rounded-md bg-accent px-3 py-1.5 text-accent-foreground text-xs">Start chat</span>
        </div>
      </div>
    </FlyContainer>
  ),
};
