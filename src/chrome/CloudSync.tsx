import { Cloud, CloudDownload, CloudUpload, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/time';
import { type BulkResult, check, inspect, pull, push, syncAll, useSync } from '@/sync/engine';
import { SyncError } from '@/sync/errors';
import { isConfigured, useSyncSettings } from '@/sync/settings';
import { pullable, pushable, type SyncStatus } from '@/sync/status';
import { useSyncStatus } from '@/sync/useSyncStatus';
import { Badge, type BadgeVariant } from '@/ui/Badge';
import { Button, IconButton } from '@/ui/Button';
import { confirmAction } from '@/ui/dialogs';

const LABELS: Record<SyncStatus, { text: string; variant: BadgeVariant }> = {
  synced: { text: 'In sync', variant: 'success' },
  'local-newer': { text: 'Changed here', variant: 'info' },
  'cloud-newer': { text: 'Changed in the cloud', variant: 'info' },
  conflict: { text: 'Changed in both places', variant: 'warning' },
  'local-only': { text: 'Not in the cloud', variant: 'muted' },
  'cloud-only': { text: 'Not on this device', variant: 'muted' },
};

/** Runs a sync action, saying what went wrong in a toast instead of throwing. Gives nothing back if it failed. */
async function attempt<T>(task: () => Promise<T>): Promise<T | undefined> {
  try {
    return await task();
  } catch (error) {
    if (!(error instanceof SyncError)) throw error;
    toast.error(error.message);
    return undefined;
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function reportBulk(result: BulkResult, verb: string) {
  if (result.failed.length === 0) toast.success(`${verb} ${plural(result.done, 'canvas')}`);
  else toast.error(`${verb} ${result.done}; ${result.failed.length} failed: ${result.failed[0].message}`);
}

const confirmOverwrite = (name: string, direction: 'push' | 'pull', status: SyncStatus) =>
  confirmAction({
    title: direction === 'push' ? 'Replace the cloud copy?' : 'Replace the copy on this device?',
    message:
      status === 'conflict'
        ? `"${name}" changed here and in the cloud since they last matched. ${direction === 'push' ? 'Pushing' : 'Pulling'} keeps only this side's version.`
        : direction === 'push'
          ? `"${name}" changed in the cloud since you last synced it. Pushing replaces that with this device's version.`
          : `"${name}" changed here since you last synced it. Pulling replaces it with the cloud's version.`,
    confirmLabel: direction === 'push' ? 'Replace cloud copy' : 'Replace local copy',
    destructive: true,
    hero: { mood: 'nervous', scene: 'delete' },
  });

/**
 * Checks the cloud afresh, then runs `direction` on the canvas unless that would overwrite changes
 * the user has not agreed to losing.
 */
async function syncOne(id: string, name: string, direction: 'push' | 'pull') {
  await attempt(async () => {
    const { statuses, cloudOnly } = await inspect();
    const status = statuses[id] ?? (cloudOnly.some((c) => c.id === id) ? 'cloud-only' : undefined);
    if (!status) return;
    const loses = direction === 'push' ? status === 'cloud-newer' : status === 'local-newer';
    if ((loses || status === 'conflict') && !(await confirmOverwrite(name, direction, status))) return;
    await (direction === 'push' ? push(id) : pull(id));
    toast.success(direction === 'push' ? `Pushed "${name}"` : `Pulled "${name}"`);
  });
}

/** The sync line under a canvas: where it stands, and buttons to check, pull and push it. */
export function CanvasSyncRow({ id, name, pullOnly }: { id: string; name: string; pullOnly: boolean }) {
  const status = useSyncStatus()?.statuses[id];
  const entry = useSync((s) => s.entries?.[id]);
  const busy = useSync((s) => s.busy === 'all' || s.busy.includes(id));
  const label = status && LABELS[status];

  return (
    <div className="flex basis-full items-center gap-2 border-border border-t pt-2 text-xs text-muted">
      {label ? (
        <Badge variant={label.variant} size="sm">
          {label.text}
        </Badge>
      ) : (
        <span>Not checked yet</span>
      )}
      {entry && <span className="truncate">Cloud copy {timeAgo(entry.updatedAt)}</span>}
      <div className="ml-auto flex shrink-0 items-center">
        <IconButton
          icon={RefreshCw}
          label="Check this canvas"
          size="sm"
          disabled={busy}
          className={cn(busy && '[&>svg]:animate-spin')}
          onClick={() => void attempt(check)}
        />
        <IconButton
          icon={CloudDownload}
          label="Pull from the cloud"
          size="sm"
          disabled={busy || status === 'local-only'}
          onClick={() => void syncOne(id, name, 'pull')}
        />
        {!pullOnly && (
          <IconButton
            icon={CloudUpload}
            label="Push to the cloud"
            size="sm"
            disabled={busy}
            onClick={() => void syncOne(id, name, 'push')}
          />
        )}
      </div>
    </div>
  );
}

/** Copies in the cloud that this device does not have yet. */
export function CloudOnlyList() {
  const cloudOnly = useSyncStatus()?.cloudOnly ?? [];
  const busy = useSync((s) => s.busy);
  if (cloudOnly.length === 0) return null;
  return (
    <section className="mt-4">
      <h3 className="mb-2 font-medium text-muted text-xs">In the cloud, not on this device</h3>
      <ul className="flex flex-col gap-2">
        {cloudOnly.map(({ id, entry }) => (
          <li
            key={id}
            className="flex items-center gap-3 rounded-2xl border border-border border-dashed p-2.5"
          >
            <Cloud className="size-4 shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{entry.name}</p>
              <p className="text-muted text-xs">Pushed {timeAgo(entry.updatedAt)}</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              disabled={busy === 'all' || busy.includes(id)}
              onClick={() => void syncOne(id, entry.name, 'pull')}
            >
              <CloudDownload className="size-4" /> Pull
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Cloud sync's controls for the whole list: settings, a check, and pulling or pushing everything safe to.
 * `pullOnly` drops pushing, for a device that cannot edit.
 */
export function SyncBar({ onOpenSettings, pullOnly }: { onOpenSettings: () => void; pullOnly: boolean }) {
  const settings = useSyncSettings();
  const configured = isConfigured(settings);
  const status = useSyncStatus();
  const checkedAt = useSync((s) => s.checkedAt);
  const busy = useSync((s) => s.busy === 'all');
  const working = useSync((s) => s.busy === 'all' || s.busy.length > 0);

  const toPush = status ? Object.values(status.statuses).filter(pushable).length : 0;
  const toPull = status
    ? Object.values(status.statuses).filter(pullable).length + status.cloudOnly.length
    : 0;
  const conflicts = status ? Object.values(status.statuses).filter((s) => s === 'conflict').length : 0;

  const bulk = async (direction: 'push' | 'pull') => {
    const result = await attempt(() => syncAll(direction));
    if (result) reportBulk(result, direction === 'push' ? 'Pushed' : 'Pulled');
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <IconButton icon={Settings} label="Cloud sync settings" onClick={onOpenSettings} />
      {configured ? (
        <>
          <Button
            size="sm"
            disabled={working}
            onClick={() => void attempt(check)}
            className="border border-border"
          >
            <RefreshCw className={cn('size-3.5', busy && 'animate-spin')} /> Check
          </Button>
          <span className="min-w-0 flex-1 truncate text-muted text-xs">
            {checkedAt === null
              ? 'Not checked yet'
              : conflicts > 0
                ? `Checked ${timeAgo(checkedAt)} · ${plural(conflicts, 'canvas')} changed in both places`
                : `Checked ${timeAgo(checkedAt)}`}
          </span>
          <Button size="sm" disabled={working || toPull === 0} onClick={() => void bulk('pull')}>
            <CloudDownload className="size-4" /> Pull all{toPull > 0 && ` (${toPull})`}
          </Button>
          {!pullOnly && (
            <Button size="sm" disabled={working || toPush === 0} onClick={() => void bulk('push')}>
              <CloudUpload className="size-4" /> Push all{toPush > 0 && ` (${toPush})`}
            </Button>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={onOpenSettings}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-muted text-xs hover:text-fg"
        >
          {settings.key && settings.manifestId
            ? 'Enter your password to sync with the cloud'
            : 'Set up cloud sync to keep canvases in your own JSONBin'}
        </button>
      )}
    </div>
  );
}

export function useSyncEnabled() {
  return isConfigured(useSyncSettings());
}
