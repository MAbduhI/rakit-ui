import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, type BadgeProps } from "../../Atom/badge";
import { Button } from "../../Atom/button";
import { Icon } from "../../Atom/icon";
import { Loading } from "../../Atom/loading";
import { Progress } from "../../Molecule/progress";
import { ToasterProvider } from "./toaster";
import { useToaster } from "./use-toaster";

const meta = {
  title: "Components/Organism/Toaster",
  component: ToasterProvider,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
    },
    duration: { control: { type: "range", min: 0, max: 10000, step: 500 } },
    max: { control: { type: "number", min: 1 } },
  },
} satisfies Meta<typeof ToasterProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const badgeVariants: Array<NonNullable<BadgeProps["variant"]>> = [
  "primary",
  "primary-highlight",
  "secondary",
  "outline",
  "accent",
  "accent-highlight",
  "success",
  "success-highlight",
  "warning",
  "warning-highlight",
  "error",
  "error-highlight",
];

/** Every Badge variant is a toast variant. */
function VariantGallery() {
  const { showToaster, closeAllToast } = useToaster();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {badgeVariants.map((variant) => (
          <Button
            key={variant}
            onClick={() =>
              showToaster({
                variant,
                title: variant,
                description: `A ${variant} toast, using the matching Badge variant.`,
                icon: "bell",
              })
            }
            size="sm"
            variant="outline"
          >
            {variant}
          </Button>
        ))}
      </div>
      <div>
        <Button onClick={closeAllToast} size="sm" variant="destructive">
          closeAllToast()
        </Button>
      </div>
    </div>
  );
}

export const Variants: Story = {
  args: { children: null },
  render: (args) => (
    <ToasterProvider {...args}>
      <VariantGallery />
    </ToasterProvider>
  ),
};

function ApiDemo() {
  const { showToaster, closeToast, closeAllToast, toasts } = useToaster();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => showToaster({ variant: "success", title: "Saved", description: "Invoice INV-1041 updated." })}
          size="sm"
        >
          showToaster()
        </Button>
        <Button
          onClick={() => showToaster({ variant: "warning", title: "Sticky", description: "duration: 0", duration: 0 })}
          size="sm"
          variant="outline"
        >
          sticky toast
        </Button>
        <Button
          disabled={toasts.length === 0}
          onClick={() => toasts[0] && closeToast(toasts[0].id)}
          size="sm"
          variant="outline"
        >
          closeToast(oldest)
        </Button>
        <Button disabled={toasts.length === 0} onClick={closeAllToast} size="sm" variant="destructive">
          closeAllToast()
        </Button>
      </div>
      <code className="text-secondary text-xs">
        {toasts.length} open — {toasts.map((toast) => toast.id).join(", ") || "none"}
      </code>
    </div>
  );
}

export const Api: Story = {
  args: { children: null },
  render: (args) => (
    <ToasterProvider {...args}>
      <ApiDemo />
    </ToasterProvider>
  ),
};

/*
 * `variant="custom"` hands the whole body over to `render`, which gets the id
 * and a `close` callback. Everything below is built from tokens, so it themes
 * itself like the rest of the library.
 */
function FancyDemo() {
  const { showToaster } = useToaster();

  const deployToast = () =>
    showToaster({
      variant: "custom",
      duration: 0,
      render: ({ close }) => (
        <div className="w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-accent/40 bg-surface shadow-lg">
          <div className="flex items-start gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Icon name="upload" size="md" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-primary text-sm">Deploying to production</p>
                <Badge variant="accent-highlight">v2.4.0</Badge>
              </div>
              <p className="text-secondary text-xs">Building assets — 3 of 5 steps complete.</p>
              <Progress className="mt-1" showValue={false} size="sm" value={60} />
            </div>
            <button
              aria-label="Dismiss"
              className="-mr-1 -mt-1 shrink-0 rounded p-1 text-secondary hover:bg-surface-alt hover:text-primary"
              onClick={close}
              type="button"
            >
              <Icon name="x" size="sm" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 border-border border-t bg-surface-alt px-4 py-2">
            <span className="flex items-center gap-2 text-secondary text-xs">
              <Loading size="sm" variant="dots" />
              streaming logs
            </span>
            <div className="flex gap-2">
              <Button onClick={close} size="sm" variant="ghost">
                Hide
              </Button>
              <Button onClick={close} size="sm">
                View build
              </Button>
            </div>
          </div>
        </div>
      ),
    });

  const personToast = () =>
    showToaster({
      variant: "custom",
      duration: 0,
      render: ({ close }) => (
        <div className="flex w-96 max-w-[calc(100vw-2rem)] gap-3 rounded-md border border-border bg-surface p-4 shadow-lg">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-secondary font-semibold text-accent-secondary-foreground text-sm">
            RM
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-primary text-sm">
              <span className="font-semibold">Rakit Mimpi</span> mentioned you in{" "}
              <span className="font-semibold">INV-1043</span>
            </p>
            <p className="rounded-md border-accent border-l-2 bg-surface-alt px-3 py-2 text-secondary text-xs">
              “Can you confirm the delivery window before we invoice?”
            </p>
            <div className="flex gap-2">
              <Button onClick={close} size="sm">
                Reply
              </Button>
              <Button onClick={close} size="sm" variant="ghost">
                Mark read
              </Button>
            </div>
          </div>
        </div>
      ),
    });

  const undoToast = () =>
    showToaster({
      variant: "custom",
      duration: 6000,
      render: ({ close }) => (
        <div className="flex w-80 max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-border bg-primary py-2 pr-2 pl-4 shadow-lg">
          <Icon className="shrink-0 text-bg" name="trash" size="sm" />
          <p className="flex-1 text-bg text-sm">Invoice deleted</p>
          <button
            className="shrink-0 rounded-full bg-bg px-3 py-1 font-semibold text-primary text-xs transition-opacity hover:opacity-80"
            onClick={close}
            type="button"
          >
            Undo
          </button>
        </div>
      ),
    });

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={deployToast} size="sm">
        Deploy progress
      </Button>
      <Button onClick={personToast} size="sm" variant="secondary">
        Mention
      </Button>
      <Button onClick={undoToast} size="sm" variant="outline">
        Undo pill
      </Button>
    </div>
  );
}

/** Three shapes the built-in toast cannot make, all through `render`. */
export const CustomVariant: Story = {
  args: { children: null },
  render: (args) => (
    <ToasterProvider {...args}>
      <FancyDemo />
    </ToasterProvider>
  ),
};

function PositionDemo() {
  const { showToaster } = useToaster();
  return (
    <Button onClick={() => showToaster({ variant: "primary", title: "Here", description: "Toasts stack from here." })}>
      Show toast
    </Button>
  );
}

export const Positions: Story = {
  args: { children: null, position: "top-center" },
  render: (args) => (
    <ToasterProvider {...args}>
      <PositionDemo />
    </ToasterProvider>
  ),
};
