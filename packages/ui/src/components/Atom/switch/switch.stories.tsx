import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch";

const meta = {
  title: "Components/Atom/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = { args: { label: "Email alerts" } };

export const Checked: Story = { args: { defaultChecked: true, label: "Email alerts" } };

export const Disabled: Story = { args: { disabled: true, label: "Unavailable" } };

/** antd's `checkedChildren` / `unCheckedChildren`, renamed for clarity. */
export const TrackLabels: Story = {
  args: { offLabel: "OFF", onLabel: "ON", size: "lg" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Switch {...args} key={size} defaultChecked label={`size ${size}`} size={size} />
      ))}
    </div>
  ),
};

export const Settings: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Switch defaultChecked label="Email notifications" />
      <Switch label="SMS notifications" />
      <Switch defaultChecked label="Weekly digest" />
      <Switch disabled label="Beta features" />
    </div>
  ),
};
