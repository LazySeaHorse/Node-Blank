import { CircleAlert, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Toaster, toast } from 'sonner';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useUiStore } from '@/store/uiStore';
import { Mascot } from '@/ui/Mascot';

const classNames = {
  toast:
    'flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-fg shadow-xl',
  title: 'font-medium',
  description: 'text-muted text-xs',
  icon: 'shrink-0',
};

const icons = {
  success: <CircleCheck className="size-4 text-success" />,
  error: <CircleAlert className="size-4 text-danger" />,
};

/** App-wide toast host: surface-coloured, below the top bar on desktop and at the bottom on mobile. */
export function AppToaster() {
  const theme = useUiStore((s) => s.theme);
  const mobile = useIsMobile();
  return (
    <Toaster
      theme={theme}
      position={mobile ? 'bottom-center' : 'top-center'}
      offset={mobile ? undefined : { top: '4.75rem' }}
      icons={icons}
      toastOptions={{ unstyled: true, classNames }}
    />
  );
}

/** A toast for a moment worth a small flourish: the mascot cheers. */
export function celebrate(message: ReactNode) {
  return toast.custom(() => (
    <div className={classNames.toast}>
      <Mascot mood="cheer" animated className="-my-2 -ml-1 size-9 shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  ));
}
