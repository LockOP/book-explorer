import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { searchBooks, SearchParams } from "../services/bookService";
import {
  Book,
  BookSearchResponse,
  BookFilters,
  SortOption,
  ViewMode,
} from "../types";

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

const createInitialState = (initialFilters: BookFilters): BooksState => ({
  books: [],
  loading: false,
  loadingMore: false,
  error: null,
  filters: initialFilters,
  totalResults: 0,
  hasMore: true,
  currentOffset: 0,
});

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
  initialState: createInitialState({
    search: "",
    sortBy: "rating desc",
    viewMode: "grid",
  }),
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;

      state.currentOffset = 0;
      state.hasMore = true;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.filters.sortBy = action.payload;

      state.currentOffset = 0;
      state.hasMore = true;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.filters.viewMode = action.payload;
    },
    updateFiltersFromURL: (state, action: PayloadAction<BookFilters>) => {
      state.filters = action.payload;

      state.currentOffset = 0;
      state.hasMore = true;
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

      .addCase(loadMoreBooks.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(
        loadMoreBooks.fulfilled,
        (state, action: PayloadAction<BookSearchResponse>) => {
          state.loadingMore = false;

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
  setViewMode,
  updateFiltersFromURL,
  clearError,
  resetBooks,
} = booksSlice.actions;

export default booksSlice.reducer;
