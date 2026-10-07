import { useReactFlow, type XYPosition } from '@xyflow/react';
import { toast } from 'sonner';
import { downloadJson, fitWithin, imageSize, pickFile, readAsDataUrl, slugify } from '@/lib/files';
import type { NodeKind } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { toEmbedUrl } from '@/nodes/video/embedUrl';
import { ImportError, parseExportFile } from '@/persistence/io';
import { useCanvasStore } from '@/store/canvasStore';
import * as workspace from '@/store/workspace';
import { askText } from '@/ui/dialogs';

const MAX_IMAGE_SIZE = 480;

/** User-facing canvas actions that need the viewport (where to put things) and UI feedback. */
export function useCanvasActions() {
  const { screenToFlowPosition } = useReactFlow();

  /** Flow position that puts a box of `size` in the middle of the screen. */
  const centered = (size = { width: 0, height: 0 }): XYPosition => {
    const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    return { x: center.x - size.width / 2, y: center.y - size.height / 2 };
  };

  const addNode = (kind: NodeKind, position: XYPosition) =>
    useCanvasStore.getState().addNodes([createNode(kind, position)]);

  const insertImage = async () => {
    const file = await pickFile('image/*');
    if (!file) return;
    const src = await readAsDataUrl(file);
    const size = fitWithin(await imageSize(src), MAX_IMAGE_SIZE);
    useCanvasStore.getState().addNodes([createNode('image', centered(size), { src }, size)]);
  };

  const insertVideo = async () => {
    const url = await askText({
      title: 'Embed video',
      label: 'YouTube, Vimeo or embed URL',
      placeholder: 'https://',
    });
    if (!url) return;
    if (!toEmbedUrl(url)) {
      toast.error('That does not look like a video URL');
      return;
    }
    const node = createNode('video', { x: 0, y: 0 }, { url });
    useCanvasStore
      .getState()
      .addNodes([{ ...node, position: centered({ width: node.width ?? 0, height: node.height ?? 0 }) }]);
  };

  const importJson = async () => {
    const file = await pickFile('application/json,.json');
    if (!file) return;
    try {
      toast.success(await workspace.importFile(parseExportFile(await file.text()), centered()));
    } catch (error) {
      toast.error(error instanceof ImportError ? error.message : 'Import failed');
    }
  };

  const exportJson = async (scope: 'selection' | 'canvas' | 'all') => {
    const date = new Date().toISOString().slice(0, 10);
    if (scope === 'selection') {
      downloadJson(`nodes-${date}.json`, workspace.exportSelectedNodes());
    } else if (scope === 'canvas') {
      const file = await workspace.exportCurrentCanvas();
      const name = file.kind === 'canvases' ? (file.canvases[0]?.name ?? 'canvas') : 'canvas';
      downloadJson(`${slugify(name)}-${date}.json`, file);
    } else {
      downloadJson(`node-blank-${date}.json`, await workspace.exportAllCanvases());
    }
  };

  return { addNode, insertImage, insertVideo, importJson, exportJson };
}
