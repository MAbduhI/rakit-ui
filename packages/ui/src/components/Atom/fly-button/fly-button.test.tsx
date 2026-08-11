import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FlyButton } from "./fly-button";

describe("FlyButton", () => {
  it("renders a button inside a fixed wrapper", () => {
    render(<FlyButton>Chat</FlyButton>);
    const button = screen.getByRole("button", { name: "Chat" });
    expect(button).toHaveClass("rounded-full");
    expect(button.parentElement).toHaveClass("fixed", "bottom-6", "right-6");
  });

  it("renders the named icon", () => {
    const { container } = render(<FlyButton icon="message-circle" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("stays square without a label and grows into a pill with one", () => {
    const { rerender } = render(<FlyButton icon="plus" />);
    expect(screen.getByRole("button")).toHaveClass("aspect-square");

    rerender(<FlyButton icon="plus">Add item</FlyButton>);
    expect(screen.getByRole("button", { name: /Add item/ })).not.toHaveClass("aspect-square");
  });

  it("passes positioning through to the wrapper", () => {
    render(
      <FlyButton horizontal="left" vertical={20}>
        Help
      </FlyButton>,
    );
    const wrapper = screen.getByRole("button", { name: "Help" }).parentElement;
    expect(wrapper).toHaveClass("left-6");
    expect(wrapper).toHaveStyle({ top: "20vh" });
  });

  it("keeps the Button props working", async () => {
    const onClick = vi.fn();
    render(
      <FlyButton onClick={onClick} variant="destructive">
        Stop
      </FlyButton>,
    );
    const button = screen.getByRole("button", { name: "Stop" });
    expect(button).toHaveClass("bg-error");

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("separates wrapper classes from button classes", () => {
    render(
      <FlyButton className="bg-success" containerClassName="z-10">
        Go
      </FlyButton>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveClass("bg-success");
    expect(button.parentElement).toHaveClass("z-10");
  });
});
