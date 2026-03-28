import { useState, useEffect, useCallback, useRef } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import type { Notification } from "../../types";
import { useAuth } from "../auth/useAuth";

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const intervalRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await client.get(endpoints.notifications.unreadCount);
      setUnreadCount(res.data.count);
    } catch {
      // silently ignore — polling errors should not surface to the user
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(endpoints.notifications.getAll);
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchUnreadCount]);

  // Load full list when panel opens
  const handleOpen = useCallback(async () => {
    setOpen(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await client.put(endpoints.notifications.markRead(id));
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silently ignore — notification stays unread if request fails
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await client.put(endpoints.notifications.markAllRead);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently ignore — user can retry
    }
  }, []);

  return {
    notifications,
    unreadCount,
    open,
    loading,
    setOpen,
    handleOpen,
    markAsRead,
    markAllAsRead,
  };
}
