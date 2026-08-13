import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./select";

const options: Array<SelectOption> = [
  { label: "Standard", value: "standard" },
  { label: "Express", value: "express" },
  { label: "Overnight", value: "overnight", disabled: true },
];

describe("Select", () => {
  it("renders a native combobox with one option each", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects and reports the value", async () => {
    const onChange = vi.fn();
    render(<Select onChange={onChange} options={options} />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "express");
    expect(screen.getByRole("combobox")).toHaveValue("express");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders the placeholder as a disabled first option", () => {
    render(<Select options={options} placeholder="Pick a speed" />);
    const placeholder = screen.getByRole("option", { name: "Pick a speed" });
    expect(placeholder).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("disables an individual option", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("option", { name: "Overnight" })).toBeDisabled();
  });

  it("accepts children instead of options, for optgroups", () => {
    render(
      <Select>
        <optgroup label="Domestic">
          <option value="jkt">Jakarta</option>
        </optgroup>
      </Select>,
    );
    expect(screen.getByRole("group", { name: "Domestic" })).toBeInTheDocument();
  });

  it("insets the text for a left icon", () => {
    render(<Select leftIcon="truck-delivery" options={options} />);
    expect(screen.getByRole("combobox")).toHaveClass("pl-10");
  });

  it("always leaves room for the chevron", () => {
    const { container } = render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toHaveClass("pr-10");
    // Chevron plus, when present, the left icon.
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("is disabled when asked", () => {
    render(<Select disabled options={options} />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
