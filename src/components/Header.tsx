import React from "react";
import { BookOpen, Moon, Sun, Heart, Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  toggleTheme,
  toggleFavoritesSidebar,
  toggleNotificationsSidebar,
} from "../store/uiSlice";

import { notificationService } from "../services/notificationService";
import { Button } from "./ui/button";

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, favoritesSidebarOpen, notificationsSidebarOpen } =
    useAppSelector((state: any) => state.ui);
  const { unreadCount } = useAppSelector(
    (state: any) => state.notifications
  );
  const { bookIds } = useAppSelector((state: any) => state.favorites);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    const newTheme = theme === "light" ? "dark" : "light";
    notificationService.notifyThemeChanged(newTheme);
  };

  return (
    <>
      <header className="bg-card border-b border-border w-full">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground hidden md:block">
                Book Explorer
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="h-10 w-10"
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleNotificationsSidebar())}
                className="h-10 w-10 relative"
                data-notifications-trigger
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleFavoritesSidebar())}
                className="h-10 w-10 relative"
                data-favorites-trigger
              >
                <Heart className="h-5 w-5" />
                {bookIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {bookIds.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
