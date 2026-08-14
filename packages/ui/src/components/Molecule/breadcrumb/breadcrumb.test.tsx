import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const items: Array<BreadcrumbItem> = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Invoices", href: "/invoices" },
  { label: "INV-1041" },
];

describe("Breadcrumb", () => {
  it("renders a labelled nav with one entry per crumb", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("links every crumb except the last", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("link", { name: /Home/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Invoices" })).toBeInTheDocument();
    // The current page is not a link — there is nowhere to navigate to.
    expect(screen.queryByRole("link", { name: "INV-1041" })).not.toBeInTheDocument();
  });

  it("marks the last crumb as the current page", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("INV-1041")).toHaveAttribute("aria-current", "page");
  });

  it("renders a button when given onClick instead of href", async () => {
    const onClick = vi.fn();
    render(<Breadcrumb items={[{ label: "Back", onClick }, { label: "Here" }]} />);

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a plain label when given neither", () => {
    render(<Breadcrumb items={[{ label: "Static" }, { label: "Here" }]} />);
    expect(screen.getByText("Static")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Static" })).not.toBeInTheDocument();
  });

  it("takes a custom separator", () => {
    render(<Breadcrumb items={items} separator={<span>/</span>} />);
    expect(screen.getAllByText("/")).toHaveLength(2);
  });

  describe("maxItems", () => {
    const long: Array<BreadcrumbItem> = [
      { label: "One", href: "/1" },
      { label: "Two", href: "/2" },
      { label: "Three", href: "/3" },
      { label: "Four", href: "/4" },
      { label: "Five" },
    ];

    it("leaves a short trail alone", () => {
      render(<Breadcrumb items={items} maxItems={5} />);
      expect(screen.queryByText("…")).not.toBeInTheDocument();
    });

    it("collapses the middle, keeping the first and last", () => {
      render(<Breadcrumb items={long} maxItems={3} />);
      expect(screen.getByText("…")).toBeInTheDocument();
      expect(screen.getByText("One")).toBeInTheDocument();
      expect(screen.getByText("Five")).toBeInTheDocument();
      expect(screen.queryByText("Two")).not.toBeInTheDocument();
    });

    it("keeps the last crumb current after collapsing", () => {
      render(<Breadcrumb items={long} maxItems={3} />);
      expect(screen.getByText("Five")).toHaveAttribute("aria-current", "page");
    });
  });
});
