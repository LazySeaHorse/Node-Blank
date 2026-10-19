import { beforeEach, describe, expect, it } from 'vitest';
import { detectShape } from '@/lib/markdownShape';
import { DEFAULT_VIEWPORT } from '@/model/types';
import { createNode } from '@/nodes/factory';
import { undo, useCanvasStore } from './canvasStore';
import { convertTextNode } from './convert';

const state = () => useCanvasStore.getState();
const TABLE = '| Item | Cost |\n| --- | --- |\n| Tea | 3 |';

function load(markdown: string, title?: string) {
  const node = createNode('text', { x: 40, y: 60 }, { markdown, title });
  state().load({ nodes: [node], viewport: DEFAULT_VIEWPORT });
  return node;
}
const shapeOf = (markdown: string) => {
  const shape = detectShape(markdown);
  if (!shape) throw new Error('no shape');
  return shape;
};

describe('convertTextNode', () => {
  beforeEach(() => state().load({ nodes: [], viewport: DEFAULT_VIEWPORT }));

  it('turns a table note into a sheet in place, keeping id, position and title', () => {
    const node = load(TABLE, 'Prices');
    convertTextNode(node.id, shapeOf(TABLE), 'sheet');
    const [sheet] = state().nodes;
    expect(sheet).toMatchObject({
      id: node.id,
      type: 'sheet',
      position: { x: 40, y: 60 },
      data: {
        title: 'Prices',
        cells: [
          ['Item', 'Cost'],
          ['Tea', '3'],
        ],
      },
    });
  });

  it('can make a table node, whose cells are math, instead', () => {
    const node = load(TABLE);
    convertTextNode(node.id, shapeOf(TABLE), 'table');
    expect(state().nodes[0]).toMatchObject({ type: 'table' });
    expect((state().nodes[0].data as { cells: string[][] }).cells[1]).toEqual(['\\text{Tea}', '3']);
  });

  it('turns a maths note into a math node', () => {
    const node = load('$$x^2 + 1$$');
    convertTextNode(node.id, shapeOf('$$x^2 + 1$$'), 'math');
    expect(state().nodes[0]).toMatchObject({ type: 'math', data: { latex: 'x^2 + 1' } });
  });

  it('is one undo step, and refuses a mismatched target', () => {
    const node = load(TABLE);
    convertTextNode(node.id, shapeOf(TABLE), 'math');
    expect(state().nodes[0].type).toBe('text');
    convertTextNode(node.id, shapeOf(TABLE), 'sheet');
    expect(state().nodes[0].type).toBe('sheet');
    undo();
    expect(state().nodes[0].type).toBe('text');
  });
});
