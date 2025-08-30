import React, { useState } from "react";
import { Heart, HeartOff, Calendar, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToFavorites, removeFromFavorites } from "../store/favoritesSlice";
import { setSelectedBook } from "../store/uiSlice";
import { Book } from "../types";
import { getCoverImageUrl } from "../services/bookService";
import { notificationService } from "../services/notificationService";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import DefaultCoverIcon from "./DefaultCoverIcon";

interface BookListItemProps {
  book: Book;
}

const BookListItem: React.FC<BookListItemProps> = ({ book }) => {
  const dispatch = useAppDispatch();
  const { bookIds } = useAppSelector((state) => state.favorites);
  const isFavorite = bookIds.includes(book.key);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!book.cover_i);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(book.key));
      notificationService.notifyFavoriteRemoved(book.title);
    } else {
      dispatch(addToFavorites(book));
      notificationService.notifyFavoriteAdded(book.title);
    }
  };

  const handleBookClick = () => {
    dispatch(setSelectedBook(book.key));
  };

  const hasCover = book.cover_i && !imageError;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleBookClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {hasCover ? (
              <>
                {imageLoading && (
                  <div className="w-20 h-28 bg-muted-foreground animate-pulse rounded" />
                )}
                <img
                  src={getCoverImageUrl(book.cover_i!)}
                  alt={book.title}
                  className={`w-20 h-28 object-cover rounded group-hover:scale-105 transition-transform duration-200 ${
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
              <div className="w-20 h-28 rounded group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
                <DefaultCoverIcon className="w-full h-full" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {book.title}
            </h3>

            {book.author_name && book.author_name.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm line-clamp-1">
                  {book.author_name.join(", ")}
                </span>
              </div>
            )}

            {book.first_publish_year && (
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{book.first_publish_year}</span>
              </div>
            )}

            {book.publisher && book.publisher.length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {book.publisher[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="h-10 w-10"
            >
              {isFavorite ? (
                <Heart className="h-5 w-5 text-red-500 fill-current" />
              ) : (
                <HeartOff className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookListItem;
