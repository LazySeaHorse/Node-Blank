import type { XYPosition } from '@xyflow/react';
import { useCanvasStore } from '@/store/canvasStore';
import { createNode } from '../factory';
import { saveHandle } from './fileStore';

/** Opens the system picker for one PDF. Resolves null if the user cancels. */
export async function pickPdfHandle(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
    });
    return handle ?? null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null;
    throw error;
  }
}

/** Links `handle` as a new pdf node at `position`. */
export async function addPdfNode(handle: FileSystemFileHandle, position: XYPosition): Promise<void> {
  const fileId = await saveHandle(handle);
  useCanvasStore
    .getState()
    .addNodes([createNode('pdf', position, { fileId, fileName: handle.name, pinned: [], direction: 'row' })]);
}
