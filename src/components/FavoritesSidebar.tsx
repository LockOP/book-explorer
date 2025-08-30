import React, { useEffect, useRef, useState } from "react";
import { X, Heart, Trash2, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { toggleFavoritesSidebar, setSelectedBook } from "../store/uiSlice";
import { clearFavorites, removeFromFavorites } from "../store/favoritesSlice";
import { notificationService } from "../services/notificationService";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { getCoverImageUrl } from "../services/bookService";
import DefaultCoverIcon from "./DefaultCoverIcon";
import { Book } from "../types";

const BookCoverImage: React.FC<{ book: Book; onClick: () => void }> = ({
  book,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const hasCover = book.cover_i && !imageError;

  return (
    <div className="flex-shrink-0 cursor-pointer" onClick={onClick}>
      {hasCover ? (
        <img
          src={getCoverImageUrl(book.cover_i!)}
          alt={book.title}
          className="w-16 h-24 object-cover rounded group-hover:scale-105 transition-transform duration-200"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-16 h-24 rounded group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
          <DefaultCoverIcon className="w-full h-full" />
        </div>
      )}
    </div>
  );
};

const FavoritesSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { favoritesSidebarOpen } = useAppSelector((state: any) => state.ui);
  const { books: favoriteBooks } = useAppSelector(
    (state: any) => state.favorites
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter favorites based on search query
  const filteredFavorites = favoriteBooks.filter((book: Book) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      (book.author_name &&
        book.author_name.some((author) => author.toLowerCase().includes(query)))
    );
  });

  const handleClose = () => {
    setSearchQuery("");
    dispatch(toggleFavoritesSidebar());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;


      if (
        favoritesSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target)
      ) {
        const favoritesButton = target.closest("[data-favorites-trigger]");
        if (!favoritesButton) {
          handleClose();
        }
      }
    };

    if (favoritesSidebarOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [favoritesSidebarOpen]);

  const handleBookClick = (bookId: string) => {
    dispatch(setSelectedBook(bookId));
    dispatch(toggleFavoritesSidebar());
  };

  const handleRemoveFavorite = (bookId: string) => {
    const bookToRemove = favoriteBooks.find(
      (book: Book) => book.key === bookId
    );
    if (bookToRemove) {
      dispatch(removeFromFavorites(bookId));
      notificationService.notifyFavoriteRemoved(bookToRemove.title);
    }
  };

  const handleClearAll = () => {
    if (favoriteBooks.length > 0) {
      dispatch(clearFavorites());
    }
  };

  if (!favoritesSidebarOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Favorites ({favoriteBooks.length})
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        {favoriteBooks.length > 0 && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  ×
                </Button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                {filteredFavorites.length} of {favoriteBooks.length} favorites
              </p>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {favoriteBooks.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No favorite books yet</p>
              <p className="text-sm text-muted-foreground">
                Click the heart icon on any book to add it to favorites
              </p>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No matches found</p>
              <p className="text-sm text-muted-foreground">
                No favorites match "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFavorites.map((book: Book) => (
                <Card
                  key={book.key}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <BookCoverImage
                        book={book}
                        onClick={() => handleBookClick(book.key)}
                      />

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleBookClick(book.key)}
                      >
                        <h4 className="font-medium text-sm line-clamp-2 hover:text-primary group-hover:text-primary transition-colors">
                          {book.title}
                        </h4>

                        {book.author_name && book.author_name.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {book.author_name.join(", ")}
                          </p>
                        )}

                        {book.first_publish_year && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {book.first_publish_year}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(book.key);
                        }}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {favoriteBooks.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="w-full"
            >
              Clear All Favorites
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesSidebar;
