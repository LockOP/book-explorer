import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Book, BookSearchResponse, BookFilters } from "../types";
import { searchBooks, SearchParams } from "../services/bookService";

interface BooksState {
  books: Book[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  filters: BookFilters;
  totalResults: number;
  hasMore: boolean;
  currentOffset: number;
}

const initialState: BooksState = {
  books: [],
  loading: false,
  loadingMore: false,
  error: null,
  filters: {
    search: "",
    sortBy: "rating desc",
    sortOrder: "asc",
    viewMode: "grid",
  },
  totalResults: 0,
  hasMore: true,
  currentOffset: 0,
};

export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
  async (params: SearchParams) => {
    const response = await searchBooks(params);
    return response;
  }
);

export const loadMoreBooks = createAsyncThunk(
  "books/loadMoreBooks",
  async (params: SearchParams) => {
    const response = await searchBooks(params);
    return response;
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      // Reset pagination when search changes
      state.currentOffset = 0;
      state.hasMore = true;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload;
      // Reset pagination when sort changes
      state.currentOffset = 0;
      state.hasMore = true;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.filters.sortOrder = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.filters.viewMode = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBooks: (state) => {
      state.books = [];
      state.currentOffset = 0;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books (initial search)
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBooks.fulfilled,
        (state, action: PayloadAction<BookSearchResponse>) => {
          state.loading = false;
          state.books = action.payload.docs;
          state.totalResults = action.payload.numFound;
          state.currentOffset = action.payload.docs.length;
          state.hasMore =
            action.payload.docs.length > 0 &&
            state.currentOffset < action.payload.numFound;
        }
      )
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch books";
      })
      // Load more books (infinite scroll)
      .addCase(loadMoreBooks.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(
        loadMoreBooks.fulfilled,
        (state, action: PayloadAction<BookSearchResponse>) => {
          state.loadingMore = false;
          // Append new books to existing list
          state.books = [...state.books, ...action.payload.docs];
          state.currentOffset += action.payload.docs.length;
          state.hasMore =
            action.payload.docs.length > 0 &&
            state.currentOffset < action.payload.numFound;
        }
      )
      .addCase(loadMoreBooks.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || "Failed to load more books";
      });
  },
});

export const {
  setSearch,
  setSortBy,
  setSortOrder,
  setViewMode,
  clearError,
  resetBooks,
} = booksSlice.actions;
export default booksSlice.reducer;
