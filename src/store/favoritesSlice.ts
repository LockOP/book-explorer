import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Book, FavoritesState } from "../types";
import { STORAGE_KEYS } from "../config";

const loadFavoritesFromStorage = (): FavoritesState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        bookIds: parsed.bookIds || [],
        books: parsed.books || [],
      };
    }
  } catch (error) {
    console.error("Failed to load favorites from storage:", error);
  }
  return { bookIds: [], books: [] };
};

const saveFavoritesToStorage = (favorites: FavoritesState) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error("Failed to save favorites to storage:", error);
  }
};

const initialState: FavoritesState = loadFavoritesFromStorage();

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Book>) => {
      const currentFavorites = loadFavoritesFromStorage();
      const book = action.payload;

      if (!currentFavorites.bookIds.includes(book.key)) {
        currentFavorites.bookIds.push(book.key);
        currentFavorites.books.push(book);

        state.bookIds = currentFavorites.bookIds;
        state.books = currentFavorites.books;

        saveFavoritesToStorage(currentFavorites);
      } else {
        state.bookIds = currentFavorites.bookIds;
        state.books = currentFavorites.books;
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const currentFavorites = loadFavoritesFromStorage();
      const bookId = action.payload;

      currentFavorites.bookIds = currentFavorites.bookIds.filter(
        (id) => id !== bookId
      );
      currentFavorites.books = currentFavorites.books.filter(
        (book) => book.key !== bookId
      );

      // Update Redux state with fresh data
      state.bookIds = currentFavorites.bookIds;
      state.books = currentFavorites.books;

      saveFavoritesToStorage(currentFavorites);
    },
    clearFavorites: (state) => {
      state.bookIds = [];
      state.books = [];
      saveFavoritesToStorage(state);
    },
  },
});

export const { addToFavorites, removeFromFavorites, clearFavorites } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
