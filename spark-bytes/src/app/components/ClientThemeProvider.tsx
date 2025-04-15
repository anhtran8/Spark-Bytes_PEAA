// ClientThemeProvider.tsx (Client Component)
'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../theme'; // your custom theme

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}