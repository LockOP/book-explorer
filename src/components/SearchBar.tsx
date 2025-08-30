import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { useUrlState } from "../hooks/urlState";
import { useDebounce } from "../hooks/debounce";

import {
  setSearch,
  setSortBy,
  setViewMode,
  fetchBooks,
  resetBooks,
  updateFiltersFromURL,
} from "../store/booksSlice";
import { notificationService } from "../services/notificationService";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { SortOption } from "../types";
import { DEFAULT_VALUES, SORT_OPTIONS } from "../config";

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.books);
  const {
    setSearch: setUrlSearch,
    setSortBy: setUrlSortBy,
    setViewMode: setUrlViewMode,
    getStateFromURL,
  } = useUrlState();

  const getDisplaySearchValue = (search: string) => {
    return search === DEFAULT_VALUES.DEFAULT_SEARCH_QUERY || !search
      ? ""
      : search;
  };

  const [searchTerm, setSearchTerm] = useState(
    getDisplaySearchValue(filters.search)
  );
  const [isClearing, setIsClearing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const debouncedSearchTerm = useDebounce(
    searchTerm,
    DEFAULT_VALUES.DEBOUNCE_DELAY
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterFocused, setIsFilterFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const urlState = getStateFromURL();

    if (
      urlState.search !== filters.search ||
      urlState.sortBy !== filters.sortBy ||
      urlState.viewMode !== filters.viewMode
    ) {
      dispatch(updateFiltersFromURL(urlState));
    }

    const displayValue = getDisplaySearchValue(urlState.search);
    setSearchTerm(displayValue);

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const urlState = getStateFromURL();

    if (
      urlState.search !== filters.search ||
      urlState.sortBy !== filters.sortBy ||
      urlState.viewMode !== filters.viewMode
    ) {
      dispatch(updateFiltersFromURL(urlState));
      setSearchTerm(getDisplaySearchValue(urlState.search));
    }
  }, [
    getStateFromURL,
    filters.search,
    filters.sortBy,
    filters.viewMode,
    dispatch,
    isInitialized,
  ]);

  useEffect(() => {
    setSearchTerm(getDisplaySearchValue(filters.search));
  }, [filters.search]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < DEFAULT_VALUES.MOBILE_BREAKPOINT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isClearing || !isInitialized) {
      return;
    }

    if (searchTerm !== debouncedSearchTerm) {
      return;
    }

    if (debouncedSearchTerm !== filters.search) {
      dispatch(setSearch(debouncedSearchTerm));
      setUrlSearch(debouncedSearchTerm);
      dispatch(resetBooks());
      if (debouncedSearchTerm.trim()) {
        const searchParams = {
          query: debouncedSearchTerm,
          offset: DEFAULT_VALUES.SEARCH_OFFSET,
          limit: DEFAULT_VALUES.SEARCH_LIMIT,
          sort: filters.sortBy,
        };
        dispatch(fetchBooks(searchParams)).then((result) => {
          if (result.meta.requestStatus === "fulfilled" && result.payload) {
            const response = result.payload as any;
            notificationService.notifySearchResultsUpdated(
              debouncedSearchTerm,
              response.numFound || 0
            );
          }
        });
      } else {
        dispatch(setSearch(DEFAULT_VALUES.DEFAULT_SEARCH_QUERY));
      }
    }
  }, [
    debouncedSearchTerm,
    dispatch,
    filters.search,
    filters.sortBy,
    setUrlSearch,
    isClearing,
    isInitialized,
    searchTerm,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (
        window.innerWidth < DEFAULT_VALUES.MOBILE_BREAKPOINT &&
        filters.viewMode !== "list"
      ) {
        dispatch(setViewMode("list"));
        setUrlViewMode("list");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, filters.viewMode, setUrlViewMode]);

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value as SortOption));
    setUrlSortBy(value as SortOption);
    dispatch(resetBooks());

    notificationService.notifySortChanged(SORT_OPTIONS[value as SortOption]);

    const query = filters.search.trim() || "";
    const searchParams = {
      query,
      offset: DEFAULT_VALUES.SEARCH_OFFSET,
      limit: DEFAULT_VALUES.SEARCH_LIMIT,
      sort: value as SortOption,
    };
    dispatch(fetchBooks(searchParams));
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    if (window.innerWidth >= DEFAULT_VALUES.MOBILE_BREAKPOINT) {
      if (filters.viewMode === mode) {
        return;
      }

      dispatch(setViewMode(mode));
      setUrlViewMode(mode);
      notificationService.notifyViewModeChanged(mode);
    }
  };

  const handleClearSearch = () => {
    setIsClearing(true);

    setSearchTerm("");

    dispatch(setSearch(DEFAULT_VALUES.DEFAULT_SEARCH_QUERY));
    setUrlSearch(DEFAULT_VALUES.DEFAULT_SEARCH_QUERY);

    dispatch(resetBooks());

    const searchParams = {
      query: DEFAULT_VALUES.DEFAULT_SEARCH_QUERY,
      offset: DEFAULT_VALUES.SEARCH_OFFSET,
      limit: DEFAULT_VALUES.SEARCH_LIMIT,
      sort: filters.sortBy,
    };

    dispatch(fetchBooks(searchParams));

    setTimeout(() => {
      setIsClearing(false);
    }, DEFAULT_VALUES.CLEAR_DELAY);
  };

  const handleFilterFocus = () => {
    if (isMobile) {
      setIsFilterFocused(true);
      setIsSearchFocused(false);
    }
  };

  const handleFilterBlur = () => {
    if (isMobile) {
      setIsFilterFocused(false);
    }
  };

  const handleSearchFocus = () => {
    if (isMobile) {
      setIsSearchFocused(true);
      setIsFilterFocused(false);
    }
  };

  const handleSearchBlur = () => {
    if (isMobile) {
      setIsSearchFocused(false);
    }
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3 items-center">
          <div
            className={`relative transition-all duration-300 ${
              isMobile && isFilterFocused ? "hidden" : "flex-1"
            }`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search books by title, author, or subject..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/80"
                title="Clear search"
              >
                ×
              </Button>
            )}
          </div>

          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              isMobile && isSearchFocused ? "hidden" : "flex"
            }`}
          >
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger
                className={`h-10 transition-all duration-300 ${
                  isMobile && isFilterFocused
                    ? "w-full"
                    : isMobile
                    ? "w-36"
                    : "w-40"
                } px-3`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:flex border border-border rounded-md">
              <Button
                variant={filters.viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("grid")}
                className="rounded-r-none border-r border-border"
              >
                <div className="grid grid-cols-3 gap-0.5 h-4 w-4">
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                  <div className="w-1 h-1 bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={filters.viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className="rounded-l-none"
              >
                <div className="flex flex-col gap-0.5 h-4 w-4">
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                  <div className="w-4 h-1 bg-current rounded-sm"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
