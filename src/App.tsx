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
import { useBookPolling } from "./hooks/useBookPolling";
import { fetchBooks, updateFiltersFromURL } from "./store/booksSlice";
import { useUrlState } from "./hooks/useUrlState";
import { SortOption } from "./types";

function AppContent() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state: any) => state.ui);
  const { getStateFromURL } = useUrlState();
  
  // Initialize book polling (polls every 10 seconds)
  const { isPolling } = useBookPolling(10000);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // Get initial state from URL
    const urlState = getStateFromURL();
    console.log("🏗️ App.tsx initializing with URL state:", urlState);
    
    // Update store with URL state
    console.log("🏗️ App.tsx dispatching updateFiltersFromURL:", urlState);
    dispatch(updateFiltersFromURL(urlState));
    
    const searchParams = {
      query: urlState.search,
      offset: 0,
      limit: 20,
      sort: urlState.sortBy,
    };
    console.log("🏗️ App.tsx fetching books with params:", searchParams);
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
