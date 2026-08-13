import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with a placeholder and accepts typing", async () => {
    render(<Textarea placeholder="Notes" />);
    const field = screen.getByPlaceholderText("Notes");

    await userEvent.type(field, "hello");
    expect(field).toHaveValue("hello");
  });

  it("still calls a plain onChange", async () => {
    const onChange = vi.fn();
    render(<Textarea onChange={onChange} placeholder="Notes" />);
    await userEvent.type(screen.getByPlaceholderText("Notes"), "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("defaults to three rows and stays resizable", () => {
    render(<Textarea placeholder="Notes" />);
    const field = screen.getByPlaceholderText("Notes");
    expect(field).toHaveAttribute("rows", "3");
    expect(field).toHaveClass("resize-y");
  });

  it("stops being manually resizable when autoResize is on", () => {
    render(<Textarea autoResize placeholder="Notes" />);
    expect(screen.getByPlaceholderText("Notes")).toHaveClass("resize-none", "overflow-hidden");
  });

  describe("showCount", () => {
    it("counts what is typed", async () => {
      render(<Textarea placeholder="Notes" showCount />);
      await userEvent.type(screen.getByPlaceholderText("Notes"), "abcd");
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("shows the limit alongside the count", () => {
      render(<Textarea defaultValue="abc" maxLength={100} placeholder="Notes" showCount />);
      expect(screen.getByText("3 / 100")).toBeInTheDocument();
    });

    it("starts from a defaultValue rather than zero", () => {
      render(<Textarea defaultValue="hello" placeholder="Notes" showCount />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("leaves room so the counter never sits on the text", () => {
      render(<Textarea placeholder="Notes" showCount />);
      expect(screen.getByPlaceholderText("Notes")).toHaveClass("pb-6");
    });
  });

  it("is disabled when asked", () => {
    render(<Textarea disabled placeholder="Notes" />);
    expect(screen.getByPlaceholderText("Notes")).toBeDisabled();
  });
});
