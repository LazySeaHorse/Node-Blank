import { ReactFlowProvider } from '@xyflow/react';
import { Tooltip } from 'radix-ui';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Canvas } from '@/canvas/Canvas';
import { ReadOnlyContext } from '@/canvas/readOnly';
import { MobileBar } from '@/chrome/MobileBar';
import { SearchBar } from '@/chrome/SearchBar';
import { useThemeClass } from '@/chrome/ThemeToggle';
import { Toolbar } from '@/chrome/Toolbar';
import { ZoomControls } from '@/chrome/ZoomControls';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useUiStore } from '@/store/uiStore';
import { initWorkspace, useWorkspace } from '@/store/workspace';
import { DialogHost } from '@/ui/dialogs';

export function App() {
  const currentId = useWorkspace((s) => s.currentId);
  const theme = useUiStore((s) => s.theme);
  const readOnly = useIsMobile();
  useThemeClass();

  useEffect(() => {
    void initWorkspace();
  }, []);

  if (!currentId) return null;

  return (
    <ReadOnlyContext value={readOnly}>
      <Tooltip.Provider delayDuration={400}>
        <ReactFlowProvider>
          <main className="relative h-dvh w-screen">
            <Canvas key={currentId} readOnly={readOnly} />
            {readOnly ? (
              <div className="pointer-events-none absolute inset-x-3 top-3">
                <MobileBar />
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute top-3 left-3">
                  <SearchBar />
                </div>
                <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2">
                  <Toolbar />
                </div>
              </>
            )}
            <div className="pointer-events-none absolute right-3 bottom-3">
              <ZoomControls />
            </div>
          </main>
          <DialogHost />
          <Toaster theme={theme} position="bottom-center" richColors />
        </ReactFlowProvider>
      </Tooltip.Provider>
    </ReadOnlyContext>
  );
}
