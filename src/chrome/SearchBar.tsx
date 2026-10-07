import { Search, X } from 'lucide-react';
import { useSearchMatches } from '@/canvas/useSearch';
import { useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { IconButton } from '@/ui/Button';
import { Panel } from './Panel';

export function SearchBar() {
  const { searchOpen, searchQuery, openSearch, closeSearch, setSearchQuery } = useUiStore();
  const matches = useSearchMatches(useCanvasStore((s) => s.nodes));

  if (!searchOpen) {
    return (
      <Panel>
        <IconButton icon={Search} label="Search" hint="Ctrl+F" onClick={openSearch} />
      </Panel>
    );
  }

  return (
    <Panel className="pl-3">
      <Search className="size-4 text-muted" />
      <input
        // biome-ignore lint/a11y/noAutofocus: opening search is an explicit user action.
        autoFocus
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
        placeholder="Search nodes…"
        aria-label="Search nodes"
        className="w-56 bg-transparent px-1 text-sm text-fg outline-none placeholder:text-muted"
      />
      {matches && (
        <span className="text-xs whitespace-nowrap text-muted tabular-nums">{matches.size} found</span>
      )}
      <IconButton icon={X} label="Close search" hint="Esc" size="sm" onClick={closeSearch} />
    </Panel>
  );
}
