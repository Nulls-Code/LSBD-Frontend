"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { NotificationItem } from "@/lib/types";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead as apiMarkRead,
  markAllNotificationsAsRead as apiMarkAllRead,
  deleteNotification as apiDeleteNotification,
} from "@/lib/api";

interface NotificationContextType {
  unreadCount: number;
  notifications: NotificationItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  fetchRecent: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const isPollingRef = useRef<boolean>(false);

  // Fetch unread count from API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await fetchUnreadCount();
      if (res && res.success && res.data) {
        setUnreadCount(res.data.count ?? 0);
      }
    } catch {
      // Gracefully handle auth/network issues without crashing
    }
  }, []);

  // Fetch recent notifications (top 15 for dropdown)
  const fetchRecent = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchNotifications(1, 15);
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  // Combined refresh
  const refresh = useCallback(async () => {
    await Promise.allSettled([refreshUnreadCount(), fetchRecent()]);
  }, [refreshUnreadCount, fetchRecent]);

  // Initial load & Polling
  useEffect(() => {
    refresh();

    // Fast polling every 45s for badge accuracy
    const interval = setInterval(() => {
      if (!document.hidden && !isPollingRef.current) {
        isPollingRef.current = true;
        refreshUnreadCount().finally(() => {
          isPollingRef.current = false;
        });
      }
    }, 45000);

    // Refresh immediately when window regains visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUnreadCount();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("notification-refresh", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("notification-refresh", refresh);
    };
  }, [refresh, refreshUnreadCount]);

  // Optimistic Mark Single As Read
  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiMarkRead(id);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      // Revert on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: null } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Optimistic Mark All As Read
  const markAllAsRead = async () => {
    const previous = [...notifications];
    const previousCount = unreadCount;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await apiMarkAllRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
      // Revert on failure
      setNotifications(previous);
      setUnreadCount(previousCount);
    }
  };

  // Optimistic Delete Notification
  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const previous = [...notifications];
    const wasUnread = target ? !target.isRead : false;

    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiDeleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification", err);
      // Revert on failure
      setNotifications(previous);
      if (wasUnread) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        isLoading,
        isRefreshing,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
        fetchRecent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
