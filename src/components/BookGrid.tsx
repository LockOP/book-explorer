import React, { useEffect, useRef, useCallback } from "react";
import { BookOpen, Search } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { useUrlState } from "../hooks/urlState";
import { loadMoreBooks, updateFiltersFromURL } from "../store/booksSlice";
import BookCard from "./BookCard";
import BookListItem from "./BookListItem";

const BookGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const { books, loading, loadingMore, error, filters, totalResults, hasMore } =
    useAppSelector((state) => state.books);
  const { getStateFromURL } = useUrlState();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const urlState = getStateFromURL();
    if (
      urlState.search !== filters.search ||
      urlState.sortBy !== filters.sortBy ||
      urlState.viewMode !== filters.viewMode
    ) {
      dispatch(updateFiltersFromURL(urlState));
    }
  }, [
    getStateFromURL,
    filters.search,
    filters.sortBy,
    filters.viewMode,
    dispatch,
  ]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollTop, clientHeight, scrollHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && !loadingMore && hasMore && books.length > 0) {
      const query = filters.search.trim() || "type:work";
      dispatch(
        loadMoreBooks({
          query,
          offset: books.length,
          limit: 20,
          sort: filters.sortBy,
        })
      );
    }
  }, [dispatch, loadingMore, hasMore, books.length, filters]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-destructive text-lg font-medium mb-2">
            Error loading books
          </div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (books.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="text-lg font-medium mb-2">No books found</div>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" ref={scrollContainerRef}>
      <div className="container mx-auto px-4 py-6">
        {filters.viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <BookListItem key={book.key} book={book} />
            ))}
          </div>
        )}

        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading more...</span>
          </div>
        )}

        {!hasMore && books.length > 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>You've reached the end of the results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookGrid;
