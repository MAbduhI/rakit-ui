import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../../Atom/icon";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Components/Molecule/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  args: {
    items: [{ label: "Home", href: "#", icon: "home" }, { label: "Invoices", href: "#" }, { label: "INV-1041" }],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutIcons: Story = {
  args: {
    items: [{ label: "Workspace", href: "#" }, { label: "Settings", href: "#" }, { label: "Billing" }],
  },
};

/** Any node works as a separator. */
export const Separators: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Breadcrumb {...args} />
      <Breadcrumb {...args} separator={<span className="text-secondary">/</span>} />
      <Breadcrumb {...args} separator={<span className="text-secondary">›</span>} />
      <Breadcrumb {...args} separator={<Icon className="text-secondary" name="chevron-right" size="sm" />} />
    </div>
  ),
};

/** Past `maxItems` the middle collapses, so the trail stops growing sideways. */
export const Collapsed: Story = {
  args: {
    maxItems: 3,
    items: [
      { label: "Home", href: "#", icon: "home" },
      { label: "Clients", href: "#" },
      { label: "Rakit Mimpi", href: "#" },
      { label: "Invoices", href: "#" },
      { label: "INV-1041" },
    ],
  },
};

/** `onClick` instead of `href`, for router-driven navigation. */
export const ButtonCrumbs: Story = {
  args: {
    items: [
      { label: "Home", onClick: () => {}, icon: "home" },
      { label: "Reports", onClick: () => {} },
      { label: "Q3" },
    ],
  },
};
