import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../../Atom/button";
import { Result } from "./result";

const meta = {
  title: "Components/Molecule/Result",
  component: Result,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "select", options: ["success", "error", "info", "warning", "404", "403", "500"] },
  },
} satisfies Meta<typeof Result>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    status: "success",
    title: "Payment received",
    subTitle: "INV-1041 has been settled in full. A receipt is on its way.",
    extra: (
      <>
        <Button>View invoice</Button>
        <Button variant="outline">Back to list</Button>
      </>
    ),
  },
};

export const NotFound: Story = {
  args: {
    status: "404",
    subTitle: "The page you were looking for has moved or never existed.",
    extra: <Button>Go home</Button>,
  },
};

export const Forbidden: Story = {
  args: {
    status: "403",
    subTitle: "Ask a workspace owner to grant you access to Billing.",
    extra: <Button variant="outline">Request access</Button>,
  },
};

export const ServerError: Story = {
  args: {
    status: "500",
    subTitle: "Something broke on our side. The team has been notified.",
    extra: <Button>Try again</Button>,
    children: (
      <pre className="overflow-x-auto rounded-md border border-border bg-surface-alt p-3 text-secondary text-xs">
        ref: 7f3c9a1e — 2026-08-14T09:12:04Z
      </pre>
    ),
  },
};

/** Every status, all drawing from the Icon registry. */
export const Statuses: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["success", "error", "info", "warning", "404", "403", "500"] as const).map((status) => (
        <div key={status} className="rounded-md border border-border">
          <Result status={status} subTitle={`status="${status}"`} />
        </div>
      ))}
    </div>
  ),
};

/** The glyph can be swapped without leaving the registry. */
export const CustomIcon: Story = {
  args: {
    status: "success",
    icon: "star",
    title: "You are all caught up",
    subTitle: "No invoices need your attention today.",
  },
};
