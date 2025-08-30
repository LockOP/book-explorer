import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS, DEFAULT_VALUES } from "../config";

interface UIState {
  theme: "light" | "dark";
  favoritesSidebarOpen: boolean;
  notificationsSidebarOpen: boolean;
  selectedBookId: string | null;
}

const loadThemeFromStorage = (): "light" | "dark" => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch (error) {
    console.error("Failed to load theme from storage:", error);
  }
  return DEFAULT_VALUES.DEFAULT_THEME;
};

const saveThemeToStorage = (theme: "light" | "dark") => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    console.error("Failed to save theme to storage:", error);
  }
};

const initialState: UIState = {
  theme: loadThemeFromStorage(),
  favoritesSidebarOpen: false,
  notificationsSidebarOpen: false,
  selectedBookId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      state.theme = newTheme;
      saveThemeToStorage(state.theme);
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      saveThemeToStorage(state.theme);
    },
    toggleFavoritesSidebar: (state) => {
      state.favoritesSidebarOpen = !state.favoritesSidebarOpen;

      if (state.favoritesSidebarOpen) {
        state.notificationsSidebarOpen = false;
      }
    },
    toggleNotificationsSidebar: (state) => {
      state.notificationsSidebarOpen = !state.notificationsSidebarOpen;

      if (state.notificationsSidebarOpen) {
        state.favoritesSidebarOpen = false;
      }
    },
    setFavoritesSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.favoritesSidebarOpen = action.payload;
    },
    setNotificationsSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationsSidebarOpen = action.payload;
    },

    toggleSidebar: (state) => {
      state.favoritesSidebarOpen = !state.favoritesSidebarOpen;
      if (state.favoritesSidebarOpen) {
        state.notificationsSidebarOpen = false;
      }
    },
    setSelectedBook: (state, action: PayloadAction<string | null>) => {
      state.selectedBookId = action.payload;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleFavoritesSidebar,
  toggleNotificationsSidebar,
  setFavoritesSidebarOpen,
  setNotificationsSidebarOpen,
  toggleSidebar,
  setSelectedBook,
} = uiSlice.actions;

export default uiSlice.reducer;
