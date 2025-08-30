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

// New types for book polling mechanism
export interface BookChange {
  id: string;
  kind: "add-book" | "edit-book";
  timestamp: string;
  comment?: string;
  author?: {
    key: string;
    name: string;
  };
  changes?: Array<{
    key: string;
    revision: number;
    timestamp: string;
    comment?: string;
    author?: {
      key: string;
      name: string;
    };
  }>;
  data?: {
    work?: {
      key: string;
      title?: string;
      authors?: Array<{
        author: {
          key: string;
          name: string;
        };
      }>;
    };
    edition?: {
      key: string;
      title?: string;
      authors?: Array<{
        key: string;
        name: string;
      }>;
    };
  };
}

export interface BookChangesResponse {
  changes: BookChange[];
}

export type NotificationType = "success" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export type SortOption = "rating desc" | "title" | "new" | "old" | "random.daily";
export type ViewMode = "grid" | "list";

export interface BookFilters {
  search: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}

export interface FavoritesState {
  bookIds: string[];
  books: Book[];
}

export type Theme = "light" | "dark";

export interface AppState {
  books: Book[];
  loading: boolean;
  error: string | null;
  filters: BookFilters;
  favorites: FavoritesState;
  notifications: Notification[];
  theme: Theme;
}
