import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Sidebar, type SidebarItem } from "./sidebar";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

const items: Array<SidebarItem> = [
  { label: "Overview", value: "overview", icon: "home" },
  { label: "Invoices", value: "invoices", icon: "download" },
  { label: "Settings", value: "settings", icon: "settings", disabled: true },
];

describe("Sidebar", () => {
  it("renders the items as a labelled nav", () => {
    render(<Sidebar items={items} />);
    expect(screen.getByRole("navigation", { name: "Navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("marks the active item", () => {
    render(<Sidebar items={items} value="invoices" />);
    expect(screen.getByRole("button", { name: /Invoices/ })).toHaveAttribute("aria-current", "page");
  });

  it("reports selection", async () => {
    const onSelect = vi.fn();
    render(<Sidebar items={items} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: /Overview/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "overview" }));
  });

  it("disables a disabled item", () => {
    render(<Sidebar items={items} />);
    expect(screen.getByRole("button", { name: /Settings/ })).toBeDisabled();
  });

  describe("modes", () => {
    it("is an in-flow column when static", () => {
      const { container } = render(<Sidebar items={items} mode="static" />);
      expect(container.querySelector("aside")).toHaveClass("w-64", "border-r");
    });

    it("sticks with the given offset", () => {
      const { container } = render(<Sidebar items={items} mode="sticky" stickyTop="2rem" />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("sticky");
      expect(aside).toHaveStyle({ top: "2rem" });
    });

    it("floats detached from the flow", () => {
      const { container } = render(<Sidebar items={items} mode="floating" />);
      expect(container.querySelector("aside")).toHaveClass("fixed", "shadow-lg");
    });

    it("renders a modal drawer when offcanvas and open", () => {
      render(<Sidebar items={items} mode="offcanvas" open />);
      expect(screen.getByRole("dialog")).toBeVisible();
    });

    it("renders nothing visible when offcanvas and closed", () => {
      render(<Sidebar items={items} mode="offcanvas" open={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("puts the border on the other side when side is right", () => {
      const { container } = render(<Sidebar items={items} side="right" />);
      expect(container.querySelector("aside")).toHaveClass("border-l");
    });
  });

  describe("mini", () => {
    it("shows labels until collapsed", async () => {
      const { container } = render(<Sidebar items={items} mode="mini" />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(container.querySelector("aside")).toHaveClass("w-64");

      await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
      expect(screen.queryByText("Overview")).not.toBeInTheDocument();
      expect(container.querySelector("aside")).toHaveClass("w-16");
    });

    it("keeps the icons in the rail, with a title for the label", async () => {
      const { container } = render(<Sidebar items={items} mode="mini" />);
      await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

      expect(container.querySelectorAll("nav svg")).toHaveLength(3);
      expect(screen.getByTitle("Overview")).toBeInTheDocument();
    });

    it("reports the collapse to a controlling parent", async () => {
      const onCollapsedChange = vi.fn();
      render(<Sidebar collapsed={false} items={items} mode="mini" onCollapsedChange={onCollapsedChange} />);

      await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    });

    it("has no collapse control in the other modes", () => {
      render(<Sidebar items={items} mode="static" />);
      expect(screen.queryByRole("button", { name: /Collapse|Expand/ })).not.toBeInTheDocument();
    });
  });

  it("renders header and footer slots", () => {
    render(<Sidebar footer={<span>footer</span>} header={<span>header</span>} items={items} />);
    expect(screen.getByText("header")).toBeInTheDocument();
    expect(screen.getByText("footer")).toBeInTheDocument();
  });
});
