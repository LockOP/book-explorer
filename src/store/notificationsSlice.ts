import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

// localStorage key for notifications
const NOTIFICATIONS_STORAGE_KEY = "bookExplorer_notifications";

// Clean up old notifications (older than 7 days)
const cleanupOldNotifications = (notifications: Notification[]): Notification[] => {
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return notifications.filter(n => n.timestamp > sevenDaysAgo);
};

// Load notifications from localStorage
const loadNotificationsFromStorage = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const notifications = JSON.parse(stored);
      // Validate that it's an array and has the right structure
      if (Array.isArray(notifications)) {
        const validNotifications = notifications.filter((n: any) => 
          n && typeof n === 'object' && 
          n.id && n.title && n.message && n.type && 
          typeof n.timestamp === 'number' && 
          typeof n.read === 'boolean'
        );
        
        // Clean up old notifications on load
        const cleanedNotifications = cleanupOldNotifications(validNotifications);
        if (cleanedNotifications.length !== validNotifications.length) {
          console.log(`🧹 Cleaned up ${validNotifications.length - cleanedNotifications.length} old notifications`);
          // Save the cleaned notifications back to localStorage
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

// Save notifications to localStorage
const saveNotificationsToStorage = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Failed to save notifications to localStorage:", error);
  }
};

// Calculate unread count from notifications
const calculateUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length;
};

// Load initial state from localStorage
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
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Keep only the last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
      saveNotificationsToStorage(state.notifications);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
      saveNotificationsToStorage(state.notifications);
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
      saveNotificationsToStorage(state.notifications);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      saveNotificationsToStorage(state.notifications);
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      saveNotificationsToStorage(state.notifications);
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
