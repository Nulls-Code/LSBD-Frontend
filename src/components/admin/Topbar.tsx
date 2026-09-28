"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  ChevronDown, 
  LogOut, 
  Bell, 
  Star, 
  ClipboardList, 
  Truck, 
  UserCheck, 
  Check, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  BellOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useNotifications } from "@/context/NotificationContext";

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

function getNotificationVisuals(type: string, metadata?: Record<string, any> | null) {
  if (type.startsWith("REQUEST_")) {
    return {
      icon: ClipboardList,
      iconColor: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      href: "/admin/requests",
      label: "Request",
    };
  }
  if (type.startsWith("SHIPMENT_") || type.startsWith("TRACKING_")) {
    const trackingNum = metadata?.trackingNumber;
    return {
      icon: Truck,
      iconColor: "text-blue-400",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      href: trackingNum ? `/admin/shipments?trackingNumber=${encodeURIComponent(trackingNum)}` : "/admin/shipments",
      label: "Shipment",
    };
  }
  if (type.startsWith("USER_")) {
    return {
      icon: UserCheck,
      iconColor: "text-purple-400",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      href: type === "USER_PASSWORD_RESET" ? "/admin/profile" : "/admin/users",
      label: "Account",
    };
  }
  return {
    icon: Bell,
    iconColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    href: "/admin/notifications",
    label: "Alert",
  };
}

export function Topbar() {
  const [user, setUser] = useState<{ name: string; role: string; initials: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    unreadCount,
    notifications,
    isLoading: isNotifLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchRecent,
  } = useNotifications();

  const handleToggleNotifications = () => {
    if (!isNotificationsOpen) {
      fetchRecent();
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/shipments?trackingNumber=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const userData = data?.data?.user || data?.data || data?.user || data;

          if (userData && (userData.name || userData.fullName || userData.firstName)) {
            const name = userData.name || userData.fullName || `${userData.firstName} ${userData.lastName || ""}`.trim();
            const role = userData.role || userData.roleName || "Admin";

            let initials = "U";
            if (name) {
              initials = name
                .split(" ")
                .filter(Boolean)
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
            }

            setUser({ name, role, initials });
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    fetchUser();

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const detail = customEvent.detail;
        const name = detail.fullName || `${detail.firstName || ""} ${detail.lastName || ""}`.trim();
        let initials = "U";
        if (name) {
          initials = name
            .split(" ")
            .filter(Boolean)
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
        }
        setUser((prev) => {
          const role = detail.role || prev?.role || "ADMIN";
          return { name: name || prev?.name || "Staff Member", role, initials: initials || prev?.initials || "U" };
        });
      }
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const displayName = user?.name || "Staff Member";
  const displayRole = user?.role || "Staff";

  return (
    <header className="h-16 bg-[#0B1E36] border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
      {/* Mobile Branding (Visible only on mobile < md) */}
      <div className="flex md:hidden items-center gap-2">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-emerald-500 text-emerald-500" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-xs tracking-wider">LOGISTIC</span>
            <span className="text-emerald-400 text-[8.5px] font-bold tracking-widest leading-none">STAR BD LTD.</span>
          </div>
        </Link>
      </div>

      {/* Desktop Search Bar (Visible only on md+) */}
      <div className="hidden md:block flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-[#0F223D] text-slate-200 placeholder-slate-400 focus:outline-none focus:bg-[#132A4B] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
            placeholder="Search tracking number and press Enter..."
          />
        </form>
      </div>

      {/* Right Controls: Role Pill, Bell Icon, Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Role Pill Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          {/* Mobile Role Pill (Exact from screenshot) */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex md:hidden items-center gap-1.5 bg-[#12233D] hover:bg-[#182F52] border border-slate-700/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span className="font-medium capitalize">{displayRole.toLowerCase()}</span>
            <ChevronDown className={clsx("h-3 w-3 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {/* Desktop Full Profile Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="hidden md:flex items-center gap-3 focus:outline-none hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {user?.initials || "U"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white text-xs font-semibold leading-tight">{displayName}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase leading-tight">{displayRole}</span>
            </div>
            <ChevronDown className={clsx("h-3.5 w-3.5 text-slate-400 ml-0.5 transition-transform", isDropdownOpen && "rotate-180")} />
          </button>

          {/* User Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 bg-[#0F223D] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-700/60 mb-1">
                <div className="text-xs font-semibold text-white truncate">{displayName}</div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{displayRole}</div>
              </div>

              <Link
                href="/admin/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors"
              >
                Profile & Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className="relative p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#0B1E36] animate-in zoom-in-75">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 -mr-12 sm:mr-0 mt-2.5 w-80 sm:w-96 bg-[#0F223D] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-700/60 bg-[#0B1E36]/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="p-2 max-h-[380px] overflow-y-auto space-y-1.5">
                {isNotifLoading && notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <div>Loading notifications...</div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <BellOff className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-60" />
                    <div className="text-xs font-semibold text-slate-200">No notifications yet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">You're all caught up with everything!</div>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const visuals = getNotificationVisuals(item.type, item.metadata);
                    const Icon = visuals.icon;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (!item.isRead) markAsRead(item.id);
                          setIsNotificationsOpen(false);
                          if (visuals.href) router.push(visuals.href);
                        }}
                        className={clsx(
                          "group relative flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer text-left",
                          !item.isRead
                            ? "bg-[#132A4B]/80 border-blue-500/40 hover:bg-[#173259]"
                            : "bg-slate-800/25 border-slate-700/40 hover:bg-slate-800/50"
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            visuals.bgClass
                          )}
                        >
                          <Icon className={clsx("w-4 h-4", visuals.iconColor)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-100 truncate">
                              {item.title}
                            </span>
                            {!item.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300/90 line-clamp-2 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300">
                              {visuals.label}
                            </span>
                          </div>
                        </div>

                        {/* Hover Quick Action Buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {!item.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(item.id);
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(item.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            title="Delete"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <Link
                href="/admin/notifications"
                onClick={() => setIsNotificationsOpen(false)}
                className="block text-center py-2.5 px-3 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-[#0B1E36]/80 hover:bg-[#0E2544] border-t border-slate-700/60 transition-colors"
              >
                View all notifications &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Avatar Button (Visible on mobile next to Bell) */}
        <div className="flex md:hidden">
          <Link
            href="/admin/profile"
            className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm hover:ring-2 hover:ring-blue-400 transition-all"
            title="Profile"
          >
            {user?.initials || "U"}
          </Link>
        </div>
      </div>
    </header>
  );
}
