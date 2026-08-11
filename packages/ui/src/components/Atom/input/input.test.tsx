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
    await userEvent.type(input, "hello@rakit-ui.dev");
    expect(input).toHaveValue("hello@rakit-ui.dev");
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input placeholder="Email" disabled />);
    expect(screen.getByPlaceholderText("Email")).toBeDisabled();
  });

  describe("icons", () => {
    it("renders no icon and no padding by default", () => {
      const { container } = render(<Input placeholder="Email" />);
      expect(container.querySelector("svg")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email")).not.toHaveClass("pl-10", "pr-10");
    });

    it("insets the text for a left icon", () => {
      const { container } = render(<Input leftIcon="search" placeholder="Search" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search")).toHaveClass("pl-10");
      expect(screen.getByPlaceholderText("Search")).not.toHaveClass("pr-10");
    });

    it("insets the text for a right icon", () => {
      render(<Input placeholder="Filter" rightIcon="filter" />);
      expect(screen.getByPlaceholderText("Filter")).toHaveClass("pr-10");
      expect(screen.getByPlaceholderText("Filter")).not.toHaveClass("pl-10");
    });

    it("renders both icons at once", () => {
      const { container } = render(<Input leftIcon="search" placeholder="Search" rightIcon="x" />);
      expect(container.querySelectorAll("svg")).toHaveLength(2);
      expect(screen.getByPlaceholderText("Search")).toHaveClass("pl-10", "pr-10");
    });

    it("lets clicks fall through to the input", () => {
      const { container } = render(<Input leftIcon="search" placeholder="Search" />);
      expect(container.querySelector("svg")).toHaveClass("pointer-events-none");
    });

    it("dims the icons when the input is disabled", () => {
      const { container } = render(<Input disabled leftIcon="search" placeholder="Search" />);
      expect(container.querySelector("svg")).toHaveClass("opacity-50");
    });

    it("separates wrapper classes from input classes", () => {
      const { container } = render(
        <Input className="border-error" containerClassName="max-w-xs" leftIcon="search" placeholder="Search" />,
      );
      expect(container.firstElementChild).toHaveClass("max-w-xs");
      expect(screen.getByPlaceholderText("Search")).toHaveClass("border-error");
    });
  });
});
