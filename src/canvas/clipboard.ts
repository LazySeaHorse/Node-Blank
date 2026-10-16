import { useReactFlow } from '@xyflow/react';
import { useEffect, useRef } from 'react';
import { nodeRect } from '@/lib/nodeRect';
import { expandWithContents } from '@/lib/sections';
import type { AppNode } from '@/model/types';
import { exportNodes, ImportError, parseExportFile } from '@/persistence/io';
import { useCanvasStore } from '@/store/canvasStore';
import { pasteNodes } from '@/store/workspace';
import { isTyping } from './keyboard';

const MIME = 'application/x-node-blank+json';
/** Repeated pastes in the same spot step down-right by this much so copies do not hide each other. */
const PASTE_STEP = 30;

/** The selected nodes (a selected section brings what is inside it) as clipboard text, or null if none. */
export function serializeSelection(nodes: AppNode[]): string | null {
  const ids = expandWithContents(
    new Set(nodes.filter((n) => n.selected).map((n) => n.id)),
    new Set(nodes.filter((n) => n.type === 'section').map((n) => n.id)),
    nodes.map(nodeRect),
  );
  const picked = nodes.filter((n) => ids.has(n.id));
  return picked.length > 0 ? JSON.stringify(exportNodes(picked)) : null;
}

/** Nodes in clipboard text, or null when it is anything else (plain text, a canvases export, garbage). */
export function parseClipboard(text: string): AppNode[] | null {
  try {
    const file = parseExportFile(text);
    return file.kind === 'nodes' && file.nodes.length > 0 ? file.nodes : null;
  } catch (error) {
    if (error instanceof ImportError) return null;
    throw error;
  }
}

/**
 * Ctrl+C / Ctrl+V for whole nodes, through the system clipboard so it works across canvases and tabs.
 * Only acts when a node itself is selected; inside a field, native copy and paste are left alone.
 */
export function useClipboard(readOnly: boolean) {
  const { screenToFlowPosition } = useReactFlow();
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastPaste = useRef<{ x: number; y: number; count: number } | null>(null);

  useEffect(() => {
    if (readOnly) return;
    const onPointerMove = (event: PointerEvent) => {
      const over = (event.target as Element | null)?.closest?.('.react-flow');
      pointer.current = over ? { x: event.clientX, y: event.clientY } : null;
    };
    const ownsEvent = () => !isTyping(document.activeElement) && window.getSelection()?.isCollapsed !== false;

    const onCopy = (event: ClipboardEvent) => {
      if (!ownsEvent() || !event.clipboardData) return;
      const payload = serializeSelection(useCanvasStore.getState().nodes);
      if (!payload) return;
      event.clipboardData.setData(MIME, payload);
      event.clipboardData.setData('text/plain', payload);
      event.preventDefault();
    };

    const onPaste = (event: ClipboardEvent) => {
      if (!ownsEvent() || !event.clipboardData) return;
      const text = event.clipboardData.getData(MIME) || event.clipboardData.getData('text/plain');
      const nodes = text ? parseClipboard(text) : null;
      if (!nodes) return; // not ours: let images and text through untouched
      event.preventDefault();

      const screen = pointer.current ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const base = screenToFlowPosition(screen);
      const again = lastPaste.current;
      const count =
        again && Math.abs(again.x - base.x) < 1 && Math.abs(again.y - base.y) < 1 ? again.count + 1 : 0;
      lastPaste.current = { ...base, count };
      pasteNodes(nodes, { x: base.x + count * PASTE_STEP, y: base.y + count * PASTE_STEP });
    };

    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
    };
  }, [readOnly, screenToFlowPosition]);
}
