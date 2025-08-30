import { useEffect, useCallback } from 'react';
import { SortOption, ViewMode } from '../types';

interface URLState {
  search: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}

const DEFAULT_STATE: URLState = {
  search: 'type:work',
  sortBy: 'rating desc',
  viewMode: 'grid'
};

export const useUrlState = () => {
  // Get current state from URL
  const getStateFromURL = useCallback((): URLState => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlSearch = searchParams.get('q');
    
    console.log("🔍 getStateFromURL called:", {
      url: window.location.href,
      searchParams: window.location.search,
      urlSearch,
      result: {
        search: urlSearch || '',
        sortBy: (searchParams.get('sort') as SortOption) || DEFAULT_STATE.sortBy,
        viewMode: (searchParams.get('view') as ViewMode) || DEFAULT_STATE.viewMode
      }
    });
    
    return {
      search: urlSearch || '', // Return empty string if no search param, not DEFAULT_STATE.search
      sortBy: (searchParams.get('sort') as SortOption) || DEFAULT_STATE.sortBy,
      viewMode: (searchParams.get('view') as ViewMode) || DEFAULT_STATE.viewMode
    };
  }, []);

  // Update URL with new state
  const updateURL = useCallback((newState: Partial<URLState>) => {
    const currentParams = new URLSearchParams(window.location.search);
    const currentState = getStateFromURL();
    
    // Merge current state with new state
    const updatedState = { ...currentState, ...newState };
    
    console.log("🔄 updateURL called:", {
      newState,
      currentState,
      updatedState,
      willSetSearch: updatedState.search && updatedState.search.trim(),
      willDeleteSearch: !(updatedState.search && updatedState.search.trim())
    });
    
    // Update URL parameters
    // For search: only remove 'q' if it's actually empty, not if it's the default
    if (updatedState.search && updatedState.search.trim()) {
      currentParams.set('q', updatedState.search);
      console.log("✅ Setting search param:", updatedState.search);
    } else {
      currentParams.delete('q');
      console.log("🗑️ Deleting search param");
    }
    
    if (updatedState.sortBy !== DEFAULT_STATE.sortBy) {
      currentParams.set('sort', updatedState.sortBy);
    } else {
      currentParams.delete('sort');
    }
    
    if (updatedState.viewMode !== DEFAULT_STATE.viewMode) {
      currentParams.set('view', updatedState.viewMode);
    } else {
      currentParams.delete('view');
    }
    
    // Update URL without page reload
    const newURL = currentParams.toString() 
      ? `${window.location.pathname}?${currentParams.toString()}`
      : window.location.pathname;
    
    console.log("🌐 Updating URL to:", newURL);
    window.history.replaceState({}, '', newURL);
  }, [getStateFromURL]);

  // Update specific state values
  const setSearch = useCallback((search: string) => {
    updateURL({ search });
  }, [updateURL]);

  const setSortBy = useCallback((sortBy: SortOption) => {
    updateURL({ sortBy });
  }, [updateURL]);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    updateURL({ viewMode });
  }, [updateURL]);

  // Listen for URL changes (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      // URL changed, but we don't need to do anything here
      // The component using this hook will call getStateFromURL() when needed
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    getStateFromURL,
    setSearch,
    setSortBy,
    setViewMode,
    updateURL
  };
};
