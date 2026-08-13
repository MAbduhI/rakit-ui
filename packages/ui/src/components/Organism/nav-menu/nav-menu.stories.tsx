import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Badge } from "../../Atom/badge";
import { Button } from "../../Atom/button";
import { Icon } from "../../Atom/icon";
import { NavMenu, NavMenuContainer, type NavMenuHoverAnimation } from "./nav-menu";

const meta = {
  title: "Components/Organism/NavMenu",
  component: NavMenuContainer,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    type: { control: "inline-radio", options: ["expand", "minimize"] },
    animateOnChange: { control: "boolean" },
    hideOnScroll: { control: "boolean" },
  },
} satisfies Meta<typeof NavMenuContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Logo = () => (
  <span className="flex items-center gap-2 font-bold text-sm tracking-tight">
    <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
      <Icon name="star" size="sm" />
    </span>
    RAKIT
  </span>
);

const Actions = () => (
  <>
    <Button className="rounded-full" size="sm" variant="ghost">
      Login
    </Button>
    <Button className="rounded-full" size="sm">
      Download
    </Button>
  </>
);

const languages = [
  { label: "Intl — English", value: "en" },
  { label: "Bahasa Indonesia", value: "id" },
  { label: "日本語", value: "ja" },
];

/** The shape the reference navigation uses: brand, centred items, actions. */
export const Default: Story = {
  args: { children: null },
  render: (args) => {
    const [lang, setLang] = useState("Intl — English");
    return (
      <NavMenuContainer {...args} actions={<Actions />} icon={<Logo />} innerClassName="max-w-6xl">
        <NavMenu href="#" label="IDE" />
        <NavMenu badge={<Badge variant="success">Beta</Badge>} href="#" label="Agents" />
        <NavMenu href="#" label="CLI" />
        <NavMenu active href="#" label="Pricing" />
        <NavMenu href="#" label="Document" />
        <NavMenu href="#" label="Blog" />
        <NavMenu dropdown={languages} label={lang} onSelect={(item) => setLang(String(item.label))} />
      </NavMenuContainer>
    );
  },
};

/** Scroll the frame: the bar leaves on the way down and returns on the way up. */
export const HideOnScroll: Story = {
  args: { children: null },
  render: (args) => (
    <div className="h-96 overflow-y-auto rounded-md border border-border">
      <NavMenuContainer {...args} actions={<Actions />} icon={<Logo />}>
        <NavMenu href="#" label="IDE" />
        <NavMenu href="#" label="Agents" />
        <NavMenu href="#" label="Pricing" />
      </NavMenuContainer>
      <div className="flex flex-col gap-4 p-6">
        {Array.from({ length: 20 }, (_, index) => `row-${index}`).map((key) => (
          <p key={key} className="text-secondary text-sm">
            Scroll down — the bar slides away. Scroll back up and it returns immediately.
          </p>
        ))}
      </div>
    </div>
  ),
};

/** Every hover animation, side by side. */
export const HoverAnimations: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["underline", "lift", "glow", "scale", "none"] as Array<NavMenuHoverAnimation>).map((animation) => (
        <div key={animation} className="flex items-center gap-4">
          <code className="w-20 shrink-0 text-secondary text-xs">{animation}</code>
          <NavMenuContainer className="border-0" hideOnScroll={false} innerClassName="px-0" sticky={false}>
            <NavMenu hoverAnimation={animation} label="IDE" />
            <NavMenu hoverAnimation={animation} label="Agents" />
            <NavMenu hoverAnimation={animation} label="Pricing" />
          </NavMenuContainer>
        </div>
      ))}
    </div>
  ),
};

/** An item can carry a DropdownMenu or a Popover, opening on click or hover. */
export const WithPanels: Story = {
  args: { children: null },
  render: () => (
    <NavMenuContainer hideOnScroll={false} icon={<Logo />} sticky={false}>
      <NavMenu
        dropdown={[
          { label: "Documentation", value: "docs", icon: "external-link" },
          { label: "API reference", value: "api", icon: "external-link" },
          { separator: true },
          { label: "Changelog", value: "changelog" },
        ]}
        label="Resources"
      />
      <NavMenu label="Products" openOnHover placement="bottom" popover={<ProductPanel />} contentClassName="w-80 p-0" />
      <NavMenu dropdown={languages} label="Intl — English" openOnHover />
    </NavMenuContainer>
  ),
};

const ProductPanel = () => (
  <div className="flex flex-col">
    {[
      { title: "IDE", body: "The editor, with agents built in.", icon: "edit" },
      { title: "CLI", body: "Same agents, in your terminal.", icon: "settings" },
      { title: "Cloud", body: "Run them on someone else's machine.", icon: "upload" },
    ].map((entry) => (
      <a
        key={entry.title}
        className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-surface-alt"
        href="#top"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon name={entry.icon as "edit"} size="sm" />
        </span>
        <span className="flex flex-col">
          <span className="font-medium text-primary text-sm">{entry.title}</span>
          <span className="text-secondary text-xs">{entry.body}</span>
        </span>
      </a>
    ))}
  </div>
);

/** Vertical, with `type` switching between the full column and an icon rail. */
export const Vertical: Story = {
  args: { children: null },
  render: () => {
    const [type, setType] = useState<"expand" | "minimize">("expand");
    return (
      <div className="flex h-96 gap-4 overflow-hidden rounded-md border border-border">
        <NavMenuContainer
          actions={
            <Button className="w-full" size="sm" variant="outline">
              Sign out
            </Button>
          }
          icon={type === "expand" ? <Logo /> : "star"}
          orientation="vertical"
          type={type}
        >
          <NavMenu
            className="w-full justify-start"
            hoverAnimation="none"
            icon="home"
            label={type === "expand" ? "Overview" : ""}
          />
          <NavMenu
            className="w-full justify-start"
            hoverAnimation="none"
            icon="download"
            label={type === "expand" ? "Invoices" : ""}
          />
          <NavMenu
            className="w-full justify-start"
            hoverAnimation="none"
            icon="user"
            label={type === "expand" ? "Clients" : ""}
          />
          <NavMenu
            className="w-full justify-start"
            hoverAnimation="none"
            icon="settings"
            label={type === "expand" ? "Settings" : ""}
          />
        </NavMenuContainer>
        <div className="flex-1 p-4">
          <Button onClick={() => setType(type === "expand" ? "minimize" : "expand")} size="sm" variant="outline">
            {type === "expand" ? "Minimize" : "Expand"}
          </Button>
          <p className="mt-4 text-secondary text-sm">
            `animateOnChange` drives the width transition. Turn it off for an instant switch.
          </p>
        </div>
      </div>
    );
  },
};
