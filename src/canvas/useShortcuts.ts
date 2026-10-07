import { useEffect } from 'react';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';

/** True when keys should go to a text field (inputs, CodeMirror, MathLive, spreadsheet) rather than the canvas. */
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable || target.matches('input, textarea, select') || target.closest('.nokey') !== null
  );
}

export function useShortcuts(readOnly: boolean) {
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
      } else if (mod && key === 'a') {
        event.preventDefault();
        canvas.onNodesChange(canvas.nodes.map((n) => ({ type: 'select', id: n.id, selected: true })));
      } else if (key === 'escape') {
        canvas.onNodesChange(canvas.nodes.map((n) => ({ type: 'select', id: n.id, selected: false })));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly]);
}
