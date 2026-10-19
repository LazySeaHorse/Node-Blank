/**
 * Pinned pages are 1-based page numbers, sorted and unique. Page 1 (the cover) is always shown,
 * so it is never stored as a pin.
 */

export const COVER_PAGE = 1;

/** Sorts, de-duplicates and drops anything that is not a real page number; clamps to `pageCount` when known. */
export function normalisePins(pins: readonly number[], pageCount?: number): number[] {
  const valid = pins.filter(
    (page) => Number.isInteger(page) && page > COVER_PAGE && (pageCount === undefined || page <= pageCount),
  );
  return [...new Set(valid)].sort((a, b) => a - b);
}

/** Pins with `page` added, or removed if it is already pinned. The cover cannot be toggled. */
export function togglePin(pins: readonly number[], page: number, pageCount?: number): number[] {
  const next = pins.includes(page) ? pins.filter((p) => p !== page) : [...pins, page];
  return normalisePins(next, pageCount);
}

/** The pages a node shows (and an agent may read): the cover, then the pins. */
export const shownPages = (pins: readonly number[]): number[] => [COVER_PAGE, ...normalisePins(pins)];

/** How many pages of the document are not shown, or undefined while the page count is unknown. */
export function hiddenPageCount(pins: readonly number[], pageCount?: number): number | undefined {
  return pageCount === undefined ? undefined : Math.max(0, pageCount - shownPages(pins).length);
}
