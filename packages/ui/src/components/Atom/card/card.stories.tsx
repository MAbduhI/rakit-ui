import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  title: "Components/Atom/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Rakit Mimpi</CardTitle>
        <CardDescription>Build your dream UI, one component at a time.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Cards group related content and actions. Compose them from the header, content, and footer primitives.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Get started</Button>
        <Button variant="outline">Learn more</Button>
      </CardFooter>
    </Card>
  ),
};

/** `devider` rules off the header and footer from the body. */
export const WithDeviders: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader devider>
        <CardTitle>Invoice INV-1041</CardTitle>
        <CardDescription>Rakit Mimpi — due 25 Aug 2026</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm">
          A ruled header and footer suit dense, data-heavy cards where the sections need a hard boundary.
        </p>
      </CardContent>
      <CardFooter className="gap-2 pt-6" devider>
        <Button size="sm">Mark paid</Button>
        <Button size="sm" variant="outline">
          Send reminder
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** Ruled against unruled, side by side — flip the theme to compare the rules. */
export const DeviderComparison: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Card className="w-72">
        <CardHeader>
          <CardTitle>Without</CardTitle>
          <CardDescription>Spacing alone separates the sections.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-secondary text-sm">Body copy.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>

      <Card className="w-72">
        <CardHeader devider>
          <CardTitle>With</CardTitle>
          <CardDescription>A rule marks each boundary.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-secondary text-sm">Body copy.</p>
        </CardContent>
        <CardFooter className="pt-6" devider>
          <Button size="sm">Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};
