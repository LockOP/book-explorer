import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Book, FavoritesState } from "../types";

const loadFavoritesFromStorage = (): FavoritesState => {
  try {
    const stored = localStorage.getItem("book-explorer-favorites");
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
    localStorage.setItem("book-explorer-favorites", JSON.stringify(favorites));
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
      const book = action.payload;
      if (!state.bookIds.includes(book.key)) {
        state.bookIds.push(book.key);
        state.books.push(book);
        saveFavoritesToStorage(state);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const bookId = action.payload;
      state.bookIds = state.bookIds.filter((id) => id !== bookId);
      state.books = state.books.filter((book) => book.key !== bookId);
      saveFavoritesToStorage(state);
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
