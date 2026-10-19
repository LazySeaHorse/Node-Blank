import { Mascot as SharedMascot } from '@/ui/Mascot';

/**
 * The Node-Blank octopus on the landing page: the app's own mascot, with pupils that follow the
 * pointer (an octopus on a canvas should watch your cursor).
 */
export function Mascot({
  className,
  working = false,
  track = true,
  title,
}: {
  className?: string;
  /** Faster sway/bob, the state the app puts the mascot in while an agent edits. */
  working?: boolean;
  track?: boolean;
  title?: string;
}) {
  return (
    <SharedMascot mood={working ? 'working' : 'idle'} className={className} track={track} title={title} />
  );
}
