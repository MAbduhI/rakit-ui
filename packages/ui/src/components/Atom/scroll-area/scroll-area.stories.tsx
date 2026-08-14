import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../badge";
import { ScrollArea } from "./scroll-area";

const meta = {
  title: "Components/Atom/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal", "both"] },
    scrollbar: { control: "inline-radio", options: ["thin", "auto", "hover", "hidden"] },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const paragraphs = Array.from({ length: 12 }, (_, index) => `para-${index + 1}`);

const Prose = () => (
  <div className="flex flex-col gap-3 p-4">
    {paragraphs.map((key, index) => (
      <p key={key} className="text-secondary text-sm">
        {index + 1}. The scrollbar here is the browser's own, restyled — momentum, wheel acceleration, keyboard paging
        and touch all still come from the platform rather than being reimplemented.
      </p>
    ))}
  </div>
);

export const Default: Story = {
  args: { className: "h-64 w-96 rounded-md border border-border", children: <Prose /> },
};

/** All four rails, side by side. Hover the third to see it appear. */
export const Scrollbars: Story = {
  args: { children: null },
  render: () => (
    <div className="flex gap-4">
      {(["thin", "auto", "hover", "hidden"] as const).map((scrollbar) => (
        <div key={scrollbar} className="flex flex-col gap-2">
          <code className="text-secondary text-xs">{scrollbar}</code>
          <ScrollArea className="h-64 w-56 rounded-md border border-border" scrollbar={scrollbar}>
            <Prose />
          </ScrollArea>
        </div>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    className: "w-96 rounded-md border border-border",
    children: (
      <div className="flex w-max gap-3 p-4">
        {Array.from({ length: 16 }, (_, index) => `tag-${index}`).map((key, index) => (
          <Badge key={key} variant={index % 2 === 0 ? "secondary" : "outline"}>
            Column {index + 1}
          </Badge>
        ))}
      </div>
    ),
  },
};

/** `fade` masks the scrollable edges. It never intercepts pointer events. */
export const Faded: Story = {
  args: { fade: true, className: "h-64 w-96 rounded-md border border-border", children: <Prose /> },
};

/** `hidden` removes the rail but not the scrolling — wheel and keys still work. */
export const HiddenRail: Story = {
  args: { scrollbar: "hidden", className: "h-64 w-96 rounded-md border border-border", children: <Prose /> },
};
