import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { useUrlState } from "../hooks/useUrlState";
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

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, books, totalResults } = useAppSelector(
    (state) => state.books
  );
  const { setSearch: setUrlSearch, setSortBy: setUrlSortBy, setViewMode: setUrlViewMode, getStateFromURL } = useUrlState();
  
  // Create a display value that shows empty for default searches
  const getDisplaySearchValue = (search: string) => {
    return search === 'type:work' || !search ? '' : search;
  };
  
  const [searchTerm, setSearchTerm] = useState(getDisplaySearchValue(filters.search));
  const [isClearing, setIsClearing] = useState(false); // Track if we're clearing
  const [isInitialized, setIsInitialized] = useState(false); // Track if component is initialized
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterFocused, setIsFilterFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Initial sync with URL on mount
  useEffect(() => {
    const urlState = getStateFromURL();
    console.log("🚀 Initial URL sync:", { 
      urlState, 
      filters, 
      currentUrl: window.location.href,
      searchParams: window.location.search
    });
    
    // Always sync on mount to ensure search input shows correct value
    if (urlState.search !== filters.search || 
        urlState.sortBy !== filters.sortBy || 
        urlState.viewMode !== filters.viewMode) {
      console.log("🔄 Dispatching updateFiltersFromURL:", urlState);
      dispatch(updateFiltersFromURL(urlState));
    }
    
    // Always update the search input to match URL
    const displayValue = getDisplaySearchValue(urlState.search);
    console.log("📝 Setting searchTerm to:", displayValue);
    setSearchTerm(displayValue);
    
    // Mark as initialized after initial sync
    setIsInitialized(true);
    console.log("✅ Component initialized");
  }, []); // Empty dependency array - only run on mount

  // Sync with URL changes after initial load
  useEffect(() => {
    const urlState = getStateFromURL();
    console.log("🔄 Ongoing URL sync effect:", { 
      urlState, 
      filters, 
      isInitialized,
      willUpdate: urlState.search !== filters.search || 
                 urlState.sortBy !== filters.sortBy || 
                 urlState.viewMode !== filters.viewMode
    });
    
    if (urlState.search !== filters.search || 
        urlState.sortBy !== filters.sortBy || 
        urlState.viewMode !== filters.viewMode) {
      console.log("🔄 Dispatching updateFiltersFromURL from ongoing sync:", urlState);
      dispatch(updateFiltersFromURL(urlState));
      setSearchTerm(getDisplaySearchValue(urlState.search));
    }
  }, [getStateFromURL, filters.search, filters.sortBy, filters.viewMode, dispatch, isInitialized]);

  useEffect(() => {
    setSearchTerm(getDisplaySearchValue(filters.search));
  }, [filters.search]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("🔄 Debounced search effect:", { 
      debouncedSearchTerm, 
      filtersSearch: filters.search,
      searchTerm,
      isDifferent: debouncedSearchTerm !== filters.search,
      isClearing,
      isInitialized
    });
    
    // Don't run the debounced effect if we're clearing or not initialized
    if (isClearing || !isInitialized) {
      console.log("🚫 Skipping debounced effect - clearing in progress or not initialized");
      return;
    }
    
    // Don't run if this is just the initial debounced value catching up
    // Only run if the user is actually typing (searchTerm matches debouncedSearchTerm)
    if (searchTerm !== debouncedSearchTerm) {
      console.log("🚫 Skipping debounced effect - searchTerm doesn't match debouncedSearchTerm (initial sync)");
      return;
    }
    
    if (debouncedSearchTerm !== filters.search) {
      console.log("📝 Updating search from debounced effect");
      dispatch(setSearch(debouncedSearchTerm));
      setUrlSearch(debouncedSearchTerm); // Update URL
      dispatch(resetBooks());
      if (debouncedSearchTerm.trim()) {
        const searchParams = {
          query: debouncedSearchTerm,
          offset: 0,
          limit: 20,
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
        // Clear search results when search is empty - set to default query internally
        console.log("🧹 Debounced effect clearing search");
        dispatch(setSearch("type:work"));
        // Don't update URL here - let the URL stay clean when no search
      }
    }
  }, [debouncedSearchTerm, dispatch, filters.search, filters.sortBy, setUrlSearch, isClearing, isInitialized, searchTerm]);

  // Force list view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && filters.viewMode !== "list") {
        dispatch(setViewMode("list"));
        setUrlViewMode("list"); // Update URL
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, filters.viewMode, setUrlViewMode]);

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value as SortOption));
    setUrlSortBy(value as SortOption); // Update URL
    dispatch(resetBooks()); // Clear existing books when sort changes

    // Show notification for sort change
    const sortLabels: Record<SortOption, string> = {
      "rating desc": "Popular",
      "title": "Title",
      "new": "Newest",
      "old": "Oldest",
      "random.daily": "Random"
    };
    notificationService.notifySortChanged(sortLabels[value as SortOption]);

    // Trigger new search with updated sort
    const query = filters.search.trim() || "";
    const searchParams = {
      query,
      offset: 0,
      limit: 20,
      sort: value as SortOption,
    };
    dispatch(fetchBooks(searchParams));
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    // Only allow view mode change on desktop
    if (window.innerWidth >= 768) {
      // Prevent re-clicking on already selected view mode
      if (filters.viewMode === mode) {
        console.log(`ℹ️ View mode "${mode}" is already active, ignoring click`);
        return;
      }
      
      dispatch(setViewMode(mode));
      setUrlViewMode(mode); // Update URL
      // Show notification for view mode change
      notificationService.notifyViewModeChanged(mode);
    }
  };

  const handleClearSearch = () => {
    console.log("🧹 Clearing search...");
    
    // Set clearing flag to prevent debounced effect from interfering
    setIsClearing(true);
    
    // First, reset the local state
    setSearchTerm("");
    
    // Then update the Redux store and URL
    dispatch(setSearch("type:work")); // Set to default query internally
    setUrlSearch("type:work"); // Update URL with default query
    
    // Clear existing books
    dispatch(resetBooks());
    
    // Fetch default books immediately
    const searchParams = {
      query: "type:work",
      offset: 0,
      limit: 20,
      sort: filters.sortBy,
    };
    
    console.log("🔍 Fetching default books with:", searchParams);
    dispatch(fetchBooks(searchParams));
    
    // Reset clearing flag after a delay to allow debounced effect to work again
    setTimeout(() => {
      setIsClearing(false);
      console.log("✅ Clearing operation completed, debounced effect re-enabled");
    }, 600); // Slightly longer than the 500ms debounce delay
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
                <SelectItem value="rating desc">Popular</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="old">Oldest</SelectItem>
                <SelectItem value="random.daily">Random</SelectItem>
              </SelectContent>
            </Select>

            {/* View mode toggle - only visible on desktop */}
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
