import { useEffect, useCallback } from "react";
import { SortOption, ViewMode } from "../types";
import { DEFAULT_VALUES } from "../config";

interface URLState {
  search: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}

const DEFAULT_STATE: URLState = {
  search: DEFAULT_VALUES.DEFAULT_SEARCH_QUERY,
  sortBy: DEFAULT_VALUES.DEFAULT_SORT,
  viewMode: DEFAULT_VALUES.DEFAULT_VIEW_MODE,
};

export const useUrlState = () => {
  const getStateFromURL = useCallback((): URLState => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlSearch = searchParams.get("q");

    return {
      search: urlSearch || "",
      sortBy: (searchParams.get("sort") as SortOption) || DEFAULT_STATE.sortBy,
      viewMode:
        (searchParams.get("view") as ViewMode) || DEFAULT_STATE.viewMode,
    };
  }, []);

  const updateURL = useCallback(
    (newState: Partial<URLState>) => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentState = getStateFromURL();

      const updatedState = { ...currentState, ...newState };
      if (updatedState.search && updatedState.search.trim()) {
        currentParams.set("q", updatedState.search);
      } else {
        currentParams.delete("q");
      }

      if (updatedState.sortBy !== DEFAULT_STATE.sortBy) {
        currentParams.set("sort", updatedState.sortBy);
      } else {
        currentParams.delete("sort");
      }

      if (updatedState.viewMode !== DEFAULT_STATE.viewMode) {
        currentParams.set("view", updatedState.viewMode);
      } else {
        currentParams.delete("view");
      }

      const newURL = currentParams.toString()
        ? `${window.location.pathname}?${currentParams.toString()}`
        : window.location.pathname;

      window.history.replaceState({}, "", newURL);
    },
    [getStateFromURL]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateURL({ search });
    },
    [updateURL]
  );

  const setSortBy = useCallback(
    (sortBy: SortOption) => {
      updateURL({ sortBy });
    },
    [updateURL]
  );

  const setViewMode = useCallback(
    (viewMode: ViewMode) => {
      updateURL({ viewMode });
    },
    [updateURL]
  );

  useEffect(() => {
    const handlePopState = () => {};

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return {
    getStateFromURL,
    setSearch,
    setSortBy,
    setViewMode,
    updateURL,
  };
};
