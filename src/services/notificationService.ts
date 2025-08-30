import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { toast } from "sonner";
import { NotificationType } from "../types";

let pollInterval: NodeJS.Timeout | null = null;
let isPolling = false;

const checkForSystemNotifications = async () => {
  try {
    const shouldNotify = Math.random() < 0.15;

    if (shouldNotify) {
      const notificationTypes = [
        {
          type: "info" as const,
          title: "New Books Available",
          message: "Check out the latest additions to our collection!",
        },
        {
          type: "success" as const,
          title: "Search Index Updated",
          message: "Your search results have been refreshed with new data.",
        },
        {
          type: "warning" as const,
          title: "API Status",
          message: "Some book data may be temporarily unavailable.",
        },
      ];

      const randomNotification =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

      store.dispatch(addNotification(randomNotification));

      if (randomNotification.type === "success") {
        toast.success(randomNotification.title, {
          description: randomNotification.message,
        });
      } else if (randomNotification.type === "warning") {
        toast.warning(randomNotification.title, {
          description: randomNotification.message,
        });
      } else {
        toast.info(randomNotification.title, {
          description: randomNotification.message,
        });
      }
    }
  } catch (error) {
    console.error("Error checking for system notifications:", error);
  }
};

const startPolling = () => {
  if (isPolling) return;

  isPolling = true;
  pollInterval = setInterval(() => {
    checkForSystemNotifications();
  }, 10000);
};

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  isPolling = false;
};

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


const addTestNotification = (
  type: NotificationType,
  title: string,
  message: string
) => {
  const notification = { type, title, message };
  store.dispatch(addNotification(notification));

  if (type === "success") {
    toast.success(title, { description: message });
  } else if (type === "error") {
    toast.error(title, { description: message });
  } else if (type === "warning") {
    toast.warning(title, { description: message });
  } else {
    toast.info(title, { description: message });
  }
};

const isSupported = () => {
  return true;
};

export const notificationService = {
  startPolling,
  stopPolling,
  notifyFavoriteAdded,
  notifyFavoriteRemoved,
  notifySearchResultsUpdated,
  notifyNewRecommendations,
  notifyThemeChanged,
  addTestNotification,
  isSupported,
};
