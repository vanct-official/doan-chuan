import React, { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline, alpha } from '@mui/material';

const ThemeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

export const useColorMode = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'light';
  });

  React.useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'light' ? '#f8fafc' : '#090d16');
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme_mode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#0284c7', // Ocean Azure
            light: '#38bdf8',
            dark: '#0369a1',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f97316', // Sunset Coral / Adventure Orange
            light: '#fb923c',
            dark: '#ea580c',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          info: {
            main: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#090d16',
            paper: mode === 'light' ? '#ffffff' : '#111827',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#f1f5f9',
            secondary: mode === 'light' ? '#475569' : '#94a3b8',
          },
          divider: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.5)',
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h1: { fontWeight: 800, letterSpacing: '-0.03em' },
          h2: { fontWeight: 800, letterSpacing: '-0.025em' },
          h3: { fontWeight: 700, letterSpacing: '-0.02em' },
          h4: { fontWeight: 700, letterSpacing: '-0.015em' },
          h5: { fontWeight: 700, letterSpacing: '-0.01em' },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          subtitle2: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: '9px 20px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light'
                    ? '0 8px 20px -4px rgba(2, 132, 199, 0.25)'
                    : '0 8px 20px -4px rgba(2, 132, 199, 0.35)',
                },
              },
              containedPrimary: {
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                },
              },
              containedSecondary: {
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  boxShadow: '0 8px 20px -4px rgba(249, 115, 22, 0.3)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                backgroundImage: 'none',
                boxShadow: mode === 'light' 
                  ? '0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)'
                  : '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                border: `1px solid ${mode === 'light' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(51, 65, 85, 0.4)'}`,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 18,
                backgroundImage: 'none',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: '0.8125rem',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 22,
                backdropFilter: 'blur(20px)',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&.Mui-focused': {
                  boxShadow: '0 0 0 3px rgba(2, 132, 199, 0.15)',
                },
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(51, 65, 85, 0.4)',
                padding: '14px 16px',
              },
              head: {
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: mode === 'light' ? '#64748b' : '#94a3b8',
                backgroundColor: mode === 'light' ? '#f1f5f9' : '#1e293b',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
