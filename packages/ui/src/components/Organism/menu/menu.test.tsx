import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Menu, type MenuItem } from "./menu";

const items: Array<MenuItem> = [
  { key: "main", label: "Main", group: true },
  { key: "overview", label: "Overview", icon: "home" },
  {
    key: "billing",
    label: "Billing",
    icon: "download",
    children: [
      { key: "invoices", label: "Invoices" },
      { key: "plans", label: "Plans" },
    ],
  },
  { key: "settings", label: "Settings", href: "/settings" },
  { key: "archived", label: "Archived", disabled: true },
];

describe("Menu", () => {
  it("renders a labelled nav", () => {
    render(<Menu items={items} label="Primary" />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });

  it("renders a group as a heading, not a control", () => {
    render(<Menu items={items} />);
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Main" })).not.toBeInTheDocument();
  });

  it("renders an item with href as a link", () => {
    render(<Menu items={items} />);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
  });

  it("reports selection and marks the item current", async () => {
    const onSelect = vi.fn();
    render(<Menu items={items} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: "overview" }));
    expect(screen.getByRole("button", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  });

  it("stays put when controlled", async () => {
    const onSelect = vi.fn();
    render(<Menu items={items} onSelect={onSelect} selectedKey="overview" />);

    await userEvent.click(screen.getByRole("link", { name: "Settings" }));
    expect(onSelect).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Overview" })).toHaveAttribute("aria-current", "page");
  });

  it("disables a disabled item", () => {
    render(<Menu items={items} />);
    expect(screen.getByRole("button", { name: "Archived" })).toBeDisabled();
  });

  describe("submenus", () => {
    it("starts collapsed and reports expansion", () => {
      render(<Menu items={items} />);
      expect(screen.getByRole("button", { name: "Billing" })).toHaveAttribute("aria-expanded", "false");
    });

    it("opens on click", async () => {
      const onOpenChange = vi.fn();
      render(<Menu animateType="fade" items={items} onOpenChange={onOpenChange} />);

      await userEvent.click(screen.getByRole("button", { name: "Billing" }));
      expect(onOpenChange).toHaveBeenCalledWith(["billing"]);
      expect(screen.getByRole("button", { name: "Invoices" })).toBeInTheDocument();
    });

    it("honours defaultOpenKeys", () => {
      render(<Menu animateType="fade" defaultOpenKeys={["billing"]} items={items} />);
      expect(screen.getByRole("button", { name: "Invoices" })).toBeInTheDocument();
    });

    it("wires the panel to its trigger", () => {
      render(<Menu defaultOpenKeys={["billing"]} items={items} />);
      const trigger = screen.getByRole("button", { name: "Billing" });
      expect(trigger).toHaveAttribute("aria-controls");
    });

    it("closes the previous one in accordion mode", async () => {
      const nested: Array<MenuItem> = [
        { key: "a", label: "A", children: [{ key: "a1", label: "A1" }] },
        { key: "b", label: "B", children: [{ key: "b1", label: "B1" }] },
      ];
      const onOpenChange = vi.fn();
      render(<Menu accordion animateType="fade" defaultOpenKeys={["a"]} items={nested} onOpenChange={onOpenChange} />);

      await userEvent.click(screen.getByRole("button", { name: "B" }));
      expect(onOpenChange).toHaveBeenCalledWith(["b"]);
      expect(screen.queryByRole("button", { name: "A1" })).not.toBeInTheDocument();
    });
  });

  describe("animateType", () => {
    it("keeps the panel mounted and animates its height when collapse", () => {
      render(<Menu animateType="collapse" items={items} />);
      // Mounted but zero-height, which is what lets the height transition run.
      expect(screen.getByRole("button", { name: "Invoices" })).toBeInTheDocument();
    });

    it("unmounts the panel for the other types", () => {
      render(<Menu animateType="slide" items={items} />);
      expect(screen.queryByRole("button", { name: "Invoices" })).not.toBeInTheDocument();
    });

    it("applies the matching keyframes", async () => {
      render(<Menu animateType="slide" items={items} />);
      await userEvent.click(screen.getByRole("button", { name: "Billing" }));

      const panel = screen.getByRole("button", { name: "Invoices" }).closest("ul");
      expect(panel).toHaveStyle({ animationName: "rakit-slide-in" });
    });

    it("adds no animation when none", async () => {
      render(<Menu animateType="none" items={items} />);
      await userEvent.click(screen.getByRole("button", { name: "Billing" }));

      const panel = screen.getByRole("button", { name: "Invoices" }).closest("ul");
      expect(panel).not.toHaveStyle({ animationName: "rakit-slide-in" });
    });
  });

  describe("collapsed", () => {
    it("hides labels and groups, keeping the icons", () => {
      const { container } = render(<Menu collapsed items={items} />);
      expect(screen.queryByText("Overview")).not.toBeInTheDocument();
      expect(screen.queryByText("Main")).not.toBeInTheDocument();
      expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
    });

    it("keeps the label reachable as a tooltip", () => {
      render(<Menu collapsed items={items} />);
      expect(screen.getByTitle("Overview")).toBeInTheDocument();
    });
  });

  it("indents each nesting level", () => {
    render(<Menu defaultOpenKeys={["billing"]} indent={20} items={items} />);
    expect(screen.getByRole("button", { name: "Invoices" })).toHaveStyle({ paddingLeft: "32px" });
  });
});
