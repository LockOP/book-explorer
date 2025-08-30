import React, { useEffect, useRef } from "react";
import {
  X,
  Bell,
  Trash2,
  CheckCheck,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { toggleNotificationsSidebar } from "../store/uiSlice";
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
} from "../store/notificationsSlice";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Notification } from "../types";

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

const NotificationSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notificationsSidebarOpen } = useAppSelector((state: any) => state.ui);
  const { notifications, unreadCount } = useAppSelector(
    (state: any) => state.notifications
  );
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    dispatch(toggleNotificationsSidebar());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        notificationsSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(target)
      ) {
        const notificationsButton = target.closest(
          "[data-notifications-trigger]"
        );
        if (!notificationsButton) {
          handleClose();
        }
      }
    };

    if (notificationsSidebarOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsSidebarOpen]);

  const handleNotificationClick = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    if (notifications.length > 0) {
      dispatch(clearNotifications());
    }
  };

  if (!notificationsSidebarOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">
              Notifications ({unreadCount})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 p-4 border-b border-border">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="flex-1"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No notifications
              </h3>
              <p className="text-muted-foreground text-sm">
                You're all caught up! Notifications will appear here when you
                interact with the app.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification: Notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`font-medium text-sm line-clamp-1 ${
                              !notification.read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNotification(notification.id);
                            }}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.timestamp)}
                          {!notification.read && (
                            <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;
