import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}

/** Phones and touch-first tablets get the read-only viewer. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px), (pointer: coarse)');
