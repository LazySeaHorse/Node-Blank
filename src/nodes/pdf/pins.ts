/**
 * Pinned pages are 1-based page numbers, sorted and unique. The cover (page 1) stands in for them while
 * nothing is pinned, and can be pinned like any other page to keep it alongside the rest.
 */

export const COVER_PAGE = 1;

/** Sorts, de-duplicates and drops anything that is not a real page number; clamps to `pageCount` when known. */
export function normalisePins(pins: readonly number[], pageCount?: number): number[] {
  const valid = pins.filter(
    (page) => Number.isInteger(page) && page >= COVER_PAGE && (pageCount === undefined || page <= pageCount),
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

/** Pins with `page` added, or removed if it is already pinned. */
export function togglePin(pins: readonly number[], page: number, pageCount?: number): number[] {
  const next = pins.includes(page) ? pins.filter((p) => p !== page) : [...pins, page];
  return normalisePins(next, pageCount);
}

/** The pages a node shows (and an agent may read): the pins, or the cover while nothing is pinned. */
export function shownPages(pins: readonly number[]): number[] {
  const pinned = normalisePins(pins);
  return pinned.length > 0 ? pinned : [COVER_PAGE];
}

/** How many pages of the document are not shown, or undefined while the page count is unknown. */
export function hiddenPageCount(pins: readonly number[], pageCount?: number): number | undefined {
  return pageCount === undefined ? undefined : Math.max(0, pageCount - shownPages(pins).length);
}
