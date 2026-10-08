import { AsciiField } from '@landing/components/AsciiField';
import { Mascot } from '@landing/components/Mascot';
import { AppMock } from '@landing/components/mock/AppMock';
import { AiLockBannerMock, AiPanelMock } from '@landing/components/mock/Chrome';
import { GraphNode, MathNode, MathPlusNode, SheetNode } from '@landing/components/mock/nodes';
import { APP_URL, REPO_URL } from '@landing/components/Nav';
import { Reveal } from '@landing/components/Reveal';
import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';

const BRIDGE_CMD = 'claude mcp add --transport http node-blank http://127.0.0.1:47801/mcp';
const ALTS = [
  'codex mcp add node-blank --url http://127.0.0.1:47801/mcp',
  'gemini mcp add --transport http node-blank http://127.0.0.1:47801/mcp',
];

const AI_NODES = [
  { x: 20, y: 136, node: <MathNode /> },
  { x: 20, y: 224, node: <GraphNode touched /> },
  { x: 380, y: 136, node: <MathPlusNode touched /> },
  { x: 376, y: 410, node: <SheetNode touched /> },
];

const AI_ROWS = [
  { text: 'Appended a function to g1 (Graph)', ago: 'just now', running: true },
  { text: 'Changed a := 2 to a := 7 in n3 (Math+)', ago: '2s ago' },
  { text: 'Updated cell C5 in n6 (Sheet)', ago: '5s ago' },
  { text: 'Read n1 (Math)', ago: '8s ago' },
  { text: 'Organised the canvas', ago: '12s ago' },
];

export function AiControl() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BRIDGE_CMD);
    } catch {
      /* clipboard can be blocked — the command is on screen either way */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section
      id="ai"
      className="relative isolate overflow-hidden border-t border-line bg-surface py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.55]">
        <AsciiField intensity={0.24} radius={245} cellW={11} cellH={19} />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 82% 12%, rgba(249,115,22,0.10), transparent 65%),' +
            'radial-gradient(55% 50% at 8% 88%, rgba(59,130,246,0.10), transparent 62%)',
        }}
      />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* copy + setup */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <div className="flex items-start gap-4">
                  <h2 className="font-display text-[clamp(2rem,3.9vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-fg">
                    Let your AI agent
                    <br />
                    <span className="text-muted">work on your canvas.</span>
                  </h2>
                  <Mascot working className="mt-1 size-14 shrink-0 sm:size-16" />
                </div>
                <p className="mt-5 max-w-[46ch] text-[15.5px] leading-[1.62] text-muted">
                  Run a small bridge on your computer. Claude Code, Codex and Gemini CLI can then read and
                  edit your open canvas. Browser agents connect with WebMCP. AI control is{' '}
                  <span className="font-semibold text-fg">off every time you load the page</span>. You turn it
                  on.
                </p>
              </Reveal>

              <Reveal delay={0.08}>
                <ol className="mt-8 flex flex-col gap-4">
                  <li className="flex gap-3.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line bg-canvas font-mono text-[11px] font-bold text-accent">
                      1
                    </span>
                    <p className="text-[14.5px] leading-[1.55] text-muted">
                      Download the bridge for your system from the latest{' '}
                      <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12.5px] text-fg">
                        bridge-v*
                      </code>{' '}
                      release.
                    </p>
                  </li>
                  <li className="flex gap-3.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line bg-canvas font-mono text-[11px] font-bold text-accent">
                      2
                    </span>
                    <p className="text-[14.5px] leading-[1.55] text-muted">
                      Add it to your agent. You do this one time.
                    </p>
                  </li>
                </ol>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-4 overflow-hidden rounded-lg border border-line bg-[#0f172a]">
                  <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                    <Terminal className="size-3.5 text-accent" />
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-[#94a3b8] uppercase">
                      terminal
                    </span>
                    <button
                      type="button"
                      onClick={copy}
                      className="ml-auto flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10.5px] text-[#e2e8f0] transition-colors hover:bg-white/12"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-[#4ade80]" /> copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" /> copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="px-3.5 py-3 font-mono text-[12px] break-all whitespace-pre-wrap leading-[1.7] text-[#e2e8f0]">
                    <span className="text-[#64748b]">$ </span>
                    {BRIDGE_CMD.slice(0, 15)}
                    <span className="text-accent">{BRIDGE_CMD.slice(15, 26)}</span>
                    {BRIDGE_CMD.slice(26)}
                  </pre>
                  <div className="border-t border-white/[0.07] px-3.5 py-2.5">
                    {ALTS.map((a) => (
                      <p key={a} className="font-mono text-[11px] leading-[1.7] text-[#64748b]">
                        <span className="text-[#475569]">$ </span>
                        {a}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {[
                    'Short names like n3 and g2 keep the agent focused.',
                    'Each agent edit is one undo step. Press Ctrl+Z to go back.',
                    'While the agent works, you can only look. Changed nodes flash.',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-muted">
                      <Check className="mt-[3px] size-3.5 shrink-0 text-tip" strokeWidth={2.6} />
                      {t}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>

          {/* the app, mid-edit */}
          <div className="lg:col-span-7">
            <Reveal delay={0.06}>
              <AppMock
                aiOn
                zoom={100}
                nodes={AI_NODES}
                overlay={
                  <>
                    <div className="absolute top-[4.75rem] left-1/2 -translate-x-1/2">
                      <AiLockBannerMock />
                    </div>
                    <div className="absolute top-[8.75rem] right-3">
                      <AiPanelMock rows={AI_ROWS} />
                    </div>
                  </>
                }
              />
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 pl-1 text-[12.5px] text-muted">
                <a
                  href={`${REPO_URL}/blob/main/bridge/README.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  bridge/README.md
                </a>
                <a
                  href={APP_URL}
                  className="font-semibold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  Open the app →
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
