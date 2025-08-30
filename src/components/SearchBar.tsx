import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { useDebounce } from "../hooks/debounce";
import {
  setSearch,
  setSortBy,
  setSortOrder,
  setViewMode,
  fetchBooks,
  resetBooks,
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

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters, books, totalResults } = useAppSelector(
    (state) => state.books
  );
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isMobile, setIsMobile] = useState(false);
  const [isFilterFocused, setIsFilterFocused] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      dispatch(setSearch(debouncedSearchTerm));
      dispatch(resetBooks());
      if (debouncedSearchTerm.trim()) {
        const searchParams = {
          query: debouncedSearchTerm,
          offset: 0,
          limit: 20,
          sort: filters.sortBy,
        };
        dispatch(fetchBooks(searchParams)).then((result) => {
          // Add notification after search is completed
          if (result.meta.requestStatus === "fulfilled" && result.payload) {
            const response = result.payload as any;
            notificationService.notifySearchResultsUpdated(
              debouncedSearchTerm,
              response.numFound || 0
            );
          }
        });
      } else {
        // Clear search results when search is empty
        dispatch(setSearch(""));
      }
    }
  }, [debouncedSearchTerm, dispatch, filters.search, filters.sortBy]);

  // Force list view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && filters.viewMode !== "list") {
        dispatch(setViewMode("list"));
      }
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, filters.viewMode]);

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value));
    dispatch(resetBooks()); // Clear existing books when sort changes

    // Trigger new search with updated sort
    const query = filters.search.trim() || "";
    const searchParams = {
      query,
      offset: 0,
      limit: 20,
      sort: value,
    };
    dispatch(fetchBooks(searchParams));
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    // Only allow view mode change on desktop
    if (window.innerWidth >= 768) {
      dispatch(setViewMode(mode));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    dispatch(setSearch(""));
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
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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
