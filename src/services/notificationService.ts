import { store } from "../store";
import { addNotification } from "../store/notificationsSlice";
import { toast } from "sonner";
import { NotificationType, BookChange } from "../types";
import axios from "axios";

// Global notification deduplication - track last notification time for each type
const lastNotificationTimes: Record<string, number> = {};
const NOTIFICATION_COOLDOWN = 3000; // 3 seconds

// Check if enough time has passed since last notification of this type
const canShowNotification = (notificationType: string): boolean => {
  const now = Date.now();
  const lastTime = lastNotificationTimes[notificationType] || 0;
  const timeSinceLastNotification = now - lastTime;
  
  if (timeSinceLastNotification >= NOTIFICATION_COOLDOWN) {
    lastNotificationTimes[notificationType] = now;
    return true;
  }
  
  console.log(`⏰ Notification deduplication: ${notificationType} shown ${Math.round(timeSinceLastNotification / 1000)}s ago, waiting ${Math.round((NOTIFICATION_COOLDOWN - timeSinceLastNotification) / 1000)}s more`);
  return false;
};

// Generic function to show any notification with deduplication
const showNotificationWithDeduplication = (
  notificationType: string,
  title: string,
  message: string,
  toastType: "info" | "success" | "warning" | "error" = "info",
  duration: number = 5000
): void => {
  if (canShowNotification(notificationType)) {
    // Add to Redux store for sidebar
    store.dispatch(addNotification({
      title,
      message,
      type: toastType as NotificationType,
    }));

    // Show toast notification
    toast[toastType](title, {
      description: message,
      duration,
    });
    
    console.log(`🔔 [${notificationType}] Notification shown (deduplication passed)`);
  } else {
    console.log(`🔕 [${notificationType}] Notification blocked by deduplication`);
  }
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

export const notifyBookChange = async (change: BookChange): Promise<void> => {
  let title = "Book Change";
  let message = "A book change has been detected";

  // Try to get book title from the change data or fetch it
  if (change.data?.work?.title) {
    title = change.data.work.title;
  } else if (change.data?.edition?.title) {
    title = change.data.edition.title;
  } else if (change.changes && change.changes.length > 0) {
    // Try to fetch book details using the first change key
    try {
      const bookKey = change.changes[0].key;
      if (bookKey && bookKey.startsWith('/books/')) {
        const response = await axios.get(`https://openlibrary.org${bookKey}.json`);
        if (response.data.title) {
          title = response.data.title;
        }
      }
    } catch (error) {
      console.warn("Could not fetch book title:", error);
    }
  }

  // Set appropriate message based on change type
  switch (change.kind) {
    case "add-book":
      title = `📚 New Book Added: ${title}`;
      message = `A new book "${title}" has been added to Open Library`;
      break;
    case "edit-book":
      title = `✏️ Book Updated: ${title}`;
      message = `Book "${title}" has been updated in Open Library`;
      break;
    default:
      title = `📖 Book Change: ${title}`;
      message = `Book "${title}" has been modified in Open Library`;
  }

  // Add to Redux store
  store.dispatch(addNotification({
    title,
    message,
    type: "info",
  }));

  // Show toast notification
  toast.info(title, {
    description: message,
    duration: 5000,
  });
};

export const notifyMultipleBookChanges = async (changes: BookChange[]): Promise<void> => {
  if (changes.length === 0) return;

  // Count changes by type
  const addBookCount = changes.filter(c => c.kind === "add-book").length;
  const editBookCount = changes.filter(c => c.kind === "edit-book").length;

  // Show summary notifications only - much cleaner UX
  if (addBookCount > 0) {
    const notificationType = "new-books-added";
    if (canShowNotification(notificationType)) {
      const title = `📚 New Books Added`;
      const message = `Some new books have been added to Open Library`;
      
      store.dispatch(addNotification({
        title,
        message,
        type: "info",
      }));

      toast.info(title, {
        description: message,
        duration: 5000,
      });
      
      console.log(`🔔 [${notificationType}] Notification shown (deduplication passed)`);
    } else {
      console.log(`🔕 [${notificationType}] Notification blocked by deduplication`);
    }
  }

  if (editBookCount > 0) {
    const notificationType = "books-updated";
    if (canShowNotification(notificationType)) {
      const title = `✏️ Books Updated`;
      const message = `Some books have been updated in Open Library`;
      
      store.dispatch(addNotification({
        title,
        message,
        type: "info",
      }));

      toast.info(title, {
        description: message,
        duration: 5000,
      });
      
      console.log(`🔔 [${notificationType}] Notification shown (deduplication passed)`);
    } else {
      console.log(`🔕 [${notificationType}] Notification blocked by deduplication`);
    }
  }

  console.log(`🔔 Showing summary notifications: ${addBookCount} new books, ${editBookCount} updated books`);
};

// Helper function to format time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
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
  notifyBookChange,
  notifyMultipleBookChanges,
  isSupported,
};
