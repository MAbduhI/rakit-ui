import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapse, type CollapseItem } from "./collapse";

const items: Array<CollapseItem> = [
  { key: "a", label: "First", children: "Panel A" },
  { key: "b", label: "Second", children: "Panel B" },
  { key: "c", label: "Third", children: "Panel C", disabled: true },
];

describe("Collapse", () => {
  it("starts fully closed", () => {
    render(<Collapse items={items} />);
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a panel on click", async () => {
    render(<Collapse items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "First" }));

    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
  });

  it("closes it again on a second click", async () => {
    render(<Collapse defaultActiveKeys={["a"]} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "First" }));
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("honours defaultActiveKeys", () => {
    render(<Collapse defaultActiveKeys={["b"]} items={items} />);
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });

  it("keeps several open at once by default", async () => {
    render(<Collapse items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "First" }));
    await userEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });

  it("allows only one at a time in accordion mode", async () => {
    render(<Collapse accordion defaultActiveKeys={["a"]} items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "Second" }));

    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });

  it("reports the open keys", async () => {
    const onChange = vi.fn();
    render(<Collapse items={items} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "First" }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("stays put when controlled", async () => {
    const onChange = vi.fn();
    render(<Collapse activeKeys={[]} items={items} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "First" }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
    // The parent owns the state, so nothing opened on its own.
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
  });

  it("disables a disabled item", () => {
    render(<Collapse items={items} />);
    expect(screen.getByRole("button", { name: "Third" })).toBeDisabled();
  });

  it("wires the panel to its trigger", async () => {
    render(<Collapse items={items} />);
    await userEvent.click(screen.getByRole("button", { name: "First" }));

    const trigger = screen.getByRole("button", { name: "First" });
    const panel = screen.getByRole("region");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("renders extra content in the header", () => {
    render(<Collapse items={[{ key: "a", label: "First", children: "x", extra: <span>3 items</span> }]} />);
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("drops the frame when not bordered", () => {
    const { container } = render(<Collapse bordered={false} items={items} />);
    expect(container.firstElementChild).not.toHaveClass("border");
  });
});
