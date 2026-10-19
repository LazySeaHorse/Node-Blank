const isPdfType = (type: string) => type === 'application/pdf';
const isPdfName = (name: string) => name.toLowerCase().endsWith('.pdf');

/** True while a drag carries at least one PDF file (the name is hidden until the drop, so only the type is known). */
export function dragHasPdf(data: Pick<DataTransfer, 'items'>): boolean {
  return Array.from(data.items).some((item) => item.kind === 'file' && isPdfType(item.type));
}

/**
 * The links to the PDF files dropped. Must be called during the drop event: browsers empty the items
 * straight after it. Needs `getAsFileSystemHandle` (Chromium); other browsers get none.
 */
export async function pdfHandlesFromDrop(data: Pick<DataTransfer, 'items'>): Promise<FileSystemFileHandle[]> {
  const pending = Array.from(data.items)
    .filter((item) => item.kind === 'file' && item.getAsFileSystemHandle)
    .map((item) => item.getAsFileSystemHandle?.());
  const handles = await Promise.all(pending);
  return handles.filter(
    (handle): handle is FileSystemFileHandle =>
      handle?.kind === 'file' &&
      (isPdfName(handle.name) || isPdfType((handle as { type?: string }).type ?? '')),
  );
}
