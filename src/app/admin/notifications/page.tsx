"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  RefreshCw,
  Truck,
  ClipboardList,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Inbox,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/api";
import { NotificationItem, PaginatedMeta } from "@/lib/types";
import { useNotifications } from "@/context/NotificationContext";

type FilterTab = "ALL" | "UNREAD" | "SHIPMENTS" | "REQUESTS" | "STAFF";

function formatFullTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 45) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getNotificationCategory(type: string): "SHIPMENT" | "REQUEST" | "STAFF" | "OTHER" {
  if (type.startsWith("SHIPMENT_") || type.startsWith("TRACKING_")) return "SHIPMENT";
  if (type.startsWith("REQUEST_")) return "REQUEST";
  if (type.startsWith("USER_")) return "STAFF";
  return "OTHER";
}

function getNotificationMeta(item: NotificationItem) {
  const type = item.type;
  if (type.startsWith("REQUEST_")) {
    return {
      icon: ClipboardList,
      iconColor: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/20",
      href: "/admin/requests",
      categoryName: "Courier Request",
      actionText: "View Request",
    };
  }
  if (type.startsWith("SHIPMENT_") || type.startsWith("TRACKING_")) {
    const trackingNum = item.metadata?.trackingNumber;
    return {
      icon: Truck,
      iconColor: "text-blue-400",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/20",
      href: trackingNum
        ? `/admin/shipments?trackingNumber=${encodeURIComponent(trackingNum)}`
        : "/admin/shipments",
      categoryName: "Shipment",
      actionText: "View Shipment",
    };
  }
  if (type.startsWith("USER_")) {
    const isReset = type === "USER_PASSWORD_RESET";
    return {
      icon: UserCheck,
      iconColor: "text-purple-400",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/20",
      href: isReset ? "/admin/profile" : "/admin/users",
      categoryName: "Staff & Account",
      actionText: isReset ? "View Profile" : "View Staff",
    };
  }
  return {
    icon: Bell,
    iconColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    href: "/admin/notifications",
    categoryName: "System Alert",
    actionText: "Details",
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { unreadCount: globalUnreadCount, refresh: refreshGlobalContext } = useNotifications();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Load paginated notifications from backend
  const loadNotifications = useCallback(
    async (currentPage: number, unreadOnly?: boolean) => {
      setIsLoading(true);
      try {
        const res = await fetchNotifications(currentPage, limit, unreadOnly);
        if (res && res.success) {
          setItems(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (err) {
        console.error("Failed to load notifications page data", err);
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    const unreadOnly = activeTab === "UNREAD" ? true : undefined;
    loadNotifications(page, unreadOnly);
  }, [page, activeTab, loadNotifications]);

  // Tab switch handler
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Mark single read
  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item))
    );
    try {
      await markNotificationAsRead(id);
      refreshGlobalContext();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      loadNotifications(page, activeTab === "UNREAD" ? true : undefined);
    }
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    setIsActionLoading(true);
    setItems((prev) =>
      prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() }))
    );
    try {
      await markAllNotificationsAsRead();
      refreshGlobalContext();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setIsActionLoading(false);
      loadNotifications(page, activeTab === "UNREAD" ? true : undefined);
    }
  };

  // Delete notification
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
    setMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    try {
      await deleteNotification(id);
      refreshGlobalContext();
    } catch (err) {
      console.error("Failed to delete notification", err);
      loadNotifications(page, activeTab === "UNREAD" ? true : undefined);
    }
  };

  // Filtered items (by tab category and search query)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter for non-backend filtered tabs
      if (activeTab === "SHIPMENTS" && getNotificationCategory(item.type) !== "SHIPMENT") return false;
      if (activeTab === "REQUESTS" && getNotificationCategory(item.type) !== "REQUEST") return false;
      if (activeTab === "STAFF" && getNotificationCategory(item.type) !== "STAFF") return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const msgMatch = item.message.toLowerCase().includes(query);
        const trackingMatch = item.metadata?.trackingNumber
          ? String(item.metadata.trackingNumber).toLowerCase().includes(query)
          : false;
        return titleMatch || msgMatch || trackingMatch;
      }
      return true;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1E36] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Center</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Real-time operational alerts, requests, shipment milestones, and system events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => loadNotifications(page, activeTab === "UNREAD" ? true : undefined)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin text-blue-400")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {globalUnreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xs">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabChange("ALL")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "ALL"
                ? "bg-[#0B1E36] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            All Activity
          </button>
          <button
            onClick={() => handleTabChange("UNREAD")}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "UNREAD"
                ? "bg-[#0B1E36] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <span>Unread</span>
            {globalUnreadCount > 0 && (
              <span
                className={clsx(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  activeTab === "UNREAD" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-600"
                )}
              >
                {globalUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("SHIPMENTS")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "SHIPMENTS"
                ? "bg-[#0B1E36] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            Shipments
          </button>
          <button
            onClick={() => handleTabChange("REQUESTS")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "REQUESTS"
                ? "bg-[#0B1E36] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            Requests
          </button>
          <button
            onClick={() => handleTabChange("STAFF")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
              activeTab === "STAFF"
                ? "bg-[#0B1E36] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            Staff & System
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, message or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm font-medium">Loading notifications...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">No notifications found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No notifications matching "${searchQuery}". Try a different keyword.`
                  : activeTab === "UNREAD"
                  ? "You have read all your notifications. Nothing requires your immediate action!"
                  : "There is no notification activity in this view right now."}
              </p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const metaInfo = getNotificationMeta(item);
            const Icon = metaInfo.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) handleMarkRead(item.id);
                  if (metaInfo.href) router.push(metaInfo.href);
                }}
                className={clsx(
                  "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer",
                  !item.isRead
                    ? "bg-white border-blue-200 shadow-sm hover:border-blue-300 hover:shadow-md ring-1 ring-blue-500/10"
                    : "bg-white/70 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-xs"
                )}
              >
                {/* Left side: Icon + Texts */}
                <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div
                    className={clsx(
                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs",
                      metaInfo.bgClass
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", metaInfo.iconColor)} />
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Unread
                        </span>
                      )}
                      <span
                        className={clsx(
                          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          metaInfo.badgeClass
                        )}
                      >
                        {metaInfo.categoryName}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    {/* Metadata details row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400">
                      <span title={formatFullTime(item.createdAt)}>
                        {formatRelativeTime(item.createdAt)} &bull; {formatFullTime(item.createdAt)}
                      </span>

                      {item.metadata?.trackingNumber && (
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Tracking: {String(item.metadata.trackingNumber)}
                        </span>
                      )}

                      {item.metadata?.status && (
                        <span className="font-medium text-slate-600">
                          Status: {String(item.metadata.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div
                  className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={metaInfo.href}
                    onClick={() => {
                      if (!item.isRead) handleMarkRead(item.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>{metaInfo.actionText}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>

                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(item.id, e)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
          <div className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-700">{meta.page}</span> of{" "}
            <span className="font-bold text-slate-700">{meta.totalPages}</span> ({meta.total} total items)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page >= meta.totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
