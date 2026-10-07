import { useReactFlow } from '@xyflow/react';
import { useEffect, useMemo } from 'react';
import type { AppNode } from '@/model/types';
import { searchTextOf } from '@/nodes/factory';
import { useUiStore } from '@/store/uiStore';

const FIT_DELAY_MS = 250;

/** Ids of nodes matching the search query, or null when not searching. */
export function useSearchMatches(nodes: AppNode[]): Set<string> | null {
  const query = useUiStore((s) => s.searchQuery.trim().toLowerCase());
  return useMemo(
    () =>
      query
        ? new Set(nodes.filter((n) => searchTextOf(n).toLowerCase().includes(query)).map((n) => n.id))
        : null,
    [nodes, query],
  );
}

/** Dims non-matching nodes and pans the camera to the matches. */
export function useSearchHighlight(nodes: AppNode[]): AppNode[] {
  const matches = useSearchMatches(nodes);
  const { fitView } = useReactFlow();
  const matchKey = matches ? [...matches].join() : '';

  useEffect(() => {
    if (!matchKey) return;
    const timer = setTimeout(
      () =>
        fitView({
          nodes: matchKey.split(',').map((id) => ({ id })),
          duration: 500,
          padding: 0.3,
          maxZoom: 1.5,
        }),
      FIT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [matchKey, fitView]);

  return useMemo(
    () => (matches ? nodes.map((n) => (matches.has(n.id) ? n : { ...n, className: 'search-miss' })) : nodes),
    [nodes, matches],
  );
}
