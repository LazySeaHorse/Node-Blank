import { useState } from 'react';
import { create } from 'zustand';
import { Button } from './Button';
import { Field } from './Field';
import { type Hero, Modal } from './Modal';

/**
 * Promise-based replacements for window.prompt/confirm, rendered by <DialogHost />.
 *   const name = await askText({ title: 'Rename', initial: 'Old' });
 */

export interface NumberField {
  label: string;
  initial: number;
  min: number;
  max: number;
}

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
      kind: 'numbers';
      title: string;
      fields: NumberField[];
      hero?: Hero;
      resolve: (v: number[] | null) => void;
    }
  | {
      kind: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      destructive?: boolean;
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

/** Asks for whole numbers (each field has its own limits). Resolves to null when cancelled; blank or non-numeric input falls back to the field's initial value, and values are clamped to its range. */
export function askNumbers(options: { title: string; fields: NumberField[]; hero?: Hero }) {
  return new Promise<number[] | null>((resolve) =>
    useDialogStore.setState({ request: { kind: 'numbers', ...options, resolve } }),
  );
}

export function confirmAction(options: {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Styles the confirm button as a destructive action. */
  destructive?: boolean;
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
  const [numbers, setNumbers] = useState(
    request.kind === 'numbers' ? request.fields.map((f) => String(f.initial)) : [],
  );

  const finish = (result: string | boolean | null) => {
    useDialogStore.setState({ request: null });
    if (request.kind === 'numbers') {
      const { fields } = request;
      request.resolve(
        result === null
          ? null
          : fields.map((f, i) => {
              const n = Math.round(Number(numbers[i]));
              return Number.isFinite(n) && numbers[i]?.trim()
                ? Math.min(f.max, Math.max(f.min, n))
                : f.initial;
            }),
      );
    } else if (request.kind === 'text') request.resolve(typeof result === 'string' ? result : null);
    else request.resolve(result === true);
  };

  return (
    <Modal open onOpenChange={(open) => !open && finish(null)} title={request.title} hero={request.hero}>
      <form
        noValidate
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
                data-autofocus
                value={text}
                placeholder={request.placeholder}
                onChange={(e) => setText(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-fg outline-none focus:border-accent"
              />
            )}
          </Field>
        ) : request.kind === 'numbers' ? (
          <div className="flex gap-3">
            {request.fields.map((f, i) => (
              <Field key={f.label} label={f.label}>
                {(control) => (
                  <input
                    {...control}
                    data-autofocus={i === 0 ? true : undefined}
                    type="number"
                    inputMode="numeric"
                    min={f.min}
                    max={f.max}
                    value={numbers[i]}
                    onChange={(e) => setNumbers((all) => all.map((v, j) => (j === i ? e.target.value : v)))}
                    onFocus={(e) => e.target.select()}
                    className="w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-fg outline-none focus:border-accent"
                  />
                )}
              </Field>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted">{request.message}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => finish(null)}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={request.kind === 'confirm' && request.destructive ? 'danger' : 'primary'}
          >
            {request.kind === 'confirm' ? request.confirmLabel : 'OK'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
