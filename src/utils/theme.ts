// Utility to manage light/dark theme preference with localStorage persistence

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'absensi_theme_mode_v1';

/**
 * Reads stored theme preference from localStorage.
 * Defaults to 'light' unless previously saved as 'dark' or system prefers dark.
 */
export function getStoredTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Fallback: check system preference
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

/**
 * Saves theme preference into localStorage and applies/removes 'dark' class on <html>
 */
export function saveTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage write errors
  }
  applyThemeToDocument(theme);
}

/**
 * Applies or removes the 'dark' CSS class on document.documentElement
 */
export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}
