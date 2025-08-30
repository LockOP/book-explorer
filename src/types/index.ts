export interface Book {
  id: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  cover_i?: number;
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  subject?: string[];
  description?: string;
  key: string;
}

export interface BookSearchResponse {
  numFound: number;
  start: number;
  docs: Book[];
}

export interface Notification {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface BookFilters {
  search: string;
  sortBy: string; // Using Open Library API sort options
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
}

export interface FavoritesState {
  bookIds: string[];
  books: Book[];
}

export interface AppState {
  books: Book[];
  loading: boolean;
  error: string | null;
  filters: BookFilters;
  favorites: FavoritesState;
  notifications: Notification[];
  theme: "light" | "dark";
}
