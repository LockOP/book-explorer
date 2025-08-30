import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const NOTIFICATIONS_STORAGE_KEY = "bookExplorer_notifications";

const performCleanup = (notifications: Notification[]): Notification[] => {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let cleaned = notifications.filter((n) => n.timestamp > sevenDaysAgo);

  if (cleaned.length > 25) {
    cleaned = cleaned.sort((a, b) => b.timestamp - a.timestamp).slice(0, 25);
  }

  return cleaned;
};

const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);

      if (Array.isArray(notifications)) {
        const validNotifications = notifications.filter(
          (n: any) =>
            n &&
            typeof n === "object" &&
            n.id &&
            n.title &&
            n.message &&
            n.type &&
            typeof n.timestamp === "number" &&
            typeof n.read === "boolean"
        );

        const cleanedNotifications = performCleanup(validNotifications);
        if (cleanedNotifications.length !== validNotifications.length) {
          saveNotificationsToStorage(cleanedNotifications);
        }

        return cleanedNotifications;
      }
    }
  } catch (error) {
    console.error("Failed to load notifications from localStorage:", error);
  }
  return [];
};

const saveNotificationsToStorage = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  } catch (error) {
    console.error("Failed to save notifications to localStorage:", error);
  }
};

const calculateUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter((n) => !n.read).length;
};

const storedNotifications = loadNotificationsFromStorage();
const initialState: NotificationsState = {
  notifications: storedNotifications,
  unreadCount: calculateUnreadCount(storedNotifications),
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp" | "read">>
    ) => {
      const currentNotifications = loadNotificationsFromStorage();

      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };

      currentNotifications.unshift(notification);

      const cleanedNotifications = performCleanup(currentNotifications);

      state.notifications = cleanedNotifications;
      state.unreadCount = calculateUnreadCount(cleanedNotifications);

      saveNotificationsToStorage(cleanedNotifications);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const currentNotifications = loadNotificationsFromStorage();

      const notification = currentNotifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
      }

      state.notifications = currentNotifications;
      state.unreadCount = calculateUnreadCount(currentNotifications);

      saveNotificationsToStorage(currentNotifications);
    },
    markAllAsRead: (state) => {
      const currentNotifications = loadNotificationsFromStorage();

      currentNotifications.forEach((notification) => {
        notification.read = true;
      });

      state.notifications = currentNotifications;
      state.unreadCount = 0;

      saveNotificationsToStorage(currentNotifications);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const currentNotifications = loadNotificationsFromStorage();

      const filteredNotifications = currentNotifications.filter(
        (n) => n.id !== action.payload
      );

      state.notifications = filteredNotifications;
      state.unreadCount = calculateUnreadCount(filteredNotifications);

      saveNotificationsToStorage(filteredNotifications);
    },
    clearNotifications: (state) => {
      const emptyNotifications: Notification[] = [];

      state.notifications = emptyNotifications;
      state.unreadCount = 0;

      saveNotificationsToStorage(emptyNotifications);
    },
    performAutomaticCleanup: (state) => {
      const currentNotifications = loadNotificationsFromStorage();

      const cleanedNotifications = performCleanup(currentNotifications);

      state.notifications = cleanedNotifications;
      state.unreadCount = calculateUnreadCount(cleanedNotifications);

      saveNotificationsToStorage(cleanedNotifications);
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  performAutomaticCleanup,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
