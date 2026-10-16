import { useReactFlow } from '@xyflow/react';
import { useEffect, useEffectEvent, useState } from 'react';
import type { MenuEntry } from '@/ui/Menu';
import { isTyping } from './keyboard';
import { menuFor } from './menus';
import { useCanvasActions } from './useCanvasActions';
import { useWrapInSection } from './useSections';

/** A right-click that moves further than this (in px) is a pan, not a click. */
const CLICK_SLOP = 4;

type Point = { x: number; y: number };

/** Right-clicks that land on the canvas, outside any field (fields keep their native or MathLive menu). */
const onCanvas = (target: Element | null): target is Element =>
  !!target?.closest?.('.react-flow') && !isTyping(target);

/**
 * Right-click menus that coexist with right-drag panning. Browsers on Linux and macOS fire `contextmenu`
 * when the button goes down, before we know whether it is a drag, so the menu opens on button up instead,
 * and only when the pointer stayed put. The browser's own menu is cancelled over the canvas.
 */
export function useContextMenu(readOnly: boolean) {
  const [menu, setMenu] = useState<{ at: Point; items: MenuEntry[] } | null>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { addNode, insertImage, insertVideo } = useCanvasActions();
  const wrapInSection = useWrapInSection();

  const open = useEffectEvent((target: Element, at: Point) =>
    setMenu({
      at,
      items: menuFor(target, screenToFlowPosition(at), {
        addNode,
        insertImage,
        insertVideo,
        fitView: () => void fitView({ duration: 300 }),
        wrapInSection,
      }),
    }),
  );

  useEffect(() => {
    if (readOnly) return;
    let press: (Point & { target: Element }) | null = null;

    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      press = event.button === 2 && onCanvas(target) ? { x: event.clientX, y: event.clientY, target } : null;
    };
    const onUp = (event: PointerEvent) => {
      const down = press;
      press = null;
      if (event.button !== 2 || !down?.target.isConnected) return;
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) >= CLICK_SLOP) return;
      open(down.target, down);
    };
    const onCancel = () => {
      press = null;
    };
    const onNative = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!event.isTrusted || !target || isTyping(target)) return;
      if (event.button !== 2 && !press) {
        // The menu key or Shift+F10: there is no drag to wait for, so open ours straight away.
        if (!onCanvas(target)) return;
        event.preventDefault();
        open(target, { x: event.clientX, y: event.clientY });
        return;
      }
      // Browsers differ in when this arrives (button down, button up, or after our menu has opened and
      // sits under the pointer), so cancel it on the canvas, a menu or the backdrop a modal menu leaves.
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

  return { menu, close: () => setMenu(null) };
}
