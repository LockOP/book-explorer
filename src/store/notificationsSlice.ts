import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../types";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

// localStorage key for notifications
const NOTIFICATIONS_STORAGE_KEY = "bookExplorer_notifications";

// Simple cleanup function: remove old notifications (>7 days) and maintain 25 limit
const performCleanup = (notifications: Notification[]): Notification[] => {
  // 1. Remove notifications older than 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  let cleaned = notifications.filter(n => n.timestamp > sevenDaysAgo);
  
  // 2. Maintain max limit of 25 notifications (keep newest)
  if (cleaned.length > 25) {
    cleaned = cleaned.sort((a, b) => b.timestamp - a.timestamp).slice(0, 25);
  }
  
  if (cleaned.length !== notifications.length) {
    console.log(`🧹 Cleanup: ${notifications.length} → ${cleaned.length} notifications (removed old + enforced 25 limit)`);
  }
  
  return cleaned;
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
        
        // Perform cleanup on load (remove old + enforce 25 limit)
        const cleanedNotifications = performCleanup(validNotifications);
        if (cleanedNotifications.length !== validNotifications.length) {
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
      // Read fresh data from localStorage before making changes
      const currentNotifications = loadNotificationsFromStorage();
      
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      
      currentNotifications.unshift(notification);

      // Apply cleanup (remove old + enforce 25 limit)
      const cleanedNotifications = performCleanup(currentNotifications);
      
      // Update Redux state with fresh data
      state.notifications = cleanedNotifications;
      state.unreadCount = calculateUnreadCount(cleanedNotifications);
      
      saveNotificationsToStorage(cleanedNotifications);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      // Read fresh data from localStorage before making changes
      const currentNotifications = loadNotificationsFromStorage();
      
      const notification = currentNotifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
      }
      
      // Update Redux state with fresh data
      state.notifications = currentNotifications;
      state.unreadCount = calculateUnreadCount(currentNotifications);
      
      saveNotificationsToStorage(currentNotifications);
    },
    markAllAsRead: (state) => {
      // Read fresh data from localStorage before making changes
      const currentNotifications = loadNotificationsFromStorage();
      
      currentNotifications.forEach((notification) => {
        notification.read = true;
      });
      
      // Update Redux state with fresh data
      state.notifications = currentNotifications;
      state.unreadCount = 0;
      
      saveNotificationsToStorage(currentNotifications);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      // Read fresh data from localStorage before making changes
      const currentNotifications = loadNotificationsFromStorage();
      
      const filteredNotifications = currentNotifications.filter(
        (n) => n.id !== action.payload
      );
      
      // Update Redux state with fresh data
      state.notifications = filteredNotifications;
      state.unreadCount = calculateUnreadCount(filteredNotifications);
      
      saveNotificationsToStorage(filteredNotifications);
    },
    clearNotifications: (state) => {
      const emptyNotifications: Notification[] = [];
      
      // Update Redux state
      state.notifications = emptyNotifications;
      state.unreadCount = 0;
      
      saveNotificationsToStorage(emptyNotifications);
    },
    performAutomaticCleanup: (state) => {
      // Read fresh data from localStorage before making changes
      const currentNotifications = loadNotificationsFromStorage();
      
      // Apply simple cleanup (remove old + enforce 25 limit)
      const cleanedNotifications = performCleanup(currentNotifications);
      
      // Update Redux state with fresh data
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
