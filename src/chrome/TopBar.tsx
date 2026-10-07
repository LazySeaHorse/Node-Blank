import {
  ChevronDown,
  Download,
  ExternalLink,
  FilePlus2,
  FolderOpen,
  LayoutGrid,
  Library,
  Redo2,
  Undo2,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from 'zustand';
import { useAgentStore } from '@/agent';
import { useCanvasActions } from '@/canvas/useCanvasActions';
import { nodeKinds, nodeSpecs } from '@/nodes/catalog';
import { redo, undo, useCanvasStore } from '@/store/canvasStore';
import { organiseCanvas } from '@/store/groups';
import { useUiStore } from '@/store/uiStore';
import * as workspace from '@/store/workspace';
import { IconButton, WithTooltip } from '@/ui/Button';
import { askText } from '@/ui/dialogs';
import { Mascot } from '@/ui/Mascot';
import { Menu } from '@/ui/Menu';
import { AiButton } from './AiButton';
import { CanvasManager } from './CanvasManager';
import { Divider, Panel } from './Panel';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { useCurrentCanvas } from './useCurrentCanvas';

const REPO_URL = 'https://github.com/LazySeaHorse/Node-Blank';

function BrandMenu({ onOpenCanvases }: { onOpenCanvases: () => void }) {
  const working = useAgentStore((s) => s.locked);
  const hasSelection = useCanvasStore((s) => s.nodes.some((n) => n.selected));
  const { importJson, exportJson } = useCanvasActions();

  const create = async () => {
    const name = await askText({ title: 'New canvas', label: 'Name', initial: 'Untitled canvas' });
    if (name !== null) await workspace.newCanvas(name);
  };

  return (
    <Menu
      header={
        <div className="flex items-center gap-3 px-2.5 pt-2.5 pb-2">
          <Mascot mood={working ? 'working' : 'idle'} className="size-11 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm leading-tight font-semibold">Node-Blank</div>
            <span className="mt-1 inline-block rounded-full bg-accent/10 px-2 py-px text-[11px] font-medium text-accent">
              Saved in this browser
            </span>
          </div>
        </div>
      }
      items={[
        { separator: true },
        { heading: 'Canvas' },
        { label: 'New canvas', icon: FilePlus2, onSelect: () => void create() },
        { label: 'All canvases', icon: Library, onSelect: onOpenCanvases },
        { separator: true },
        { heading: 'Export' },
        {
          label: 'Selected nodes',
          icon: Download,
          disabled: !hasSelection,
          onSelect: () => void exportJson('selection'),
        },
        { label: 'This canvas', icon: Download, onSelect: () => void exportJson('canvas') },
        { label: 'All canvases', icon: Download, onSelect: () => void exportJson('all') },
        { separator: true },
        { label: 'Import…', icon: Upload, hint: '.json', onSelect: () => void importJson() },
        { separator: true },
        {
          label: 'Source on GitHub',
          icon: ExternalLink,
          onSelect: () => window.open(REPO_URL, '_blank', 'noopener'),
        },
      ]}
      trigger={
        <button
          type="button"
          aria-label="Node-Blank menu"
          className="group flex h-10 cursor-pointer items-center gap-2 rounded-xl pr-2 pl-1.5 text-sm font-semibold tracking-tight transition-colors hover:bg-accent/10 hover:text-accent data-[state=open]:bg-accent/10 data-[state=open]:text-accent"
        >
          <Mascot
            mood={working ? 'working' : 'idle'}
            className="size-8 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:-rotate-3"
          />
          <span className="hidden xl:inline">Node-Blank</span>
          <ChevronDown className="size-3.5 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      }
    />
  );
}

export function TopBar() {
  const [managerOpen, setManagerOpen] = useState(false);
  const canvas = useCurrentCanvas();
  const { tool, setTool } = useUiStore();
  const { insertImage, insertVideo } = useCanvasActions();
  const canUndo = useStore(useCanvasStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useCanvasStore.temporal, (s) => s.futureStates.length > 0);
  const hasNodes = useCanvasStore((s) => s.nodes.length > 0);

  const insertActions = { image: insertImage, video: insertVideo } as const;

  return (
    <Panel className="h-14 w-full gap-1 px-2.5">
      <BrandMenu onOpenCanvases={() => setManagerOpen(true)} />
      <Divider />
      <WithTooltip label="Switch canvas">
        <button
          type="button"
          onClick={() => setManagerOpen(true)}
          className="flex h-9 max-w-52 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-2.5 text-sm font-medium hover:bg-accent/10"
        >
          <FolderOpen className="size-[18px] shrink-0 text-muted" />
          <span className="truncate">{canvas?.name ?? '…'}</span>
        </button>
      </WithTooltip>
      <CanvasManager open={managerOpen} onOpenChange={setManagerOpen} />

      <div className="flex min-w-0 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
        <Divider />
        <IconButton icon={Undo2} label="Undo" hint="Ctrl+Z" disabled={!canUndo} onClick={undo} />
        <IconButton icon={Redo2} label="Redo" hint="Ctrl+Shift+Z" disabled={!canRedo} onClick={redo} />
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
        <IconButton
          icon={LayoutGrid}
          label="Organise"
          hint="group nearby nodes and space them evenly"
          disabled={!hasNodes}
          onClick={organiseCanvas}
        />
      </div>

      <div className="flex-1" />
      <SearchBar />
      <AiButton />
      <Divider />
      <ThemeToggle />
    </Panel>
  );
}
