import { describe, expect, it } from "vitest";
import { getPageRange } from "./page-range";

describe("getPageRange", () => {
  it("returns nothing when there are no pages", () => {
    expect(getPageRange(1, 0)).toEqual([]);
  });

  it("lists every page when they all fit", () => {
    expect(getPageRange(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses only the right side near the start", () => {
    expect(getPageRange(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis-right", 10]);
  });

  it("collapses only the left side near the end", () => {
    expect(getPageRange(10, 10)).toEqual([1, "ellipsis-left", 6, 7, 8, 9, 10]);
  });

  it("collapses both sides in the middle", () => {
    expect(getPageRange(5, 10)).toEqual([1, "ellipsis-left", 4, 5, 6, "ellipsis-right", 10]);
  });

  it("keeps a constant width as the page moves, so the control does not resize", () => {
    const widths = new Set(Array.from({ length: 10 }, (_, i) => getPageRange(i + 1, 10).length));
    expect(widths).toEqual(new Set([7]));
  });

  it("widens with siblingCount", () => {
    expect(getPageRange(10, 20, 2)).toEqual([1, "ellipsis-left", 8, 9, 10, 11, 12, "ellipsis-right", 20]);
    expect(getPageRange(10, 20, 0)).toEqual([1, "ellipsis-left", 10, "ellipsis-right", 20]);
  });

  it("clamps a page outside the range", () => {
    expect(getPageRange(0, 10)).toEqual(getPageRange(1, 10));
    expect(getPageRange(99, 10)).toEqual(getPageRange(10, 10));
  });

  it("never emits duplicate slots, so they are safe as React keys", () => {
    for (let page = 1; page <= 20; page++) {
      const slots = getPageRange(page, 20);
      expect(new Set(slots).size).toBe(slots.length);
    }
  });
});
