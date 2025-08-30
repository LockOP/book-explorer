import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import Header from "./components/Header";
import BookGrid from "./components/BookGrid";
import SearchBar from "./components/SearchBar";
import FavoritesSidebar from "./components/FavoritesSidebar";
import NotificationSidebar from "./components/NotificationSidebar";
import BookDetailsModal from "./components/BookDetailsModal";
import { Toaster } from "./components/ui/sonner";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { useBookPolling } from "./hooks/bookPolling";
import { fetchBooks, updateFiltersFromURL } from "./store/booksSlice";
import { useUrlState } from "./hooks/urlState";
import { DEFAULT_VALUES } from "./config";

function AppContent() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state: any) => state.ui);
  const { getStateFromURL } = useUrlState();

  const { isPolling } = useBookPolling();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const urlState = getStateFromURL();
    dispatch(updateFiltersFromURL(urlState));

    const searchParams = {
      query: urlState.search,
      offset: DEFAULT_VALUES.SEARCH_OFFSET,
      limit: DEFAULT_VALUES.SEARCH_LIMIT,
      sort: urlState.sortBy,
    };
    dispatch(fetchBooks(searchParams));
  }, [dispatch, getStateFromURL]);

  return (
    <div className={`h-[100dvh] w-[100dvw] ${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-background text-foreground w-full h-full overflow-auto flex flex-col">
        <Header isPolling={isPolling} />
        <SearchBar />
        <BookGrid />
        <FavoritesSidebar />
        <NotificationSidebar />
        <BookDetailsModal />
        <Toaster />
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
