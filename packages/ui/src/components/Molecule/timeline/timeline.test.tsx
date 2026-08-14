import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineItem } from "./timeline";

const items: Array<TimelineItem> = [
  { title: "Created", label: "09:00", children: "Invoice raised", status: "success", icon: "check" },
  { title: "Sent", label: "09:04", children: "Emailed to client", status: "accent" },
  { title: "Overdue", label: "17:00", children: "No payment received", status: "error" },
];

describe("Timeline", () => {
  it("renders every entry as a list item", () => {
    render(<Timeline items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Invoice raised")).toBeInTheDocument();
  });

  it("renders titles and labels", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
  });

  it.each([
    ["success", "bg-success"],
    ["error", "bg-error"],
    ["accent", "bg-accent"],
  ] as const)("paints the %s dot", (status, expected) => {
    const { container } = render(<Timeline items={[{ title: "x", status }]} />);
    expect(container.querySelector(`.${expected.replace("/", "\\/")}`)).toBeInTheDocument();
  });

  it("reverses the order without changing the data", () => {
    render(<Timeline items={items} reverse />);
    const entries = screen.getAllByRole("listitem");
    expect(entries[0]).toHaveTextContent("Overdue");
    expect(entries[2]).toHaveTextContent("Created");
  });

  it("appends a pending entry with a spinner", () => {
    render(<Timeline items={items} pending="Waiting for settlement" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("Waiting for settlement")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("puts the pending entry first when reversed", () => {
    render(<Timeline items={items} pending="Still running" reverse />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Still running");
  });

  it("flips the layout in right mode", () => {
    render(<Timeline items={items} mode="right" />);
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("flex-row-reverse");
  });

  it("uses a three-column grid in alternate mode", () => {
    render(<Timeline items={items} mode="alternate" />);
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("grid");
  });

  it("takes a custom dot", () => {
    render(<Timeline items={[{ title: "x", dot: <span data-testid="custom">•</span> }]} />);
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("omits the rail after the last entry", () => {
    const { container } = render(<Timeline items={items} />);
    // One connector per entry except the last.
    expect(container.querySelectorAll(".bg-border")).toHaveLength(2);
  });
});
