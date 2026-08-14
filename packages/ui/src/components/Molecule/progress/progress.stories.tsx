import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { Button } from "../../Atom/button";
import { Progress } from "./progress";

const meta = {
  title: "Components/Molecule/Progress",
  component: Progress,
  tags: ["autodocs"],
  args: { value: 60 },
  argTypes: {
    variant: { control: "inline-radio", options: ["percent", "dot", "stepper", "round"] },
    status: { control: "inline-radio", options: ["accent", "success", "warning", "error"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    animate: { control: "inline-radio", options: ["none", "fade", "slide", "pulse"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    steps: { control: { type: "number", min: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="w-96 max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Percent: Story = {};

export const Dot: Story = {
  args: { variant: "dot", steps: 5 },
};

export const Stepper: Story = {
  args: { variant: "stepper", steps: 4, value: 50, labels: ["Cart", "Address", "Payment", "Done"] },
};

export const Round: Story = {
  args: { variant: "round", value: 72 },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      {(["percent", "dot", "stepper", "round"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <code className="text-secondary text-xs">variant="{variant}"</code>
          <Progress {...args} variant={variant} />
        </div>
      ))}
    </div>
  ),
};

export const Statuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["accent", "success", "warning", "error"] as const).map((status) => (
        <Progress {...args} key={status} status={status} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <code className="w-8 shrink-0 text-secondary text-xs">{size}</code>
          <Progress {...args} size={size} />
        </div>
      ))}
      <div className="flex items-end gap-4">
        {(["sm", "md", "lg", "xl"] as const).map((size) => (
          <Progress {...args} key={size} size={size} variant="round" />
        ))}
      </div>
    </div>
  ),
};

/** `formatValue` replaces the reading — bytes, counts, anything. */
export const CustomReading: Story = {
  args: {
    value: 42,
    formatValue: (value) => `${Math.round((value / 100) * 60)} of 60`,
  },
};

function Animated({ animate }: { animate: "none" | "fade" | "slide" | "pulse" }) {
  const [value, setValue] = useState(20);
  useEffect(() => {
    const timer = setInterval(() => setValue((current) => (current >= 100 ? 0 : current + 20)), 1200);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col gap-2">
      <code className="text-secondary text-xs">animate="{animate}"</code>
      <Progress animate={animate} value={value} />
    </div>
  );
}

export const Animations: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(["none", "fade", "slide", "pulse"] as const).map((animate) => (
        <Animated key={animate} animate={animate} />
      ))}
    </div>
  ),
};

/** `beforeChange` fires as the value changes, `afterChange` once it settles. */
export const Callbacks: Story = {
  render: () => {
    const [value, setValue] = useState(20);
    const [log, setLog] = useState({ before: "—", after: "—" });
    return (
      <div className="flex flex-col gap-4">
        <Progress
          afterChange={(settled) => setLog((entry) => ({ ...entry, after: `${settled}%` }))}
          beforeChange={(current, next) => setLog((entry) => ({ ...entry, before: `${current}% → ${next}%` }))}
          value={value}
        />
        <div className="flex gap-2">
          <Button onClick={() => setValue((current) => Math.max(0, current - 20))} size="sm" variant="outline">
            −20
          </Button>
          <Button onClick={() => setValue((current) => Math.min(100, current + 20))} size="sm">
            +20
          </Button>
        </div>
        <div className="flex gap-6 text-secondary text-xs">
          <code>beforeChange: {log.before}</code>
          <code>afterChange: {log.after}</code>
        </div>
      </div>
    );
  },
};

/*
 * Supplying `onStepChange` turns the `stepper` variant into a navigator: the
 * markers become buttons. It reports the clicked index rather than a value,
 * because only the caller knows what a step is worth.
 */
export const Steps: Story = {
  render: () => {
    const labels = ["Cart", "Address", "Payment", "Done"];
    const [step, setStep] = useState(1);
    return (
      <div className="flex w-full flex-col gap-6">
        <Progress
          descriptions={["3 items", "Jakarta Pusat", "Card ending 4021", ""]}
          labels={labels}
          onStepChange={setStep}
          steps={labels.length}
          value={(step / labels.length) * 100}
          variant="stepper"
        />
        <div className="flex gap-2">
          <Button disabled={step === 0} onClick={() => setStep((current) => current - 1)} size="sm" variant="outline">
            Back
          </Button>
          <Button disabled={step === labels.length - 1} onClick={() => setStep((current) => current + 1)} size="sm">
            Continue
          </Button>
          <code className="self-center text-secondary text-xs">step {step}</code>
        </div>
      </div>
    );
  },
};

/** `statuses` overrides what `value` implies — here step 2 failed. */
export const StepsWithError: Story = {
  args: {
    value: 50,
    variant: "stepper",
    steps: 4,
    labels: ["Upload", "Validate", "Import", "Done"],
    descriptions: ["120 rows", "4 rows rejected", "", ""],
    statuses: ["finish", "error", "wait", "wait"],
  },
};

/** Steps can be individually locked while the rest stay navigable. */
export const StepsWithDisabled: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    return (
      <Progress
        disabledSteps={[2, 3]}
        labels={["Details", "Review", "Pay", "Receipt"]}
        onStepChange={setStep}
        steps={4}
        value={(step / 4) * 100}
        variant="stepper"
      />
    );
  },
};

/** Without `onStepChange` it stays a read-out — no buttons, still a progressbar. */
export const StepsReadOnly: Story = {
  args: {
    value: 50,
    variant: "stepper",
    steps: 4,
    labels: ["Cart", "Address", "Payment", "Done"],
  },
};
