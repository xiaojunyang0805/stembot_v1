'use client';

import { useState, useEffect } from 'react';

import { safeJsonParse } from '../lib/utils';

export type ViewMode = 'grid' | 'list';

const VIEW_PREFERENCE_KEY = 'stembot_projects_view_preference';

export function useViewPreference(defaultView: ViewMode = 'grid') {
  const [view, setView] = useState<ViewMode>(defaultView);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (stored !== null && stored.length > 0) {
        const parsedView = safeJsonParse(stored, defaultView);
        if (parsedView === 'grid' || parsedView === 'list') {
          setView(parsedView);
        }
      }
    } catch (error) {
      console.warn('Failed to load view preference:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [defaultView]);

  // Save preference to localStorage when it changes
  const setViewPreference = (newView: ViewMode) => {
    setView(newView);
    try {
      localStorage.setItem(VIEW_PREFERENCE_KEY, JSON.stringify(newView));
    } catch (error) {
      console.warn('Failed to save view preference:', error);
    }
  };

  return {
    view,
    setView: setViewPreference,
    isLoaded
  };
}