import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { toast } from "sonner";
import { BookChange } from "../types";
import { NOTIFICATION_CONFIG } from "../config";

const lastNotificationTimes: Record<string, number> = {};

const canShowNotification = (notificationType: string): boolean => {
  const now = Date.now();
  const lastTime = lastNotificationTimes[notificationType] || 0;
  const timeSinceLastNotification = now - lastTime;

  if (timeSinceLastNotification >= NOTIFICATION_CONFIG.COOLDOWN_DURATION) {
    lastNotificationTimes[notificationType] = now;
    return true;
  }

  return false;
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

const notifyMultipleBookChanges = async (
  changes: BookChange[]
): Promise<void> => {
  if (changes.length === 0) return;

  const addBookCount = changes.filter((c) => c.kind === "add-book").length;
  const editBookCount = changes.filter((c) => c.kind === "edit-book").length;

  if (addBookCount > 0) {
    const notificationType = "new-books-added";
    if (canShowNotification(notificationType)) {
      const title = `New Books Added`;
      const message = `Some new books have been added to Open Library`;

      store.dispatch(
        addNotification({
          title,
          message,
          type: "info",
        })
      );

      toast.info(title, {
        description: message,
        duration: 5000,
      });
    }
  }

  if (editBookCount > 0) {
    const notificationType = "books-updated";
    if (canShowNotification(notificationType)) {
      const title = `Books Updated`;
      const message = `Some books have been updated in Open Library`;

      store.dispatch(
        addNotification({
          title,
          message,
          type: "info",
        })
      );

      toast.info(title, {
        description: message,
        duration: 5000,
      });
    }
  }
};

export const notificationService = {
  notifyFavoriteAdded,
  notifyFavoriteRemoved,
  notifySearchResultsUpdated,
  notifySortChanged,
  notifyViewModeChanged,
  notifyThemeChanged,
  notifyMultipleBookChanges,
};
