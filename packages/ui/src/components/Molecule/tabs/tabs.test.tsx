import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tab, Tabs, type TabsProps } from "./tabs";

const renderTabs = (props: Partial<TabsProps> = {}, count = 3) =>
  render(
    <Tabs {...props}>
      {Array.from({ length: count }, (_, index) => (
        <Tab key={index} label={`Tab ${index + 1}`} value={`t${index + 1}`}>
          Panel {index + 1}
        </Tab>
      ))}
    </Tabs>,
  );

describe("Tabs", () => {
  it("selects the first tab by default and shows its panel", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 1");
  });

  it("honours defaultValue", () => {
    renderTabs({ defaultValue: "t2" });
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 2");
  });

  it("switches panel on click and reports the value", async () => {
    const onClick = vi.fn();
    renderTabs({ onClick });

    await userEvent.click(screen.getByRole("tab", { name: "Tab 3" }));
    expect(onClick).toHaveBeenCalledWith("t3");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 3");
  });

  it("stays put when controlled and the value does not change", async () => {
    const onClick = vi.fn();
    renderTabs({ value: "t1", onClick });

    await userEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
    expect(onClick).toHaveBeenCalledWith("t2");
    // Controlled: the parent owns the value, so the panel has not moved.
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 1");
  });

  it("does not re-fire for the tab already active", async () => {
    const onClick = vi.fn();
    renderTabs({ onClick });

    await userEvent.click(screen.getByRole("tab", { name: "Tab 1" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  describe("a11y", () => {
    it("wires the panel to the active trigger", () => {
      renderTabs();
      const trigger = screen.getByRole("tab", { name: "Tab 1" });
      const panel = screen.getByRole("tabpanel");
      expect(trigger).toHaveAttribute("aria-controls", panel.id);
      expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    });

    it("uses a roving tabindex", () => {
      renderTabs();
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("tabindex", "-1");
    });

    it("reports its orientation", () => {
      renderTabs({ orientation: "vertical" });
      expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("keyboard", () => {
    it("moves with the arrows and wraps", async () => {
      renderTabs();
      screen.getByRole("tab", { name: "Tab 1" }).focus();

      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 2");

      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 3");
    });

    it("uses up and down when vertical", async () => {
      renderTabs({ orientation: "vertical" });
      screen.getByRole("tab", { name: "Tab 1" }).focus();

      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 2");
    });

    it("jumps to the ends with Home and End", async () => {
      renderTabs();
      screen.getByRole("tab", { name: "Tab 1" }).focus();

      await userEvent.keyboard("{End}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 3");

      await userEvent.keyboard("{Home}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 1");
    });

    it("skips disabled tabs", async () => {
      render(
        <Tabs>
          <Tab label="One" value="a">
            Panel A
          </Tab>
          <Tab disabled label="Two" value="b">
            Panel B
          </Tab>
          <Tab label="Three" value="c">
            Panel C
          </Tab>
        </Tabs>,
      );
      screen.getByRole("tab", { name: "One" }).focus();

      await userEvent.keyboard("{ArrowRight}");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel C");
    });
  });

  describe("icon and note", () => {
    it("renders both, and note sits beside the icon", () => {
      render(
        <Tabs>
          <Tab icon="user" label="Profile" note={<span>3</span>} value="a">
            Panel
          </Tab>
        </Tabs>,
      );
      const trigger = screen.getByRole("tab", { name: /Profile/ });
      expect(trigger.querySelector("svg")).toBeInTheDocument();
      expect(trigger).toHaveTextContent("3");
    });

    it("puts the icon after the label when iconPosition is right", () => {
      render(
        <Tabs iconPosition="right">
          <Tab icon="user" label="Profile" value="a">
            Panel
          </Tab>
        </Tabs>,
      );
      const nodes = Array.from(screen.getByRole("tab").childNodes);
      expect((nodes.at(-1) as Element).tagName.toLowerCase()).toBe("svg");
    });

    it("puts the note after the label when notePosition is right", () => {
      render(
        <Tabs notePosition="right">
          <Tab label="Profile" note={<span data-testid="note">3</span>} value="a">
            Panel
          </Tab>
        </Tabs>,
      );
      const trigger = screen.getByRole("tab");
      const note = screen.getByTestId("note");
      expect(trigger.lastElementChild).toBe(note);
    });
  });

  describe("variant and width", () => {
    it("underlines by default and fills for panel", () => {
      const { rerender } = renderTabs();
      expect(screen.getByRole("tablist")).toHaveClass("border-b");

      rerender(
        <Tabs variant="panel">
          <Tab label="Tab 1" value="t1">
            Panel 1
          </Tab>
        </Tabs>,
      );
      expect(screen.getByRole("tablist")).toHaveClass("bg-surface-alt");
    });

    it.each([
      ["fill", "w-full"],
      ["span", "justify-between"],
    ] as const)("applies %s to the list", (width, expected) => {
      renderTabs({ width });
      expect(screen.getByRole("tablist")).toHaveClass(expected);
    });

    it("tightens the trigger padding when compact, without changing the type scale", () => {
      renderTabs({ width: "compact" });
      const trigger = screen.getByRole("tab", { name: "Tab 1" });
      expect(trigger).toHaveClass("px-2.5", "py-1");
      // Still the md type scale — `size` owns that, not `width`.
      expect(trigger).toHaveClass("text-sm");
    });
  });

  describe("size", () => {
    it.each([
      ["sm", "text-xs", "px-3"],
      ["md", "text-sm", "px-4"],
      ["lg", "text-base", "px-5"],
      ["xl", "text-lg", "px-6"],
      ["2xl", "text-xl", "px-7"],
      ["3xl", "text-2xl", "px-8"],
      ["4xl", "text-3xl", "px-10"],
      ["5xl", "text-4xl", "px-12"],
    ] as const)("scales type and padding at %s", (size, text, padding) => {
      renderTabs({ size });
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveClass(text, padding);
    });

    it("defaults to md", () => {
      renderTabs();
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveClass("text-sm", "px-4");
    });

    it("scales the icon with it", () => {
      const { rerender } = render(
        <Tabs size="sm">
          <Tab icon="user" label="One" value="a" />
        </Tabs>,
      );
      expect(screen.getByRole("tab").querySelector("svg")).toHaveClass("size-4");

      rerender(
        <Tabs size="4xl">
          <Tab icon="user" label="One" value="a" />
        </Tabs>,
      );
      expect(screen.getByRole("tab").querySelector("svg")).toHaveClass("size-8");
    });

    it("combines size with compact", () => {
      renderTabs({ size: "3xl", width: "compact" });
      expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveClass("text-2xl", "px-5");
    });
  });

  describe("maxView", () => {
    it("keeps every tab visible when under the limit", () => {
      renderTabs({ maxView: 5 });
      expect(screen.getAllByRole("tab")).toHaveLength(3);
      expect(screen.queryByText(/more Option/)).not.toBeInTheDocument();
    });

    it("collapses the rest into a counted menu", () => {
      renderTabs({ maxView: 2 }, 5);
      expect(screen.getAllByRole("tab")).toHaveLength(2);
      expect(screen.getByText("3+ more Option")).toBeInTheDocument();
    });

    it("selects from the overflow menu", async () => {
      renderTabs({ maxView: 2 }, 5);
      await userEvent.click(screen.getByText("3+ more Option"));
      await userEvent.click(screen.getByRole("button", { name: "Tab 5" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 5");
    });
  });

  describe("renderTrigger", () => {
    it("replaces the trigger and reports the active state", () => {
      renderTabs({
        renderTrigger: (tab, state) => (
          <button data-active={state.active} onClick={state.select} type="button">
            {tab.label}
          </button>
        ),
      });

      expect(screen.getByRole("button", { name: "Tab 1" })).toHaveAttribute("data-active", "true");
      expect(screen.getByRole("button", { name: "Tab 2" })).toHaveAttribute("data-active", "false");
    });

    it("still drives selection through the custom trigger", async () => {
      renderTabs({
        renderTrigger: (tab, state) => (
          <button onClick={state.select} type="button">
            {tab.label}
          </button>
        ),
      });

      await userEvent.click(screen.getByRole("button", { name: "Tab 2" }));
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel 2");
    });
  });
});
