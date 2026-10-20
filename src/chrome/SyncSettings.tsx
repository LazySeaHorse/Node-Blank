import { Cloud, Copy } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { copyText } from '@/lib/clipboard';
import { connect, reset } from '@/sync/engine';
import { SyncError } from '@/sync/errors';
import type { KeyKind } from '@/sync/jsonbin';
import { useSyncSettings } from '@/sync/settings';
import { Alert, AlertDescription } from '@/ui/Alert';
import { Button, IconButton } from '@/ui/Button';
import { confirmAction } from '@/ui/dialogs';
import { Field } from '@/ui/Field';
import { Modal } from '@/ui/Modal';

const inputClass =
  'w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-fg outline-none focus:border-accent';

interface SyncSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SyncSettings({ open, onOpenChange }: SyncSettingsProps) {
  // The form is only mounted while open, so each visit starts from what is saved.
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Cloud sync"
      icon={<Cloud />}
      description="Keep your canvases in your own JSONBin account, encrypted with a password only you know."
    >
      {open && <SettingsForm onDone={() => onOpenChange(false)} />}
    </Modal>
  );
}

function SettingsForm({ onDone }: { onDone: () => void }) {
  const saved = useSyncSettings();
  const [key, setKey] = useState(saved.key);
  const [keyKind, setKeyKind] = useState<KeyKind>(saved.keyKind);
  const [manifestId, setManifestId] = useState(saved.manifestId);
  const [password, setPassword] = useState(saved.password);
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const starting = manifestId.trim() === '';
  const mismatch = starting && password !== repeat;
  const ready = key.trim() !== '' && password !== '' && !mismatch;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const id = await connect({ key: key.trim(), keyKind, manifestId: manifestId.trim(), password });
      reset();
      saved.set({ key: key.trim(), keyKind, manifestId: id, password });
      toast.success(starting ? 'Started a new cloud save' : 'Connected to your cloud save');
      onDone();
    } catch (e) {
      setError(e instanceof SyncError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const forget = async () => {
    const confirmed = await confirmAction({
      title: 'Forget cloud sync on this device?',
      message:
        'The key, the sync ID and the password are removed from this device. Your canvases here and the cloud copy are left as they are.',
      confirmLabel: 'Forget',
      destructive: true,
      hero: { mood: 'nervous', scene: 'delete' },
    });
    if (!confirmed) return;
    saved.forget();
    reset();
    onDone();
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <Field
        label="JSONBin key"
        hint="From your JSONBin account. An access key limited to bins is safer than the master key: this one is kept on this device."
      >
        {(control) => (
          <div className="flex gap-2">
            <select
              aria-label="Key type"
              value={keyKind}
              onChange={(e) => setKeyKind(e.target.value as KeyKind)}
              className="rounded-md border border-border bg-canvas px-2 text-sm text-fg outline-none focus:border-accent"
            >
              <option value="master">Master key</option>
              <option value="access">Access key</option>
            </select>
            <input
              {...control}
              data-autofocus
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </Field>

      <Field
        label="Sync ID"
        hint={
          starting
            ? 'Leave empty to start a new cloud save. On your other devices, paste the ID this one shows afterwards.'
            : 'Identifies your cloud save. Paste the same ID on each device.'
        }
      >
        {(control) => (
          <div className="flex gap-2">
            <input
              {...control}
              spellCheck={false}
              placeholder="Empty: start a new cloud save"
              value={manifestId}
              onChange={(e) => setManifestId(e.target.value)}
              className={inputClass}
            />
            {saved.manifestId && (
              <IconButton
                icon={Copy}
                label="Copy sync ID"
                onClick={() => void copyText(saved.manifestId, 'the sync ID')}
              />
            )}
          </div>
        )}
      </Field>

      <Field
        label="Encryption password"
        hint="Stored on this device next to the key, so you are not asked again. It is never sent anywhere."
      >
        {(control) => (
          <input
            {...control}
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>

      {starting && (
        <Field label="Repeat password">
          {(control) => (
            <input
              {...control}
              type="password"
              autoComplete="off"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className={inputClass}
            />
          )}
        </Field>
      )}

      <Alert variant="warning" size="sm">
        <AlertDescription>
          If you forget the password, the cloud copy cannot be opened or recovered. Canvases on your devices
          are unaffected, and you can start a new cloud save from them. Images are not synced yet.
        </AlertDescription>
      </Alert>

      {mismatch && repeat !== '' && <p className="text-danger text-xs">The passwords do not match.</p>}
      {error && (
        <Alert variant="danger" size="sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-2">
        {saved.key ? (
          <Button variant="danger" onClick={() => void forget()}>
            Forget on this device
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!ready || busy}>
            {busy ? 'Connecting…' : starting ? 'Start cloud save' : 'Connect'}
          </Button>
        </div>
      </div>
    </form>
  );
}
