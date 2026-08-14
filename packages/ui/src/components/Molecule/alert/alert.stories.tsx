import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "../../Atom/button";
import { Alert } from "./alert";

const meta = {
  title: "Components/Molecule/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: { title: "Heads up", children: "Something worth reading, but not worth blocking on." },
  argTypes: {
    variant: { control: "inline-radio", options: ["info", "success", "warning", "error"] },
  },
  decorators: [
    (Story) => (
      <div className="w-[32rem] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Alert {...args} title="Scheduled maintenance" variant="info">
        The API will be read-only on Sunday from 02:00 to 04:00 WIB.
      </Alert>
      <Alert {...args} title="Payment received" variant="success">
        INV-1041 has been settled in full.
      </Alert>
      <Alert {...args} title="Invoice due soon" variant="warning">
        INV-1042 is due in three days.
      </Alert>
      <Alert {...args} title="Card declined" variant="error">
        We could not charge the card on file.
      </Alert>
    </div>
  ),
};

/** Title only — a one-liner does not need a body. */
export const TitleOnly: Story = {
  args: { children: undefined, title: "Draft saved automatically." },
};

export const WithoutIcon: Story = {
  args: { icon: false },
};

/** Dismissing is the consumer's job — Alert only reports it. */
export const Closable: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return open ? (
      <Alert {...args} closable onClose={() => setOpen(false)} />
    ) : (
      <Button onClick={() => setOpen(true)} size="sm" variant="outline">
        Bring it back
      </Button>
    );
  },
};

export const WithAction: Story = {
  args: {
    variant: "error",
    title: "Upload failed",
    children: "The connection dropped after 4 of 12 files.",
    action: (
      <>
        <Button size="sm" variant="outline">
          Retry
        </Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </>
    ),
  },
};

/** Full-bleed page strip: square corners, ruled only along the bottom. */
export const Banner: Story = {
  args: { banner: true, variant: "warning", title: "You are viewing a read-only replica.", children: undefined },
  decorators: [
    (Story) => (
      <div className="-mx-4 w-[calc(100%+2rem)]">
        <Story />
      </div>
    ),
  ],
};
