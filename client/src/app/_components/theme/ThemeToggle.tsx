'use client';

import React, { useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { API_ENDPOINTS, apiPut } from '../../../lib/apiConfig';

const ThemeToggle: React.FC = () => {
  const { user, token } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentTheme = user?.theme_mode || 'light';
  const isDark = currentTheme === 'dark';

  const handleToggle = useCallback(async () => {
    if (!user || !token || isUpdating) return;

    const newTheme = isDark ? 'light' : 'dark';
    
    try {
      setIsUpdating(true);
      
      // Update theme via API
      const response = await apiPut(`${API_ENDPOINTS.USERS}/profile`, {
        theme_mode: newTheme,
      });

      if (response.success) {
        // Update local storage immediately for instant UI feedback
        const updatedUser = {
          ...user,
          theme_mode: newTheme,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Force a page reload to ensure all components update
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, token, isDark, isUpdating]);

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating}
      className={`
        relative p-2 rounded-lg transition-all duration-300 transform hover:scale-110
        ${isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isUpdating ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isDark ? (
        // Sun icon for dark mode
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for light mode
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;



