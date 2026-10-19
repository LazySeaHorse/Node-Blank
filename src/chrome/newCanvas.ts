import { askText } from '@/ui/dialogs';

/** Ask for a new canvas name. Resolves to null when cancelled. */
export function promptNewCanvas(): Promise<string | null> {
  return askText({
    title: 'New canvas',
    label: 'Name',
    initial: 'Untitled canvas',
    hero: { mood: 'map', scene: 'canvas' },
  });
}
