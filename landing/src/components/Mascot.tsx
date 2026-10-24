import { Mascot as SharedMascot } from '@/ui/Mascot';

/**
 * The Unlined octopus on the landing page: the app's own mascot, with pupils that follow the
 * pointer (an octopus on a canvas should watch your cursor). Decorative: the page names itself elsewhere.
 */
export function Mascot({
  className,
  working = false,
  track = true,
}: {
  className?: string;
  /** Faster sway/bob, the state the app puts the mascot in while an agent edits. */
  working?: boolean;
  track?: boolean;
}) {
  return <SharedMascot mood={working ? 'working' : 'idle'} className={className} track={track} />;
}
