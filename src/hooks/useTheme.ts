import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'neytron.theme';
const listeners = new Set<() => void>();

function readMode(): ThemeMode {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Mavzu holatini barcha komponentlar orasida sinxron saqlaydi. */
export function useTheme() {
  const mode = useSyncExternalStore(subscribe, readMode, () => 'system' as ThemeMode);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* saqlab bo‘lmasa ham joriy sessiyada ishlaydi */
    }
    listeners.forEach((l) => l());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.classList.toggle('dark', mode === 'dark' || (mode === 'system' && media.matches));
    };
    apply();
    if (mode === 'system') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
  }, [mode]);

  return { mode, setMode };
}
