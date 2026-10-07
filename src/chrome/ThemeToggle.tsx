import { Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { IconButton } from '@/ui/Button';

/** Applies the theme class to <html>. */
export function useThemeClass() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}

export function ThemeToggle() {
  const dark = useUiStore((s) => s.theme === 'dark');
  const toggle = useUiStore((s) => s.toggleTheme);
  return <IconButton icon={dark ? Sun : Moon} label={dark ? 'Light mode' : 'Dark mode'} onClick={toggle} />;
}
