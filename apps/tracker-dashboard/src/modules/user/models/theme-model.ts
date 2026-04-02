import { atom, withLocalStorage } from '@reatom/core';

export const AppTheme = {
  Light: 'light',
  Dark: 'dark',
} as const;
export type AppTheme = (typeof AppTheme)[keyof typeof AppTheme];

const getSystemTheme = (): AppTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? AppTheme.Dark : AppTheme.Light;

export const themeAtom = atom<AppTheme>(getSystemTheme(), 'themeAtom').extend(withLocalStorage({ key: 'theme' }));

export const toggleTheme = () => {
  themeAtom.set((current) => (current === AppTheme.Light ? AppTheme.Dark : AppTheme.Light));
};

themeAtom.subscribe((theme) => {
  document.documentElement.classList.toggle('dark', theme === AppTheme.Dark);
});
