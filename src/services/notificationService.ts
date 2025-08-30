import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { toast } from "sonner";
import { NotificationType } from "../types";











const notifyFavoriteAdded = (bookTitle: string) => {
  const notification = {
    type: "success" as const,
    title: "Book Added to Favorites",
    message: `"${bookTitle}" has been added to your favorites!`,
  };

  store.dispatch(addNotification(notification));
  toast.success(notification.title, {
    description: notification.message,
  });
};

const notifyFavoriteRemoved = (bookTitle: string) => {
  const notification = {
    type: "info" as const,
    title: "Book Removed from Favorites",
    message: `"${bookTitle}" has been removed from your favorites.`,
  };

  store.dispatch(addNotification(notification));

  toast.info(notification.title, {
    description: notification.message,
  });
};

const notifySearchResultsUpdated = (query: string, resultCount: number) => {
  const notification = {
    type: "info" as const,
    title: "Search Results Updated",
    message: `Found ${resultCount} books for "${query}"`,
  };

  store.dispatch(addNotification(notification));


  toast.info(notification.title, {
    description: notification.message,
  });
};


const notifyNewRecommendations = () => {
  const notification = {
    type: "info" as const,
    title: "New Recommendations",
    message: "Check out these new book recommendations!",
  };

  store.dispatch(addNotification(notification));


  toast.info(notification.title, {
    description: notification.message,
  });
};


const notifyThemeChanged = (theme: "light" | "dark") => {
  const notification = {
    type: "success" as const,
    title: "Theme Updated",
    message: `Switched to ${theme} theme`,
  };

  store.dispatch(addNotification(notification));
  toast.success(notification.title, {
    description: notification.message,
  });
};

const notifySortChanged = (sortLabel: string) => {
  const notification = {
    type: "info" as const,
    title: "Sort Order Changed",
    message: `Books now sorted by: ${sortLabel}`,
  };

  store.dispatch(addNotification(notification));
  toast.info(notification.title, {
    description: notification.message,
  });
};

const notifyViewModeChanged = (mode: "grid" | "list") => {
  const notification = {
    type: "info" as const,
    title: "View Mode Changed",
    message: `Switched to ${mode} view`,
  };

  store.dispatch(addNotification(notification));
  toast.info(notification.title, {
    description: notification.message,
  });
};




const isSupported = () => {
  return true;
};

export const notificationService = {
  notifyFavoriteAdded,
  notifyFavoriteRemoved,
  notifySearchResultsUpdated,
  notifySortChanged,
  notifyViewModeChanged,
  notifyThemeChanged,
  isSupported,
};
