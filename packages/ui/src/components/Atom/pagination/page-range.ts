/** One slot in the rendered page list: a page number, or a gap marker. */
export type PageSlot = number | "ellipsis-left" | "ellipsis-right";

const range = (start: number, end: number): Array<number> =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);

/**
 * The page numbers to render, with gaps collapsed to an ellipsis.
 *
 * Always shows the first page, the last page, and `siblingCount` pages either
 * side of the current one. The slot count stays constant as `page` moves, so
 * the control does not resize while you click through it.
 *
 * The two markers are distinct so they can be used as React keys — a list can
 * contain both, and an index-based key would reorder on every page change.
 */
export function getPageRange(page: number, totalPages: number, siblingCount = 1): Array<PageSlot> {
  if (totalPages <= 0) {
    return [];
  }

  const current = Math.min(Math.max(page, 1), totalPages);
  // first + last + current + both siblings + both ellipses
  const maxSlots = siblingCount * 2 + 5;

  if (totalPages <= maxSlots) {
    return range(1, totalPages);
  }

  const left = Math.max(current - siblingCount, 1);
  const right = Math.min(current + siblingCount, totalPages);
  const needsLeftGap = left > 2;
  const needsRightGap = right < totalPages - 1;

  if (!needsLeftGap && needsRightGap) {
    return [...range(1, maxSlots - 2), "ellipsis-right", totalPages];
  }

  if (needsLeftGap && !needsRightGap) {
    return [1, "ellipsis-left", ...range(totalPages - (maxSlots - 3), totalPages)];
  }

  return [1, "ellipsis-left", ...range(left, right), "ellipsis-right", totalPages];
}
