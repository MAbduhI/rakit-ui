import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Maps from "./map-component";

/*
 * jsdom has no layout, so Leaflet itself cannot be asserted here — the tiles,
 * markers and polylines are verified by eye in Storybook and the playground.
 * What *is* testable is the branch that runs before Leaflet loads, which is
 * also the branch every SSR consumer renders on the server.
 */
describe("Maps", () => {
  it("renders the token-themed fallback before Leaflet loads", () => {
    const { container } = render(<Maps />);

    expect(screen.getByText("Loading map…")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("bg-surface-alt");
  });

  it("merges className onto the fallback so sizing survives the swap", () => {
    const { container } = render(<Maps className="h-64 w-full" />);
    expect(container.firstElementChild).toHaveClass("h-64", "w-full");
  });

  it("accepts custom tile layers without breaking the pre-Leaflet render", () => {
    render(
      <Maps
        customLayers={[{ id: "opentopo", name: "OpenTopoMap", url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" }]}
        tileLayer="opentopo"
      />,
    );
    expect(screen.getByText("Loading map…")).toBeInTheDocument();
  });
});
