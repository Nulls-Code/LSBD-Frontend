"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, LogOut, Bell, Star, AlertTriangle, ClipboardList, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

export function Topbar() {
  const [user, setUser] = useState<{ name: string; role: string; initials: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#0B1E36]" />
          </button>

          {/* Notifications Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-[#0F223D] border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Operational Alerts</span>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/admin/requests?status=PENDING"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors"
                >
                  <ClipboardList className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-amber-200">Requests awaiting review</div>
                    <div className="text-[11px] text-amber-300/80">Pending orders require staff verification</div>
                  </div>
                </Link>

                <Link
                  href="/admin/shipments?currentStatus=ON_HOLD"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-rose-200">Shipments need intervention</div>
                    <div className="text-[11px] text-rose-300/80">Customs hold or failed deliveries reported</div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 text-slate-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All network transit hubs operational</span>
                </div>
              </div>
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
