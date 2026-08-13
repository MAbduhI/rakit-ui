import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./radio";

const group = (props: Partial<Parameters<typeof RadioGroup>[0]> = {}) =>
  render(
    <RadioGroup {...props}>
      <Radio label="Standard" value="standard" />
      <Radio label="Express" value="express" />
      <Radio disabled label="Overnight" value="overnight" />
    </RadioGroup>,
  );

describe("RadioGroup", () => {
  it("exposes itself as a radiogroup with one radio per option", () => {
    group();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("honours defaultValue", () => {
    group({ defaultValue: "express" });
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
  });

  it("selects on click and reports the value", async () => {
    const onChange = vi.fn();
    group({ onChange });

    await userEvent.click(screen.getByRole("radio", { name: "Express" }));
    expect(onChange).toHaveBeenCalledWith("express");
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
  });

  it("keeps only one selected at a time", async () => {
    group({ defaultValue: "standard" });
    await userEvent.click(screen.getByRole("radio", { name: "Express" }));

    expect(screen.getByRole("radio", { name: "Standard" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Express" })).toBeChecked();
  });

  it("stays put when controlled", async () => {
    const onChange = vi.fn();
    group({ value: "standard", onChange });

    await userEvent.click(screen.getByRole("radio", { name: "Express" }));
    expect(onChange).toHaveBeenCalledWith("express");
    // The parent owns the value, so nothing moved on its own.
    expect(screen.getByRole("radio", { name: "Standard" })).toBeChecked();
  });

  it("shares one name across the group, so the browser groups them", () => {
    group({ name: "shipping" });
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveAttribute("name", "shipping");
    }
  });

  it("generates a name when none is given", () => {
    group();
    const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"));
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
  });

  it("disables one option without disabling the rest", () => {
    group();
    expect(screen.getByRole("radio", { name: "Overnight" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Standard" })).toBeEnabled();
  });

  it("disables every option from the group", () => {
    group({ disabled: true });
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeDisabled();
    }
  });

  it("lays out horizontally when asked", () => {
    group({ orientation: "horizontal" });
    expect(screen.getByRole("radiogroup")).toHaveClass("flex-row");
  });
});
