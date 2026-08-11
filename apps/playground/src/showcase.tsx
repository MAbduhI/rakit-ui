import {
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  type DividerProps,
  Input,
  Loading,
  type LoadingProps,
  Skeleton,
} from "@rakit-ui/ui";
import { Section } from "./app";

const buttonVariants: Array<NonNullable<ButtonProps["variant"]>> = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
];

const buttonSizes: Array<NonNullable<ButtonProps["size"]>> = ["sm", "md", "lg"];

const badgeVariants: Array<NonNullable<BadgeProps["variant"]>> = [
  "primary",
  "secondary",
  "outline",
  "accent",
  "success",
  "warning",
  "error",
];

const loadingVariants: Array<NonNullable<LoadingProps["variant"]>> = ["spinner", "dots", "bars"];

const loadingSizes: Array<NonNullable<LoadingProps["size"]>> = ["sm", "md", "lg"];

const dividerSizes: Array<NonNullable<DividerProps["size"]>> = ["sm", "md", "lg", "xl", "2xl"];

/** Every token, so a palette edit can be eyeballed in both themes at once. */
const swatches = [
  "bg-bg",
  "bg-surface",
  "bg-surface-alt",
  "bg-surface-hover",
  "bg-border",
  "bg-input",
  "bg-ring",
  "bg-accent",
  "bg-accent-secondary",
  "bg-primary",
  "bg-secondary",
  "bg-success",
  "bg-warning",
  "bg-error",
];

const invoices = [
  { id: "INV-1041", client: "Rakit Mimpi", total: "Rp 12.400.000", status: "success" },
  { id: "INV-1042", client: "Nusantara Logistik", total: "Rp 3.850.000", status: "warning" },
  { id: "INV-1043", client: "Teras Digital", total: "Rp 27.100.000", status: "error" },
  { id: "INV-1044", client: "Bumi Karya", total: "Rp 6.200.000", status: "success" },
] as const satisfies ReadonlyArray<{ id: string; client: string; total: string; status: BadgeProps["variant"] }>;

const statusLabels = { success: "Paid", warning: "Pending", error: "Overdue" } as const;

/**
 * Every exported component with all of its variants and states, so a token or
 * base-class change can be eyeballed everywhere at once.
 *
 * Add a row here whenever you add a component.
 */
export function Showcase() {
  return (
    <>
      <Section title="Tokens" description="Toggle the theme in the header — every swatch should move with it.">
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map((swatch) => (
            <div key={swatch} className="flex items-center gap-2">
              <span className={`inline-block size-8 shrink-0 rounded border border-border ${swatch}`} />
              <code className="text-secondary text-xs">{swatch}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button — variants">
        {buttonVariants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </Section>

      <Section title="Button — sizes">
        {buttonSizes.map((size) => (
          <Button key={size} size={size}>
            size {size}
          </Button>
        ))}
      </Section>

      <Section title="Button — disabled">
        {buttonVariants.map((variant) => (
          <Button key={variant} disabled variant={variant}>
            {variant}
          </Button>
        ))}
      </Section>

      <Section
        title="Button — loading"
        description="The indicator replaces the label and the button disables itself, so the width shifts."
      >
        {buttonVariants.map((variant) => (
          <Button key={variant} loading variant={variant}>
            {variant}
          </Button>
        ))}
      </Section>

      <Section title="Button — loadingType × size">
        {loadingVariants.map((loadingType) => (
          <div key={loadingType} className="flex items-center gap-3">
            {buttonSizes.map((size) => (
              <Button key={size} loading loadingType={loadingType} size={size}>
                {loadingType} {size}
              </Button>
            ))}
          </div>
        ))}
      </Section>

      <Section title="Badge — variants">
        {badgeVariants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </Section>

      <Section title="Input — states">
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Input placeholder="Default" />
          <Input defaultValue="With a value" />
          <Input disabled placeholder="Disabled" />
          <Input type="password" defaultValue="hunter2" />
          <Input type="number" defaultValue={42} />
        </div>
      </Section>

      <Section
        title="Table — zebra striping"
        description="No Table component ships yet; this is the token recipe — odd:bg-surface / even:bg-surface-alt."
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-border border-b text-left text-secondary">
              <th className="px-3 py-2 font-medium">Invoice</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="odd:bg-surface even:bg-surface-alt">
                <td className="px-3 py-2 font-medium">{invoice.id}</td>
                <td className="px-3 py-2">{invoice.client}</td>
                <td className="px-3 py-2 tabular-nums">{invoice.total}</td>
                <td className="px-3 py-2">
                  <Badge variant={invoice.status}>{statusLabels[invoice.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Loading — variants" description="Every variant paints from the root's text color.">
        {loadingVariants.map((variant) => (
          <div key={variant} className="flex flex-col items-center gap-2">
            <Loading variant={variant} />
            <code className="text-secondary text-xs">{variant}</code>
          </div>
        ))}
        <Loading className="text-error" variant="dots" />
        <Loading className="text-success" variant="bars" />
      </Section>

      <Section title="Loading — sizes">
        {loadingSizes.map((size) => (
          <Loading key={size} size={size} />
        ))}
      </Section>

      <Section title="Divider — horizontal thickness">
        <div className="flex w-full flex-col gap-4">
          {dividerSizes.map((size) => (
            <div key={size} className="flex items-center gap-3">
              <code className="w-10 shrink-0 text-secondary text-xs">{size}</code>
              <Divider size={size} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Divider — vertical thickness">
        <div className="flex h-16 items-center gap-4">
          {dividerSizes.map((size) => (
            <div key={size} className="flex h-full items-center gap-4">
              <code className="text-secondary text-xs">{size}</code>
              <Divider orientation="vertical" size={size} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Skeleton — shapes">
        <div className="flex w-full max-w-sm gap-3">
          <Skeleton className="w-10 shrink-0" variant="circle" />
          <div className="flex w-full flex-col gap-2">
            <Skeleton variant="text" />
            <Skeleton className="w-2/3" variant="text" />
            <Skeleton className="h-20 w-full" variant="rect" />
          </div>
        </div>
      </Section>

      <Section title="Card — full composition">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Rakit Mimpi</CardTitle>
            <CardDescription>Build your dream UI, one component at a time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-secondary text-sm">
              Card body copy. Swap tokens in <code>styles.css</code> and everything here follows.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">Save</Button>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </Section>
    </>
  );
}
