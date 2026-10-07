import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/time';
import * as workspace from '@/store/workspace';
import { Button, IconButton } from '@/ui/Button';
import { askText, confirmAction } from '@/ui/dialogs';
import { Modal } from '@/ui/Modal';
import { useCanvasList } from './useCurrentCanvas';

interface CanvasManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** View-only mode: open canvases, but no create/rename/delete. */
  readOnly?: boolean;
}

export function CanvasManager({ open, onOpenChange, readOnly = false }: CanvasManagerProps) {
  const canvases = useCanvasList();
  const currentId = workspace.useWorkspace((s) => s.currentId);
  const close = () => onOpenChange(false);

  const create = async () => {
    const name = await askText({ title: 'New canvas', label: 'Name', initial: 'Untitled canvas' });
    if (name === null) return;
    await workspace.newCanvas(name);
    close();
  };

  const rename = async (id: string, current: string) => {
    const name = await askText({ title: 'Rename canvas', label: 'Name', initial: current });
    if (name !== null) await workspace.renameCanvas(id, name);
  };

  const remove = async (id: string, name: string) => {
    const confirmed = await confirmAction({
      title: 'Delete canvas?',
      message: `"${name}" will be permanently deleted.`,
      confirmLabel: 'Delete',
    });
    if (confirmed) await workspace.removeCanvas(id);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Canvases">
      {!readOnly && (
        <Button variant="primary" className="mb-4 w-full" onClick={create}>
          <Plus className="size-4" /> New canvas
        </Button>
      )}
      <ul className="flex flex-col gap-1">
        {canvases?.map((canvas) => (
          <li
            key={canvas.id}
            className={cn(
              'group flex items-center gap-2 rounded-lg border px-3 py-2',
              canvas.id === currentId ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-surface-2',
            )}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 cursor-pointer flex-col items-start text-left"
              onClick={async () => {
                await workspace.openCanvas(canvas.id);
                close();
              }}
            >
              <span className="w-full truncate font-medium">{canvas.name}</span>
              <span className="text-xs text-muted">{timeAgo(canvas.updatedAt)}</span>
            </button>
            {!readOnly && (
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <IconButton
                  icon={Pencil}
                  label="Rename"
                  size="sm"
                  onClick={() => rename(canvas.id, canvas.name)}
                />
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  size="sm"
                  className="hover:text-danger"
                  onClick={() => remove(canvas.id, canvas.name)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
