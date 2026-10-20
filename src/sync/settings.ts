import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KeyKind } from './jsonbin';

interface SyncSettings {
  /** The JSONBin key. Kept on this device, so it should be an access key limited to what sync needs. */
  key: string;
  keyKind: KeyKind;
  /** The bin holding the cloud save's index; any device that knows it, the key and the password can join. */
  manifestId: string;
  /** Only in memory: it is asked for again in every session, so it is never stored on the device. */
  password: string;
  set: (patch: Partial<Omit<SyncSettings, 'set' | 'forget'>>) => void;
  /** Forgets the key, the bin and the password on this device. The cloud save is left as it is. */
  forget: () => void;
}

const BLANK = { key: '', keyKind: 'master', manifestId: '', password: '' } as const;

export const useSyncSettings = create<SyncSettings>()(
  persist(
    (set) => ({
      ...BLANK,
      set: (patch) => set(patch),
      forget: () => set(BLANK),
    }),
    {
      name: 'node-blank-sync',
      partialize: ({ key, keyKind, manifestId }) => ({ key, keyKind, manifestId }),
    },
  ),
);

/** Whether there is enough to talk to the cloud: a key, the save's bin and the password. */
export const isConfigured = ({
  key,
  manifestId,
  password,
}: Pick<SyncSettings, 'key' | 'manifestId' | 'password'>) => Boolean(key && manifestId && password);
