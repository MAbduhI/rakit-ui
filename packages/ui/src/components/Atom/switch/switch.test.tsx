import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("exposes itself as a switch, not a checkbox", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("starts off and toggles on", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("switch");
    expect(control).toHaveAttribute("aria-checked", "false");

    await userEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("honours defaultChecked", () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("stays put when controlled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("takes its accessible name from the label inside it", () => {
    render(<Switch label="Email alerts" />);
    expect(screen.getByRole("switch", { name: "Email alerts" })).toBeInTheDocument();
  });

  it("toggles when the label text is clicked", async () => {
    render(<Switch label="Email alerts" />);
    await userEvent.click(screen.getByText("Email alerts"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("shows the on/off track text for the current state", async () => {
    render(<Switch offLabel="OFF" onLabel="ON" />);
    expect(screen.getByText("OFF")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByText("ON")).toBeInTheDocument();
  });

  it("does not toggle while disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch disabled onCheckedChange={onCheckedChange} />);

    await userEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it.each([
    ["sm", "h-5"],
    ["md", "h-6"],
    ["lg", "h-7"],
  ] as const)("sizes the track at %s", (size, expected) => {
    render(<Switch size={size} />);
    expect(screen.getByRole("switch").firstElementChild).toHaveClass(expected);
  });
});
