export type SyncErrorKind =
  /** The key was refused. */
  | 'auth'
  /** A bin would exceed the plan's size limit. */
  | 'too-large'
  | 'not-found'
  | 'rate-limit'
  | 'network'
  /** The password does not open the cloud data. */
  | 'password'
  /** The cloud data is not something this version understands. */
  | 'format'
  | 'other';

/** Something went wrong talking to the cloud store; `kind` says what, `message` is fit to show. */
export class SyncError extends Error {
  constructor(
    readonly kind: SyncErrorKind,
    message: string,
  ) {
    super(message);
  }
}
