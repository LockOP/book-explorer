import React, { useEffect, useRef, useCallback } from "react";
import { BookOpen, Search } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { loadMoreBooks } from "../store/booksSlice";
import BookCard from "./BookCard";
import BookListItem from "./BookListItem";

const BookGrid: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    books,
    loading,
    loadingMore,
    error,
    filters,
    totalResults,
    hasMore,
  } = useAppSelector((state) => state.books);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
      <div className="text-center py-12">
        <p className="text-destructive text-lg mb-2">Error loading books</p>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your internet connection and try again.
        </p>
      </div>
    );
  }

  if (!books.length && !filters.search.trim()) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Welcome to Book Explorer
        </h3>
        <p className="text-muted-foreground mb-4">
          Start exploring by searching for your favorite books, authors, or
          subjects.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>
            Try searching for "fiction", "mystery", or an author's name
          </span>
        </div>
      </div>
    );
  }

  if (!books.length && filters.search.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No books found
        </h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any books matching "{filters.search}"
        </p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search terms or browse popular categories.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="container px-4 py-6 flex-grow w-full overflow-auto"
    >
      {filters.viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">
              Loading more books...
            </p>
          </div>
        </div>
      )}

      {!hasMore && books.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-sm">
            You've reached the end of the results ({totalResults} books found)
          </p>
        </div>
      )}
    </div>
  );
};

export default BookGrid;
