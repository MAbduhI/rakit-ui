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
