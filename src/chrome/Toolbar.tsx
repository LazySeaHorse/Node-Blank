import { ChevronDown, Download, FolderOpen, LayoutGrid, Redo2, Undo2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';
import { useCanvasActions } from '@/canvas/useCanvasActions';
import { nodeKinds, nodeSpecs } from '@/nodes/catalog';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { organiseCanvas } from '@/store/groups';
import { useUiStore } from '@/store/uiStore';
import { IconButton, WithTooltip } from '@/ui/Button';
import { Menu } from '@/ui/Menu';
import { CanvasManager } from './CanvasManager';
import { Divider, Panel } from './Panel';
import { ThemeToggle } from './ThemeToggle';
import { useCurrentCanvas } from './useCurrentCanvas';

export function Toolbar() {
  const [managerOpen, setManagerOpen] = useState(false);
  const canvas = useCurrentCanvas();
  const { tool, setTool } = useUiStore();
  const { insertImage, insertVideo, importJson, exportJson } = useCanvasActions();
  const canUndo = useStore(useCanvasStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useCanvasStore.temporal, (s) => s.futureStates.length > 0);
  const hasSelection = useCanvasStore((s) => s.nodes.some((n) => n.selected));
  const hasNodes = useCanvasStore((s) => s.nodes.length > 0);

  const insertActions = { image: insertImage, video: insertVideo } as const;

  return (
    <Panel>
      <WithTooltip label="Canvases">
        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          className="flex h-9 max-w-52 cursor-pointer items-center gap-2 rounded-md px-2 text-sm font-medium text-fg hover:bg-surface-2"
        >
          <FolderOpen className="size-[18px] shrink-0 text-muted" />
          <span className="truncate">{canvas?.name ?? '…'}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </button>
      </WithTooltip>
      <CanvasManager open={managerOpen} onOpenChange={setManagerOpen} />

      <Divider />
      {nodeKinds.map((kind) => {
        const spec = nodeSpecs[kind];
        return spec.placement === 'place' ? (
          <IconButton
            key={kind}
            icon={spec.icon}
            label={spec.label}
            hint="double-click canvas to place"
            active={tool === kind}
            onClick={() => setTool(kind)}
          />
        ) : (
          <IconButton
            key={kind}
            icon={spec.icon}
            label={`Insert ${spec.label.toLowerCase()}`}
            onClick={() => void insertActions[kind as keyof typeof insertActions]()}
          />
        );
      })}

      <Divider />
      <IconButton icon={Undo2} label="Undo" hint="Ctrl+Z" disabled={!canUndo} onClick={undo} />
      <IconButton icon={Redo2} label="Redo" hint="Ctrl+Shift+Z" disabled={!canRedo} onClick={redo} />
      <IconButton
        icon={LayoutGrid}
        label="Organise"
        hint="group nearby nodes and space them evenly"
        disabled={!hasNodes}
        onClick={organiseCanvas}
      />

      <Divider />
      <Menu
        trigger={<IconButton icon={Download} label="Export" />}
        items={[
          { label: 'Selected nodes', onSelect: () => void exportJson('selection'), disabled: !hasSelection },
          { label: 'This canvas', onSelect: () => void exportJson('canvas') },
          { label: 'All canvases', onSelect: () => void exportJson('all') },
        ]}
      />
      <IconButton
        icon={Upload}
        label="Import"
        hint="nodes or canvases (.json)"
        onClick={() => void importJson()}
      />
      <ThemeToggle />
    </Panel>
  );
}
