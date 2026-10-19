import { beforeEach, describe, expect, it } from 'vitest';
import { type AppNode, DEFAULT_VIEWPORT } from '@/model/types';
import { db } from '@/persistence/db';
import { createNode } from '../factory';
import { cleanOrphanPdfFiles, orphanFileIds } from './fileStore';

const pdf = (fileId: string) => createNode('pdf', { x: 0, y: 0 }, { fileId, fileName: `${fileId}.pdf` });
const canvas = (...nodes: AppNode[]) => ({ nodes, viewport: DEFAULT_VIEWPORT });

describe('orphanFileIds', () => {
  it('returns stored ids no pdf node uses, across canvases', () => {
    const canvases = [canvas(pdf('a')), canvas(pdf('b'), createNode('text', { x: 0, y: 0 }))];
    expect(orphanFileIds(['a', 'b', 'c', 'd'], canvases)).toEqual(['c', 'd']);
  });

  it('treats every id as an orphan when there are no pdf nodes', () => {
    expect(orphanFileIds(['a'], [canvas()])).toEqual(['a']);
  });
});

describe('cleanOrphanPdfFiles', () => {
  beforeEach(async () => {
    await db.pdfFiles.clear();
    await db.contents.clear();
  });

  it('deletes only the rows no saved canvas references', async () => {
    const handle = {} as FileSystemFileHandle;
    await db.pdfFiles.bulkPut([
      { id: 'kept', handle },
      { id: 'gone', handle },
    ]);
    await db.contents.put({ id: 'c1', ...canvas(pdf('kept')) });
    await cleanOrphanPdfFiles();
    expect(await db.pdfFiles.toCollection().primaryKeys()).toEqual(['kept']);
  });
});
