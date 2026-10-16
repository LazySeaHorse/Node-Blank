import { describe, expect, it } from 'vitest';
import { createNode } from '@/nodes/factory';
import { exportCanvases, exportNodes, ImportError, parseExportFile } from './io';

const sampleNodes = () => [
  { ...createNode('text', { x: 0, y: 0 }), selected: true },
  createNode('graph', { x: 100, y: 50 }),
  createNode('sheet', { x: -20, y: 10 }),
];

describe('io', () => {
  it('round-trips canvases', () => {
    const file = exportCanvases([{ name: 'A', nodes: sampleNodes(), viewport: { x: 1, y: 2, zoom: 0.5 } }]);
    const parsed = parseExportFile(JSON.stringify(file));
    expect(parsed).toEqual(file);
    expect(parsed.kind === 'canvases' && parsed.canvases[0].nodes[0]).not.toHaveProperty('selected');
  });

  it('round-trips canvas groups', () => {
    const nodes = sampleNodes();
    const groups = [{ id: 'g', nodeIds: nodes.map((n) => n.id) }];
    const file = exportCanvases([{ name: 'A', nodes, viewport: { x: 0, y: 0, zoom: 1 }, groups }]);
    const parsed = parseExportFile(JSON.stringify(file));
    expect(parsed.kind === 'canvases' && parsed.canvases[0].groups).toEqual(groups);
  });

  it('round-trips nodes', () => {
    const file = exportNodes(sampleNodes());
    expect(parseExportFile(JSON.stringify(file))).toEqual(file);
  });

  it('rejects malformed JSON', () => {
    expect(() => parseExportFile('{nope')).toThrow(ImportError);
  });

  it('rejects files from other apps or versions', () => {
    expect(() => parseExportFile(JSON.stringify({ version: 4, fields: [] }))).toThrow(
      /Not a Node-Blank export/,
    );
    expect(() => parseExportFile(JSON.stringify({ ...exportNodes([]), version: 2 }))).toThrow(ImportError);
  });

  it('rejects nodes whose data does not match their kind', () => {
    const file = exportNodes([createNode('math', { x: 0, y: 0 })]);
    const broken = { ...file, nodes: [{ ...file.nodes[0], data: { markdown: 'x' } }] };
    expect(() => parseExportFile(JSON.stringify(broken))).toThrow(ImportError);
  });

  it('rejects unknown node kinds', () => {
    const file = exportNodes([createNode('math', { x: 0, y: 0 })]);
    const broken = { ...file, nodes: [{ ...file.nodes[0], type: 'pdf' }] };
    expect(() => parseExportFile(JSON.stringify(broken))).toThrow(ImportError);
  });
});
