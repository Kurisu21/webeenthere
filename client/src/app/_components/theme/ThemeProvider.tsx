'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    const mode = user?.theme_mode === 'dark' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [user?.theme_mode]);

  return <>{children}</>;
};

export default ThemeProvider;


