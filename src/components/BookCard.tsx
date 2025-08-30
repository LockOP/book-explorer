import React, { useState } from "react";
import { Heart, HeartOff, Eye } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { addToFavorites, removeFromFavorites } from "../store/favoritesSlice";
import { setSelectedBook } from "../store/uiSlice";
import { Book } from "../types";
import { getCoverImageUrl } from "../services/bookService";
import { notificationService } from "../services/notificationService";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import DefaultCoverIcon from "./DefaultCoverIcon";

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const dispatch = useAppDispatch();
  const { bookIds } = useAppSelector((state: any) => state.favorites);
  const isFavorite = bookIds.includes(book.key);
  const [imageError, setImageError] = useState(false);

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
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={handleBookClick}>
        <div className="relative">
          {hasCover ? (
            <img
              src={getCoverImageUrl(book.cover_i!)}
              alt={book.title}
              className="w-full h-64 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-64 rounded-t-lg group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              <DefaultCoverIcon className="w-full h-full" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="h-8 w-8 bg-background/80 hover:bg-background"
            >
              {isFavorite ? (
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          {book.author_name && book.author_name.length > 0 && (
            <p className="text-muted-foreground text-sm mb-2">
              by {book.author_name.join(", ")}
            </p>
          )}
          {book.first_publish_year && (
            <p className="text-muted-foreground text-sm">
              {book.first_publish_year}
            </p>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default BookCard;
