import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { notificationService } from "./services/notificationService";
import Header from "./components/Header";
import BookGrid from "./components/BookGrid";
import SearchBar from "./components/SearchBar";
import FavoritesSidebar from "./components/FavoritesSidebar";
import NotificationSidebar from "./components/NotificationSidebar";
import BookDetailsModal from "./components/BookDetailsModal";
import { Toaster } from "./components/ui/sonner";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { fetchBooks } from "./store/booksSlice";
import { SortOption } from "./types";

function AppContent() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state: any) => state.ui);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const savedSearch = localStorage.getItem('bookExplorer_search') || 'type:work';
    const savedSort = (localStorage.getItem('bookExplorer_sortBy') as SortOption) || 'rating desc';
    
    const searchParams = {
      query: savedSearch || 'type:work',
      offset: 0,
      limit: 20,
      sort: savedSort,
    };
    dispatch(fetchBooks(searchParams));
  }, [dispatch]);

  return (
    <div className={`h-[100dvh] w-[100dvw] ${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-background text-foreground w-full h-full overflow-auto flex flex-col">
        <Header />
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
