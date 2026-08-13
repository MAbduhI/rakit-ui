import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavMenu, NavMenuContainer } from "./nav-menu";

describe("NavMenu", () => {
  it("renders an anchor when href is set, a button otherwise", () => {
    const { rerender } = render(<NavMenu href="/pricing" label="Pricing" />);
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");

    rerender(<NavMenu label="Pricing" />);
    expect(screen.getByRole("button", { name: "Pricing" })).toBeInTheDocument();
  });

  it("marks the active item", () => {
    render(<NavMenu active href="/pricing" label="Pricing" />);
    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("text-accent");
  });

  it("renders an icon and a badge", () => {
    const { container } = render(<NavMenu badge={<span>Beta</span>} icon="star" label="Agents" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("falls back to a button when disabled even with an href", () => {
    render(<NavMenu disabled href="/x" label="Soon" />);
    expect(screen.getByRole("button", { name: "Soon" })).toBeDisabled();
  });

  it.each([
    ["underline", "hover:after:w-[calc(100%-1.5rem)]"],
    ["lift", "hover:-translate-y-0.5"],
    ["glow", "hover:brightness-125"],
    ["scale", "hover:scale-105"],
  ] as const)("applies the %s hover animation", (hoverAnimation, expected) => {
    render(<NavMenu hoverAnimation={hoverAnimation} label="Item" />);
    expect(screen.getByRole("button", { name: "Item" })).toHaveClass(expected);
  });

  describe("dropdown and popover", () => {
    it("opens a dropdown on click and reports the selection", async () => {
      const onSelect = vi.fn();
      render(
        <NavMenu
          dropdown={[
            { label: "English", value: "en" },
            { label: "Bahasa", value: "id" },
          ]}
          label="Language"
          onSelect={onSelect}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: /Language/ }));
      await userEvent.click(screen.getByRole("menuitem", { name: "English" }));
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "en" }));
    });

    it("opens a popover, and popover wins over dropdown", async () => {
      render(
        <NavMenu
          dropdown={[{ label: "Never shown", value: "x" }]}
          label="Docs"
          popover={<p>panel body</p>}
        />,
      );

      await userEvent.click(screen.getByRole("button", { name: /Docs/ }));
      expect(screen.getByText("panel body")).toBeInTheDocument();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("adds a chevron only when there is a panel", () => {
      const { container, rerender } = render(<NavMenu label="Plain" />);
      expect(container.querySelectorAll("svg")).toHaveLength(0);

      rerender(<NavMenu label="With menu" dropdown={[{ label: "One", value: "1" }]} />);
      expect(container.querySelectorAll("svg")).toHaveLength(1);
    });

    it("opens on hover when openOnHover is set", async () => {
      render(<NavMenu label="Docs" openOnHover popover={<p>panel body</p>} />);

      await userEvent.hover(screen.getByRole("button", { name: /Docs/ }));
      expect(screen.getByText("panel body")).toBeInTheDocument();
    });
  });
});

describe("NavMenuContainer", () => {
  it("renders a labelled nav with its children", () => {
    render(
      <NavMenuContainer>
        <NavMenu label="IDE" />
      </NavMenuContainer>,
    );
    expect(screen.getByRole("navigation", { name: "Main" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IDE" })).toBeInTheDocument();
  });

  it("renders the brand and actions slots", () => {
    render(
      <NavMenuContainer actions={<button type="button">Login</button>} icon={<span>logo</span>}>
        <NavMenu label="IDE" />
      </NavMenuContainer>,
    );
    expect(screen.getByText("logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("accepts an icon name for the brand", () => {
    const { container } = render(
      <NavMenuContainer icon="star">
        <NavMenu label="IDE" />
      </NavMenuContainer>,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  describe("orientation", () => {
    it("is a sticky bar when horizontal", () => {
      render(
        <NavMenuContainer>
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      expect(screen.getByRole("navigation")).toHaveClass("sticky", "border-b");
    });

    it("is a column when vertical", () => {
      render(
        <NavMenuContainer orientation="vertical">
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("flex-col", "border-r", "w-64");
    });
  });

  describe("type", () => {
    it("narrows a vertical nav to a rail when minimized", () => {
      render(
        <NavMenuContainer orientation="vertical" type="minimize">
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      expect(screen.getByRole("navigation")).toHaveClass("w-16");
    });

    it("animates the change unless told not to", () => {
      const { rerender } = render(
        <NavMenuContainer orientation="vertical">
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      expect(screen.getByRole("navigation")).toHaveClass("transition-[width]");

      rerender(
        <NavMenuContainer animateOnChange={false} orientation="vertical">
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      expect(screen.getByRole("navigation")).not.toHaveClass("transition-[width]");
    });
  });

  describe("hideOnScroll", () => {
    beforeEach(() => {
      window.scrollY = 0;
    });
    afterEach(() => {
      window.scrollY = 0;
    });

    const scrollTo = (y: number) => {
      act(() => {
        window.scrollY = y;
        window.dispatchEvent(new Event("scroll"));
      });
    };

    it("hides on the way down and returns on the way up", () => {
      render(
        <NavMenuContainer>
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );
      const nav = screen.getByRole("navigation");

      scrollTo(200);
      expect(nav).toHaveClass("-translate-y-full");

      scrollTo(100);
      expect(nav).not.toHaveClass("-translate-y-full");
    });

    it("stays put within the threshold", () => {
      render(
        <NavMenuContainer hideThreshold={300}>
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );

      scrollTo(200);
      expect(screen.getByRole("navigation")).not.toHaveClass("-translate-y-full");
    });

    it("can be switched off", () => {
      render(
        <NavMenuContainer hideOnScroll={false}>
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );

      scrollTo(400);
      expect(screen.getByRole("navigation")).not.toHaveClass("-translate-y-full");
    });

    it("never hides a vertical nav", () => {
      render(
        <NavMenuContainer orientation="vertical">
          <NavMenu label="IDE" />
        </NavMenuContainer>,
      );

      scrollTo(400);
      expect(screen.getByRole("navigation")).not.toHaveClass("-translate-y-full");
    });
  });
});
