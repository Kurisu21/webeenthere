'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Default to light mode if no user preference is set
    const mode = user?.theme_mode === 'dark' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [user?.theme_mode]);

  // Apply theme on initial load before user data loads
  useEffect(() => {
    if (typeof document !== 'undefined' && !user) {
      // Check localStorage for saved theme preference
      const savedTheme = localStorage.getItem('user');
      if (savedTheme) {
        try {
          const userData = JSON.parse(savedTheme);
          const mode = userData.theme_mode === 'dark' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', mode);
        } catch {
          // Default to light mode if parsing fails
          document.documentElement.setAttribute('data-theme', 'light');
        }
      } else {
        // Default to light mode for new users
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, [user]);

  return <>{children}</>;
};

export default ThemeProvider;


