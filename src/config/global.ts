export const API_CONFIG = {
  BASE_URL: "https://openlibrary.org",
  ENDPOINTS: {
    SEARCH: "/search.json",
    BOOK_DETAILS: "/works",
  },
  TIMEOUT: 10000,
} as const;

export const DEFAULT_VALUES = {
  SEARCH_LIMIT: 20,
  SEARCH_OFFSET: 0,
  DEFAULT_SORT: "rating desc" as const,
  DEFAULT_VIEW_MODE: "grid" as const,
  DEFAULT_THEME: "light" as const,
  DEFAULT_SEARCH_QUERY: "type:work",
  DEFAULT_BOOK_FIELDS: "key,title,author_name,author_key,cover_i,first_publish_year,publisher,isbn,number_of_pages_median,subject,description",
  DEBOUNCE_DELAY: 500,
  MOBILE_BREAKPOINT: 768,
  CLEAR_DELAY: 600,
  TOAST_DURATION: 3000,
  TOAST_POSITION: "top-center" as const,
} as const;

export const SORT_OPTIONS = {
  "rating desc": "Popular",
  "title": "Title", 
  "new": "Newest",
  "old": "Oldest",
  "random.daily": "Random",
} as const;


