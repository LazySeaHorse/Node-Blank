import type { XYPosition } from '@xyflow/react';
import { create } from 'zustand';
import { cloneNodes } from '@/nodes/factory';
import { createAutosave } from '@/persistence/autosave';
import * as repo from '@/persistence/canvasRepo';
import { type ExportFile, exportCanvases, exportNodes, type NamedCanvas } from '@/persistence/io';
import { getCanvasContent, useCanvasStore } from './canvasStore';

/**
 * Coordinates the open canvas with storage: opening, creating, deleting, autosaving, import/export.
 * UI talks to this module rather than to the repository and canvas store separately.
 */

const DEFAULT_NAME = 'Untitled canvas';

interface WorkspaceState {
  currentId: string | null;
}

export const useWorkspace = create<WorkspaceState>(() => ({ currentId: null }));

const currentId = () => useWorkspace.getState().currentId;

const autosave = createAutosave(async () => {
  const id = currentId();
  if (id) await repo.saveContent(id, getCanvasContent());
});

useCanvasStore.subscribe((state, prev) => {
  if (state.nodes !== prev.nodes || state.viewport !== prev.viewport || state.groups !== prev.groups)
    autosave.schedule();
});

if (typeof window !== 'undefined') {
  const flushNow = () => void autosave.flush();
  window.addEventListener('pagehide', flushNow);
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flushNow());
}

export const flushSave = () => autosave.flush();

export async function openCanvas(id: string): Promise<void> {
  if (id !== currentId()) await autosave.flush();
  const content = await repo.loadContent(id);
  useCanvasStore.getState().load(content);
  autosave.cancel();
  useWorkspace.setState({ currentId: id });
}

let initialized: Promise<void> | undefined;

/** Opens the most recently edited canvas, creating one on first run. Safe to call more than once. */
export function initWorkspace(): Promise<void> {
  initialized ??= (async () => {
    const [latest] = await repo.listCanvases();
    await openCanvas(latest?.id ?? (await repo.createCanvas(DEFAULT_NAME)));
  })();
  return initialized;
}

export async function newCanvas(name: string): Promise<void> {
  await openCanvas(await repo.createCanvas(name.trim() || DEFAULT_NAME));
}

export const renameCanvas = (id: string, name: string) => repo.renameCanvas(id, name.trim() || DEFAULT_NAME);

export async function removeCanvas(id: string): Promise<void> {
  if (id === currentId()) {
    autosave.cancel();
    useWorkspace.setState({ currentId: null });
  }
  await repo.deleteCanvas(id);
  if (currentId() === null) {
    const [next] = await repo.listCanvases();
    await openCanvas(next?.id ?? (await repo.createCanvas(DEFAULT_NAME)));
  }
}

async function namedCanvas(id: string): Promise<NamedCanvas> {
  const meta = await repo.getCanvas(id);
  return { name: meta?.name ?? DEFAULT_NAME, ...(await repo.loadContent(id)) };
}

export async function exportCurrentCanvas(): Promise<ExportFile> {
  await autosave.flush();
  const id = currentId();
  return exportCanvases(id ? [await namedCanvas(id)] : []);
}

export async function exportAllCanvases(): Promise<ExportFile> {
  await autosave.flush();
  const metas = await repo.listCanvases();
  return exportCanvases(await Promise.all(metas.map((m) => namedCanvas(m.id))));
}

export const exportSelectedNodes = (): ExportFile =>
  exportNodes(useCanvasStore.getState().nodes.filter((n) => n.selected));

/**
 * Imports a parsed file. Canvases are added (never overwritten) and the first one is opened;
 * loose nodes are pasted into the open canvas with their top-left corner at `at`.
 * Returns a short description of what was imported.
 */
export async function importFile(file: ExportFile, at: XYPosition): Promise<string> {
  if (file.kind === 'nodes') {
    if (file.nodes.length === 0) return 'No nodes in file';
    const minX = Math.min(...file.nodes.map((n) => n.position.x));
    const minY = Math.min(...file.nodes.map((n) => n.position.y));
    useCanvasStore.getState().addNodes(cloneNodes(file.nodes, { x: at.x - minX, y: at.y - minY }));
    return `Imported ${file.nodes.length} node${file.nodes.length === 1 ? '' : 's'}`;
  }
  if (file.canvases.length === 0) return 'No canvases in file';
  const ids: string[] = [];
  for (const { name, ...content } of file.canvases) ids.push(await repo.createCanvas(name, content));
  await openCanvas(ids[0]);
  return `Imported ${ids.length} canvas${ids.length === 1 ? '' : 'es'}`;
}
