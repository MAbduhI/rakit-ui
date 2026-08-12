import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu, type DropdownMenuItem } from "./dropdown-menu";

const trigger = <button type="button">Actions</button>;

const items: Array<DropdownMenuItem> = [
  { label: "Edit", value: "edit", icon: "edit", hint: "⌘E" },
  { label: "Duplicate", value: "duplicate" },
  { separator: true },
  { label: "Archive", value: "archive", disabled: true },
  { label: "Delete", value: "delete", destructive: true },
];

const open = async () => userEvent.click(screen.getByRole("button", { name: "Actions" }));

describe("DropdownMenu", () => {
  it("opens onto a menu of items", async () => {
    render(<DropdownMenu items={items} trigger={trigger} />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await open();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
  });

  it("renders separators as rules, not items", async () => {
    const { container } = render(<DropdownMenu items={items} trigger={trigger} />);
    await open();
    expect(container.querySelectorAll("hr")).toHaveLength(1);
  });

  it("reports the selected item and closes", async () => {
    const onSelect = vi.fn();
    render(<DropdownMenu items={items} onSelect={onSelect} trigger={trigger} />);
    await open();

    await userEvent.click(screen.getByRole("menuitem", { name: /Edit/ }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "edit" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls the item's own onSelect", async () => {
    const onItemSelect = vi.fn();
    render(<DropdownMenu items={[{ label: "One", value: "a", onSelect: onItemSelect }]} trigger={trigger} />);
    await open();

    await userEvent.click(screen.getByRole("menuitem", { name: "One" }));
    expect(onItemSelect).toHaveBeenCalledTimes(1);
  });

  it("can stay open after a selection", async () => {
    render(<DropdownMenu closeOnSelect={false} items={items} trigger={trigger} />);
    await open();

    await userEvent.click(screen.getByRole("menuitem", { name: /Edit/ }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("disables the disabled item", async () => {
    render(<DropdownMenu items={items} trigger={trigger} />);
    await open();
    expect(screen.getByRole("menuitem", { name: "Archive" })).toBeDisabled();
  });

  it("renders the hint and marks a destructive item", async () => {
    render(<DropdownMenu items={items} trigger={trigger} />);
    await open();
    expect(screen.getByText("⌘E")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveClass("text-error");
  });

  describe("keyboard", () => {
    it("moves down the enabled items, skipping the disabled one", async () => {
      render(<DropdownMenu items={items} trigger={trigger} />);
      await open();

      screen.getByRole("menuitem", { name: /Edit/ }).focus();
      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("menuitem", { name: "Duplicate" })).toHaveFocus();

      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    });

    it("wraps at the ends", async () => {
      render(<DropdownMenu items={items} trigger={trigger} />);
      await open();

      screen.getByRole("menuitem", { name: /Edit/ }).focus();
      await userEvent.keyboard("{ArrowUp}");
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    });

    it("jumps with Home and End", async () => {
      render(<DropdownMenu items={items} trigger={trigger} />);
      await open();

      screen.getByRole("menuitem", { name: /Edit/ }).focus();
      await userEvent.keyboard("{End}");
      expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();

      await userEvent.keyboard("{Home}");
      expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveFocus();
    });

    it("closes on Escape", async () => {
      render(<DropdownMenu items={items} trigger={trigger} />);
      await open();

      await userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
