import { ReactFlowProvider } from '@xyflow/react';
import { Tooltip } from 'radix-ui';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAgentStore } from '@/agent';
import { Canvas } from '@/canvas/Canvas';
import { ReadOnlyContext } from '@/canvas/readOnly';
import { AgentConnector } from '@/chrome/AgentConnector';
import { AiLockBanner, AiPanel } from '@/chrome/AiPanel';
import { MobileBar } from '@/chrome/MobileBar';
import { SearchBar } from '@/chrome/SearchBar';
import { useThemeClass } from '@/chrome/ThemeToggle';
import { Toolbar } from '@/chrome/Toolbar';
import { ZoomControls } from '@/chrome/ZoomControls';
import { cn } from '@/lib/cn';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useUiStore } from '@/store/uiStore';
import { initWorkspace, useWorkspace } from '@/store/workspace';
import { DialogHost } from '@/ui/dialogs';

export function App() {
  const currentId = useWorkspace((s) => s.currentId);
  const theme = useUiStore((s) => s.theme);
  const mobile = useIsMobile();
  const locked = useAgentStore((s) => s.locked);
  const aiPanelOpen = useUiStore((s) => s.aiPanelOpen);
  // While an agent is editing, the user gets the same view-only canvas as on mobile.
  const readOnly = mobile || locked;
  useThemeClass();

  useEffect(() => {
    void initWorkspace();
  }, []);

  // Leave any field the user was typing in, so the lock also covers in-progress edits.
  useEffect(() => {
    if (locked && document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [locked]);

  if (!currentId) return null;

  return (
    <ReadOnlyContext value={readOnly}>
      <Tooltip.Provider delayDuration={400}>
        <ReactFlowProvider>
          <main className="relative h-dvh w-screen">
            <Canvas key={currentId} readOnly={readOnly} />
            {mobile ? (
              <div className="pointer-events-none absolute inset-x-3 top-3">
                <MobileBar />
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute top-3 left-3">
                  <SearchBar />
                </div>
                <div
                  className={cn(
                    'pointer-events-none absolute top-3 left-1/2 -translate-x-1/2',
                    locked && 'opacity-60',
                  )}
                  inert={locked}
                >
                  <Toolbar />
                </div>
                <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2">
                  <AiLockBanner />
                </div>
                {aiPanelOpen && (
                  <div className="pointer-events-none absolute top-16 right-3 bottom-16 flex flex-col">
                    <AiPanel />
                  </div>
                )}
              </>
            )}
            <div className="pointer-events-none absolute right-3 bottom-3">
              <ZoomControls />
            </div>
          </main>
          <AgentConnector />
          <DialogHost />
          <Toaster theme={theme} position="bottom-center" richColors />
        </ReactFlowProvider>
      </Tooltip.Provider>
    </ReadOnlyContext>
  );
}
