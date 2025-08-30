import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "./booksSlice";
import favoritesReducer from "./favoritesSlice";
import notificationsReducer from "./notificationsSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    books: booksReducer,
    favorites: favoritesReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
