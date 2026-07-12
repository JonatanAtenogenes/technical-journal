import type { RehypeExpressiveCodeOptions } from 'rehype-expressive-code';

export const expressiveCodeOptions: RehypeExpressiveCodeOptions = {
  themes: ['material-theme-darker', 'material-theme-lighter'],
  useDarkModeMediaQuery: false, // Matches your next-themes class strategy (class="dark" on <html>)
  themeCssSelector: (theme) =>
    theme.type === 'dark' ? '.dark' : ':root:not(.dark)',
  styleOverrides: {
    borderRadius: 'var(--radius)',
    borderColor: 'var(--border)',
    codeFontFamily: 'var(--font-mono)',
    codeFontSize: '0.875rem',
    frames: {
      shadowColor: 'transparent',
    },
  },
  defaultProps: {
    showLineNumbers: false,
  },
};