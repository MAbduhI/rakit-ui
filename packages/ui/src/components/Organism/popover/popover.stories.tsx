import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../Atom/button";
import { Input } from "../../Atom/input";
import { Popover, type PopoverPlacement } from "./popover";

const meta = {
  title: "Components/Organism/Popover",
  component: Popover,
  tags: ["autodocs"],
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-64 items-center justify-center p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Open popover</Button>,
    children: <p className="max-w-56 p-3 text-secondary text-sm">Click outside or press Escape to dismiss.</p>,
  },
};

/** All twelve placements, relative to the trigger. */
export const Placements: Story = {
  args: { trigger: <Button>x</Button>, children: null },
  render: () => (
    <div className="grid grid-cols-4 gap-8">
      {(
        [
          "top-start",
          "top",
          "top-end",
          "right-start",
          "bottom-start",
          "bottom",
          "bottom-end",
          "right",
          "left-start",
          "left",
          "left-end",
          "right-end",
        ] as Array<PopoverPlacement>
      ).map((placement) => (
        <Popover
          key={placement}
          defaultOpen
          placement={placement}
          trigger={
            <Button size="sm" variant="outline">
              {placement}
            </Button>
          }
        >
          <p className="px-3 py-2 text-xs">{placement}</p>
        </Popover>
      ))}
    </div>
  ),
};

/** Anything can live inside — a form, a preview, a mini dashboard. */
export const WithForm: Story = {
  args: {
    trigger: <Button variant="outline">Filter</Button>,
    contentClassName: "w-72 p-4",
    children: (
      <div className="flex flex-col gap-3">
        <p className="font-semibold text-sm">Filter invoices</p>
        <Input leftIcon="search" placeholder="Client name" />
        <Input placeholder="Minimum amount" type="number" />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost">
            Reset
          </Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    ),
  },
};
