import { SquareTerminal } from 'lucide-react';
import { z } from 'zod';
import type { NodeSpec } from '../spec';

export const codeSpec: NodeSpec<'code'> = {
  kind: 'code',
  label: 'Script',
  description: 'Run JavaScript in a sandboxed worker',
  icon: SquareTerminal,
  placement: 'place',
  schema: z.object({ source: z.string() }),
  defaults: () => ({
    source: "console.log('Hello from the sandbox!');\n\n[1, 2, 3, 4].reduce((a, b) => a + b, 0);\n",
  }),
  size: { width: 420, height: 340 },
  searchText: (d) => d.source,
};
