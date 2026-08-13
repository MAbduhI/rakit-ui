import type { Meta, StoryObj } from "@storybook/react-vite";
import { Radio, RadioGroup } from "./radio";

const meta = {
  title: "Components/Atom/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const shipping = [
  <Radio key="standard" label="Standard" value="standard" />,
  <Radio key="express" label="Express" value="express" />,
  <Radio key="overnight" label="Overnight" value="overnight" />,
];

export const Default: Story = { args: { defaultValue: "standard", children: shipping } };

export const Horizontal: Story = {
  args: { defaultValue: "standard", orientation: "horizontal", children: shipping },
};

export const WithDescriptions: Story = {
  args: {
    defaultValue: "express",
    children: [
      <Radio key="a" description="4–6 business days, free" label="Standard" value="standard" />,
      <Radio key="b" description="2 business days, Rp 25.000" label="Express" value="express" />,
      <Radio key="c" description="Next morning, Rp 90.000" label="Overnight" value="overnight" />,
    ],
  },
};

export const DisabledOption: Story = {
  args: {
    defaultValue: "standard",
    children: [
      <Radio key="a" label="Standard" value="standard" />,
      <Radio key="b" label="Express" value="express" />,
      <Radio key="c" disabled label="Overnight (unavailable)" value="overnight" />,
    ],
  },
};

export const WholeGroupDisabled: Story = {
  args: { defaultValue: "standard", disabled: true, children: shipping },
};

export const Sizes: Story = {
  // `children` is required on RadioGroup; this story builds its own below.
  args: { children: shipping },
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <RadioGroup key={size} defaultValue="a" orientation="horizontal" size={size}>
          <Radio label={`size ${size}`} value="a" />
          <Radio label="Second" value="b" />
        </RadioGroup>
      ))}
    </div>
  ),
};
