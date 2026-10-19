import { type ReactNode, useId } from 'react';

/**
 * Wraps a form control with a label and optional hint. Spacing between fields comes from the
 * parent's gap. Children is a render prop receiving the props to spread on the control:
 *   <Field label="Name">{(props) => <input {...props} />}</Field>
 */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  /** Short help shown under the label; linked to the control with aria-describedby. */
  hint?: ReactNode;
  children: (control: { id: string; 'aria-describedby'?: string }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <div className="mb-1.5">
        <label htmlFor={id} className="block font-medium text-muted text-xs">
          {label}
        </label>
        {hint && (
          <p id={hintId} className="mt-0.5 text-2xs text-muted leading-snug">
            {hint}
          </p>
        )}
      </div>
      {children({ id, 'aria-describedby': hint ? hintId : undefined })}
    </div>
  );
}
