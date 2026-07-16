import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders with a placeholder", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("accepts typed input", async () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    await userEvent.type(input, "hello@rakitmimpi.dev");
    expect(input).toHaveValue("hello@rakitmimpi.dev");
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
  });
});
