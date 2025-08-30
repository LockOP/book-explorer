import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  HeartOff,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setSelectedBook } from "../store/uiSlice";
import { addToFavorites, removeFromFavorites } from "../store/favoritesSlice";
import { notificationService } from "../services/notificationService";
import { Book } from "../types";
import { getCoverImageUrl } from "../services/bookService";
import DefaultCoverIcon from "./DefaultCoverIcon";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const BookDetailsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedBookId } = useAppSelector((state) => state.ui);
  const { books } = useAppSelector((state) => state.books);
  const { books: favoriteBooks } = useAppSelector((state) => state.favorites);
  const { bookIds } = useAppSelector((state) => state.favorites);

  const selectedBook =
    books.find((book: Book) => book.key === selectedBookId) ||
    favoriteBooks.find((book: Book) => book.key === selectedBookId);

  const isFavorite = selectedBook ? bookIds.includes(selectedBook.key) : false;
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (selectedBook?.cover_i) {
      setImageLoading(true);
      setImageError(false);
    } else {
      setImageLoading(false);
      setImageError(false);
    }
  }, [selectedBook?.cover_i]);

  if (!selectedBook) return null;

  const hasCover = selectedBook.cover_i && !imageError;

  const handleClose = () => {
    dispatch(setSelectedBook(null));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(selectedBook.key));
      notificationService.notifyFavoriteRemoved(selectedBook.title);
    } else {
      dispatch(addToFavorites(selectedBook));
      notificationService.notifyFavoriteAdded(selectedBook.title);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Book Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              {hasCover ? (
                <>
                  {imageLoading && (
                    <div className="w-64 h-96 bg-muted-foreground animate-pulse rounded-lg shadow-lg mb-4" />
                  )}
                  <img
                    src={getCoverImageUrl(selectedBook.cover_i!, "L")}
                    alt={selectedBook.title}
                    className={`w-64 h-96 object-cover rounded-lg shadow-lg mb-4 ${
                      imageLoading ? "hidden" : "block"
                    }`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                  />
                </>
              ) : (
                <div className="w-64 h-96 rounded-lg shadow-lg mb-4 flex items-center justify-center">
                  <DefaultCoverIcon className="w-full h-full" />
                </div>
              )}

              <div className="flex gap-2 w-full">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  onClick={handleToggleFavorite}
                  className="flex-1"
                >
                  {isFavorite ? (
                    <>
                      <Heart className="h-4 w-4 mr-2 fill-current" />
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {selectedBook.title}
                </h1>

                {selectedBook.author_name &&
                  selectedBook.author_name.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <User className="h-4 w-4" />
                      <span className="text-lg">
                        by {selectedBook.author_name.join(", ")}
                      </span>
                    </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedBook.first_publish_year && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Published: {selectedBook.first_publish_year}</span>
                  </div>
                )}

                {selectedBook.publisher &&
                  selectedBook.publisher.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>Publisher: {selectedBook.publisher[0]}</span>
                    </div>
                  )}

                {selectedBook.number_of_pages_median && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{selectedBook.number_of_pages_median} pages</span>
                  </div>
                )}

                {selectedBook.isbn && selectedBook.isbn.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>ISBN: {selectedBook.isbn[0]}</span>
                  </div>
                )}
              </div>

              {selectedBook.subject && selectedBook.subject.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Subjects
                  </h3>
                  <div
                    className="flex flex-wrap gap-2"
                    title={selectedBook.subject.join(", ")}
                  >
                    {selectedBook.subject
                      .slice(0, 8)
                      .map((subject: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    {selectedBook.subject.length > 8 && (
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full cursor-help">
                        +{selectedBook.subject.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {selectedBook.description && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedBook.description}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://openlibrary.org${selectedBook.key}`,
                      "_blank"
                    )
                  }
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Open Library
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetailsModal;
