import { describe, expect, it } from "vitest";
import { iconMarkup, isRawSvg, resolveMarkerIcon } from "./marker-icon";

const rawSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>';

describe("isRawSvg", () => {
  it.each([
    [rawSvg, true],
    [`\n  ${rawSvg}`, true],
    ["map-pin", false],
    ["", false],
    ["<div>not an svg</div>", false],
  ])("classifies %s", (icon, expected) => {
    expect(isRawSvg(icon)).toBe(expected);
  });
});

describe("iconMarkup", () => {
  it("serialises a registry icon to svg markup", () => {
    const markup = iconMarkup("map-pin", { size: 32, color: "#2e3a6e" });
    expect(markup).toContain("<svg");
    expect(markup).toContain('width="32"');
    expect(markup).toContain("#2e3a6e");
  });

  it("returns an empty string for a name that is not registered", () => {
    expect(iconMarkup("not-a-real-icon")).toBe("");
  });
});

describe("resolveMarkerIcon", () => {
  it("passes raw svg through untouched", () => {
    expect(resolveMarkerIcon(rawSvg).markup).toBe(rawSvg);
  });

  it("keeps raw svg out of the attribute and class name", () => {
    // The wrapper interpolates `id` into `data-icon="…"` and a CSS class. Raw
    // markup there terminates the attribute on its first quote.
    const { id } = resolveMarkerIcon(rawSvg);
    expect(id).toBe("raw-svg");
    expect(id).not.toContain('"');
    expect(id).not.toContain("<");
  });

  it("uses the name as the id for registry icons", () => {
    const { id, markup } = resolveMarkerIcon("truck-delivery");
    expect(id).toBe("truck-delivery");
    expect(markup).toContain("<svg");
  });

  it("applies size and colour to registry icons only", () => {
    expect(resolveMarkerIcon("map-pin", { size: 40 }).markup).toContain('width="40"');
    // Raw markup keeps whatever dimensions it shipped with.
    expect(resolveMarkerIcon(rawSvg, { size: 40 }).markup).not.toContain('width="40"');
  });
});
