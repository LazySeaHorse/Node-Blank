import { useEffect } from 'react';
import { kindForNumberKey } from '@/nodes/catalog';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { useUiStore } from '@/store/uiStore';
import { isTextField, isTyping } from './keyboard';
import { useWrapInSection } from './useSections';

/** True inside a menu or dialog, where Delete and Backspace belong to that control. */
const isInOverlay = (target: EventTarget | null) =>
  target instanceof Element && target.closest('[role="menu"], [role="dialog"]') !== null;

export function useShortcuts(readOnly: boolean) {
  const wrapInSection = useWrapInSection();
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
      if (key === 'escape' && ui.linking) {
        ui.setLinking(false);
        return;
      }
      if (readOnly) return;

      // A field being edited keeps its own history. Anything else, even inside a node that swallows
      // other canvas keys (a spreadsheet with a cell selected), steps back through the canvas.
      if (mod && (key === 'z' || key === 'y')) {
        if (isTextField(event.target)) return;
        event.preventDefault();
        if (key === 'y' || event.shiftKey) redo();
        else undo();
        return;
      }
      if (isTyping(event.target)) return;

      if (!mod && !event.altKey && !event.shiftKey) {
        const kind = kindForNumberKey(event.key);
        if (kind) {
          event.preventDefault();
          ui.setTool(kind);
          return;
        }
      }

      if (!mod && !event.altKey && !event.shiftKey && key === 'l') {
        event.preventDefault();
        ui.setLinking(!ui.linking);
        return;
      }

      const canvas = useCanvasStore.getState();
      if ((key === 'delete' || key === 'backspace') && !mod && !isInOverlay(event.target)) {
        canvas.deleteSelected();
      } else if (mod && key === 'd') {
        event.preventDefault();
        canvas.duplicateSelected();
      } else if (mod && key === 'g') {
        event.preventDefault(); // the browser's find-next
        wrapInSection();
      } else if (mod && key === 'a') {
        event.preventDefault();
        canvas.setSelection(
          () => true,
          () => true,
        );
      } else if (key === 'escape') {
        canvas.setSelection(() => false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [readOnly, wrapInSection]);
}
