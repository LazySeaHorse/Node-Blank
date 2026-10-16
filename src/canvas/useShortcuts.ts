import { useStoreApi } from '@xyflow/react';
import { useEffect } from 'react';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { wrapSelectionInSection } from '@/store/sections';
import { useUiStore } from '@/store/uiStore';
import { isTyping } from './keyboard';

export function useShortcuts(readOnly: boolean) {
  const flow = useStoreApi();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      const ui = useUiStore.getState();

      if (mod && key === 'f') {
        event.preventDefault();
        ui.openSearch();
        return;
      }
      if (key === 'escape' && ui.searchOpen) {
        ui.closeSearch();
        return;
      }
      if (readOnly || isTyping(event.target)) return;

      const canvas = useCanvasStore.getState();
      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (mod && key === 'y') {
        event.preventDefault();
        redo();
      } else if (mod && key === 'd') {
        event.preventDefault();
        canvas.duplicateSelected();
      } else if (mod && key === 'g') {
        event.preventDefault(); // the browser's find-next
        wrapSelectionInSection();
        // Drop the leftover marquee box, which would otherwise sit on top of the new section.
        flow.setState({ nodesSelectionActive: false });
      } else if (mod && key === 'a') {
        event.preventDefault();
        canvas.onNodesChange(canvas.nodes.map((n) => ({ type: 'select', id: n.id, selected: true })));
      } else if (key === 'escape') {
        canvas.onNodesChange(canvas.nodes.map((n) => ({ type: 'select', id: n.id, selected: false })));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly, flow]);
}
