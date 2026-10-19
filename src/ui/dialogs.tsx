import { useState } from 'react';
import { create } from 'zustand';
import { Button } from './Button';
import { Field } from './Field';
import { type Hero, Modal } from './Modal';

/**
 * Promise-based replacements for window.prompt/confirm, rendered by <DialogHost />.
 *   const name = await askText({ title: 'Rename', initial: 'Old' });
 */

type Request =
  | {
      kind: 'text';
      title: string;
      label?: string;
      initial: string;
      placeholder?: string;
      hero?: Hero;
      resolve: (v: string | null) => void;
    }
  | {
      kind: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      hero?: Hero;
      resolve: (v: boolean) => void;
    };

const useDialogStore = create<{ request: Request | null }>(() => ({ request: null }));

export function askText(options: {
  title: string;
  label?: string;
  initial?: string;
  placeholder?: string;
  hero?: Hero;
}) {
  return new Promise<string | null>((resolve) =>
    useDialogStore.setState({ request: { kind: 'text', initial: '', ...options, resolve } }),
  );
}

export function confirmAction(options: {
  title: string;
  message: string;
  confirmLabel?: string;
  hero?: Hero;
}) {
  return new Promise<boolean>((resolve) =>
    useDialogStore.setState({ request: { kind: 'confirm', confirmLabel: 'Confirm', ...options, resolve } }),
  );
}

export function DialogHost() {
  const request = useDialogStore((s) => s.request);
  if (!request) return null;
  // Keyed so each request gets fresh form state.
  return <DialogView key={`${request.kind}:${request.title}`} request={request} />;
}

function DialogView({ request }: { request: Request }) {
  const [text, setText] = useState(request.kind === 'text' ? request.initial : '');

  const finish = (result: string | boolean | null) => {
    useDialogStore.setState({ request: null });
    if (request.kind === 'text') request.resolve(typeof result === 'string' ? result : null);
    else request.resolve(result === true);
  };

  return (
    <Modal open onOpenChange={(open) => !open && finish(null)} title={request.title} hero={request.hero}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          finish(request.kind === 'text' ? text : true);
        }}
      >
        {request.kind === 'text' ? (
          <Field label={request.label ?? request.title}>
            {(control) => (
              <input
                {...control}
                // biome-ignore lint/a11y/noAutofocus: the dialog exists to collect this value.
                autoFocus
                value={text}
                placeholder={request.placeholder}
                onChange={(e) => setText(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-fg outline-none focus:border-accent"
              />
            )}
          </Field>
        ) : (
          <p className="text-sm leading-relaxed text-muted">{request.message}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => finish(null)}>
            Cancel
          </Button>
          <Button type="submit" variant={request.kind === 'confirm' ? 'danger' : 'primary'}>
            {request.kind === 'confirm' ? request.confirmLabel : 'OK'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
