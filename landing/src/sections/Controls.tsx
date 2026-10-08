import { Reveal } from '@landing/components/Reveal';

type Row = {
  id: string;
  action: string;
  keys?: string[];
  note: string;
};

const ROWS: Row[] = [
  { id: 'place', action: 'Place a node', note: 'Pick a tool. Double-click the canvas.' },
  { id: 'pan', action: 'Pan', note: 'Scroll, or drag with the middle or right mouse button.' },
  { id: 'zoom', action: 'Zoom', note: 'Pinch, or hold Ctrl/Cmd and scroll.' },
  { id: 'select', action: 'Select', note: 'Click, Shift+click, or drag a box on empty canvas.' },
  { id: 'undo', action: 'Undo / redo', keys: ['Ctrl', 'Z'], note: 'Add Shift to redo.' },
  {
    id: 'dup',
    action: 'Duplicate / delete',
    keys: ['Ctrl', 'D'],
    note: 'Press Delete to remove the selection.',
  },
  { id: 'all', action: 'Select all', keys: ['Ctrl', 'A'], note: 'Selects every node on the canvas.' },
  {
    id: 'newline',
    action: 'New line in a math node',
    keys: ['Shift', 'Enter'],
    note: 'Enter never submits by accident.',
  },
];

function MouseDiagram() {
  return (
    <svg viewBox="0 0 96 150" className="h-[168px] w-auto" role="img" aria-label="Mouse gesture diagram">
      <rect
        x="16"
        y="18"
        width="64"
        height="112"
        rx="32"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <path
        d="M48 18 A32 32 0 0 0 16 50 L16 62 L48 62 Z"
        fill="var(--accent)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <path
        d="M48 18 A32 32 0 0 1 80 50 L80 62 L48 62 Z"
        fill="var(--surface-2)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <rect x="44" y="34" width="8" height="20" rx="4" fill="var(--tip)" />
      <path
        d="M48 74 L48 104"
        stroke="var(--tip)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <path
        d="M42 98 L48 106 L54 98"
        fill="none"
        stroke="var(--tip)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M48 18 L48 6" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Controls() {
  return (
    <section id="controls" className="relative border-t border-line bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,3.9vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-fg">
                Built for a mouse
                <br />
                <span className="text-muted">and a keyboard.</span>
              </h2>
              <p className="mt-4 max-w-[38ch] text-[15.5px] leading-[1.6] text-muted">
                No hidden menus. No handles to hunt for. Every action has a clear input.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="panel mt-8 flex items-center gap-5 p-5">
                <MouseDiagram />
                <div>
                  <p className="font-display text-[15px] font-bold text-fg">Middle-drag pans</p>
                  <p className="mt-1.5 max-w-[24ch] text-[13px] leading-[1.5] text-muted">
                    There are no right-click menus, so panning is always one press away.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <Reveal delay={0.06}>
              <ul className="border-t border-line">
                {ROWS.map((row, i) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-[2.2rem_1fr] items-center gap-x-4 gap-y-1.5 border-b border-line px-1 py-4 sm:grid-cols-[2.2rem_minmax(0,1fr)_auto] sm:px-3"
                  >
                    <span className="font-mono text-[11px] text-muted/55 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[16.5px] font-bold tracking-[-0.01em] text-fg sm:text-[17.5px]">
                        {row.action}
                      </span>
                      <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-muted">{row.note}</span>
                    </span>
                    {row.keys && (
                      <span className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-1 sm:justify-self-end">
                        {row.keys.map((k) => (
                          <kbd key={k} className="kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 pl-1 text-[12.5px] text-muted">
                On Mac, use <span className="text-fg">Cmd</span> instead of{' '}
                <span className="text-fg">Ctrl</span>.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
