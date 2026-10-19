/** File System Access API pieces that TypeScript's DOM library does not ship yet (Chromium only). */
export {};

declare global {
  type FileSystemPermissionMode = 'read' | 'readwrite';

  interface FileSystemHandle {
    queryPermission(descriptor?: { mode?: FileSystemPermissionMode }): Promise<PermissionState>;
    requestPermission(descriptor?: { mode?: FileSystemPermissionMode }): Promise<PermissionState>;
  }

  interface OpenFilePickerOptions {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }

  interface Window {
    showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
  }

  interface DataTransferItem {
    getAsFileSystemHandle?(): Promise<FileSystemHandle | null>;
  }
}
