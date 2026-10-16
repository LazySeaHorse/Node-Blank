import { toast } from 'sonner';

/** Writes text to the system clipboard and tells the user how it went. */
export async function copyText(text: string, what: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${what}`);
  } catch {
    toast.error('Could not copy to the clipboard');
  }
}
