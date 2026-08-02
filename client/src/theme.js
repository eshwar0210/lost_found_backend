import { createContext, useMemo, useState } from 'react';
import { createTheme } from '@mui/material/styles';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#4f46e5',
      light: '#818cf8',
      dark: '#4338ca',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    lost: {
      main: '#e11d48',
      light: '#fb7185',
      contrastText: '#ffffff',
    },
    found: {
      main: '#16a34a',
      light: '#4ade80',
      contrastText: '#ffffff',
    },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    background: {
      default: mode === 'light' ? '#f5f6fa' : '#0b1120',
      paper: mode === 'light' ? '#ffffff' : '#111a2e',
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#e2e8f0',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(226, 232, 240, 0.08)',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            mode === 'light'
              ? 'radial-gradient(ellipse at top left, rgba(79, 70, 229, 0.06), transparent 40%), radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.06), transparent 40%)'
              : 'radial-gradient(ellipse at top left, rgba(79, 70, 229, 0.12), transparent 40%), radial-gradient(ellipse at top right, rgba(14, 165, 233, 0.12), transparent 40%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border:
            mode === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(226, 232, 240, 0.08)',
        },
      },
    },
  },
});

export const useThemeMode = () => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', next);
          return next;
        });
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return { theme, colorMode };
};
