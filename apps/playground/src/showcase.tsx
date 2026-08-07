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
  Input,
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

const badgeVariants: Array<NonNullable<BadgeProps["variant"]>> = ["primary", "secondary", "outline", "destructive"];

/**
 * Every exported component with all of its variants and states, so a token or
 * base-class change can be eyeballed everywhere at once.
 *
 * Add a row here whenever you add a component.
 */
export function Showcase() {
  return (
    <>
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

      <Section title="Card — full composition">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Rakit Mimpi</CardTitle>
            <CardDescription>Build your dream UI, one component at a time.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
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
