import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResizeContainer } from "./resize-container";

const panels = [<div key="a">Panel A</div>, <div key="b">Panel B</div>, <div key="c">Panel C</div>];

describe("ResizeContainer", () => {
  it("renders each child and a handle between them", () => {
    render(<ResizeContainer>{panels}</ResizeContainer>);
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    // Three panels means two boundaries, not three.
    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("splits evenly by default", () => {
    render(<ResizeContainer>{[panels[0], panels[1]]}</ResizeContainer>);
    expect(screen.getByText("Panel A").parentElement).toHaveStyle({ flexBasis: "50%" });
  });

  it("honours defaultSizes", () => {
    render(<ResizeContainer defaultSizes={[70, 30]}>{[panels[0], panels[1]]}</ResizeContainer>);
    expect(screen.getByText("Panel A").parentElement).toHaveStyle({ flexBasis: "70%" });
  });

  it("reports its position on the separator", () => {
    render(<ResizeContainer defaultSizes={[70, 30]}>{[panels[0], panels[1]]}</ResizeContainer>);
    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("aria-valuenow", "70");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
  });

  it("reports horizontal orientation when stacked vertically", () => {
    render(<ResizeContainer orientation="vertical">{[panels[0], panels[1]]}</ResizeContainer>);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });

  describe("keyboard", () => {
    it("moves the boundary with the arrows", async () => {
      const onChange = vi.fn();
      render(
        <ResizeContainer defaultSizes={[50, 50]} onChange={onChange}>
          {[panels[0], panels[1]]}
        </ResizeContainer>,
      );

      screen.getByRole("separator").focus();
      await userEvent.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalledWith([55, 45]);
    });

    it("takes only what the neighbour gives up", async () => {
      const onChange = vi.fn();
      render(
        <ResizeContainer defaultSizes={[20, 30, 50]} onChange={onChange}>
          {panels}
        </ResizeContainer>,
      );

      screen.getAllByRole("separator")[0]?.focus();
      await userEvent.keyboard("{ArrowRight}");
      // The third panel is untouched — a drag is strictly between two panels.
      expect(onChange).toHaveBeenCalledWith([25, 25, 50]);
    });

    it("stops at minSize", async () => {
      const onChange = vi.fn();
      render(
        <ResizeContainer defaultSizes={[12, 88]} minSize={10} onChange={onChange}>
          {[panels[0], panels[1]]}
        </ResizeContainer>,
      );

      screen.getByRole("separator").focus();
      await userEvent.keyboard("{ArrowLeft}");
      expect(onChange).toHaveBeenCalledWith([10, 90]);

      onChange.mockClear();
      await userEvent.keyboard("{ArrowLeft}");
      // Already at the floor, so nothing is emitted.
      expect(onChange).not.toHaveBeenCalled();
    });

    it("uses up and down when vertical", async () => {
      const onChange = vi.fn();
      render(
        <ResizeContainer defaultSizes={[50, 50]} onChange={onChange} orientation="vertical">
          {[panels[0], panels[1]]}
        </ResizeContainer>,
      );

      screen.getByRole("separator").focus();
      await userEvent.keyboard("{ArrowDown}");
      expect(onChange).toHaveBeenCalledWith([55, 45]);
    });
  });

  it("stays put when controlled", async () => {
    const onChange = vi.fn();
    render(
      <ResizeContainer onChange={onChange} sizes={[50, 50]}>
        {[panels[0], panels[1]]}
      </ResizeContainer>,
    );

    screen.getByRole("separator").focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith([55, 45]);
    expect(screen.getByText("Panel A").parentElement).toHaveStyle({ flexBasis: "50%" });
  });

  it("takes the handle out of the tab order when disabled", async () => {
    const onChange = vi.fn();
    render(
      <ResizeContainer defaultSizes={[50, 50]} disabled onChange={onChange}>
        {[panels[0], panels[1]]}
      </ResizeContainer>,
    );

    const handle = screen.getByRole("separator");
    expect(handle).toHaveAttribute("tabindex", "-1");

    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });
});
