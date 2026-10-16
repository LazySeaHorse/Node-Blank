import { useReactFlow, useStoreApi } from '@xyflow/react';
import { type MouseEvent, useEffect, useRef, useState } from 'react';
import { wrapSelectionInSection } from '@/store/sections';
import type { MenuEntry } from '@/ui/Menu';
import { isTyping } from './keyboard';
import { menuFor } from './menus';
import { useCanvasActions } from './useCanvasActions';

/** A right-click that moves further than this (in px) is a pan, not a click. */
const CLICK_SLOP = 4;

/**
 * Right-click menus that coexist with right-drag panning. Browsers on Linux and macOS fire `contextmenu`
 * when the button goes down, before we know whether it is a drag. So real `contextmenu` events are
 * cancelled, and a click that ends close to where it started re-dispatches a synthetic one, which is
 * the only kind the menu opens for. Keyboard-invoked menus (no button press) pass through untouched.
 * Right-clicks inside editable content keep the native (or MathLive) menu.
 */
export function useContextMenu(readOnly: boolean) {
  const [items, setItems] = useState<MenuEntry[]>([]);
  const press = useRef<{ x: number; y: number; target: Element } | null>(null);
  const flow = useStoreApi();
  const replay = useRef<Element | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { addNode, insertImage, insertVideo } = useCanvasActions();

  useEffect(() => {
    if (readOnly) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      press.current =
        event.button === 2 && target?.closest?.('.react-flow') && !isTyping(target)
          ? { x: event.clientX, y: event.clientY, target }
          : null;
    };
    const onUp = (event: PointerEvent) => {
      const down = press.current;
      press.current = null;
      if (event.button !== 2 || !down?.target.isConnected) return;
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) >= CLICK_SLOP) return;
      // On the menu's own element: React Flow's pane cancels contextmenu events that reach it.
      replay.current = down.target;
      area.current?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          button: 2,
          clientX: down.x,
          clientY: down.y,
        }),
      );
    };
    const onCancel = () => {
      press.current = null;
    };
    // Browsers differ in when the real event arrives (button down, button up, or after our menu has opened
    // and sits under the pointer), so cancel it wherever it lands on the canvas, a menu or the backdrop
    // a modal menu leaves behind. Keyboard-invoked and in-field menus stay native.
    const onNative = (event: globalThis.MouseEvent) => {
      const target = event.target as Element | null;
      if (!event.isTrusted || (event.button !== 2 && !press.current) || !target || isTyping(target)) return;
      const onBackdrop = target === document.body || target === document.documentElement;
      if (onBackdrop || target.closest('.react-flow, [role="menu"]')) event.preventDefault();
    };
    window.addEventListener('contextmenu', onNative, true);
    window.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', onUp, true);
    window.addEventListener('pointercancel', onCancel, true);
    return () => {
      window.removeEventListener('contextmenu', onNative, true);
      window.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', onUp, true);
      window.removeEventListener('pointercancel', onCancel, true);
    };
  }, [readOnly]);

  /** On the canvas itself: fields keep their native (or MathLive) menu, so the menu never hears about them. */
  const keepNative = (event: MouseEvent) => {
    if (isTyping(event.target as Element)) event.stopPropagation();
  };

  /** On the menu's trigger: cancels real events, builds the menu for replayed ones. */
  const onContextMenu = (event: MouseEvent) => {
    if (readOnly) return;
    if (event.nativeEvent.isTrusted && (press.current || event.button === 2)) {
      event.preventDefault(); // the menu skips cancelled events
      return;
    }
    const target = replay.current ?? (event.target as Element);
    replay.current = null;
    const at = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setItems(
      menuFor(target, at, {
        addNode,
        insertImage,
        insertVideo,
        fitView: () => void fitView({ duration: 300 }),
        wrapInSection: () => {
          wrapSelectionInSection();
          flow.setState({ nodesSelectionActive: false }); // as Ctrl+G does
        },
      }),
    );
  };

  return { area, items, onContextMenu, keepNative };
}
