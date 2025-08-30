import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  theme: "light" | "dark";
  favoritesSidebarOpen: boolean;
  notificationsSidebarOpen: boolean;
  selectedBookId: string | null;
}

const loadThemeFromStorage = (): "light" | "dark" => {
  try {
    const stored = localStorage.getItem("book-explorer-theme");
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch (error) {
    console.error("Failed to load theme from storage:", error);
  }
  return "light";
};

const saveThemeToStorage = (theme: "light" | "dark") => {
  try {
    localStorage.setItem("book-explorer-theme", theme);
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
      // Close notifications sidebar when opening favorites
      if (state.favoritesSidebarOpen) {
        state.notificationsSidebarOpen = false;
      }
    },
    toggleNotificationsSidebar: (state) => {
      state.notificationsSidebarOpen = !state.notificationsSidebarOpen;
      // Close favorites sidebar when opening notifications
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
    // Legacy action for backward compatibility
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
  toggleSidebar, // Legacy action
  setSelectedBook,
} = uiSlice.actions;

export default uiSlice.reducer;
