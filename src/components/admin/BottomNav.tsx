"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, 
  ClipboardList, 
  Truck, 
  MapPin, 
  MoreHorizontal,
  Users,
  UserCog,
  Settings,
  LogOut,
  X,
  ChevronRight
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { name: "Requests", href: "/admin/requests", icon: ClipboardList },
  { name: "Shipments", href: "/admin/shipments", icon: Truck },
  { name: "Locations", href: "/admin/locations", icon: MapPin },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; initials: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const userData = data?.data?.user || data?.data || data?.user || data;
          if (userData) {
            const name = userData.name || userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Admin";
            const role = userData.role || "ADMIN";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "U";
            setUser({ name, role, initials });
          }
        }
      } catch (err) {
        console.error("Failed to load user profile in bottom nav", err);
      }
    };
    fetchUser();
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

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

  const isAdmin = !user || user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isMoreActive = pathname.startsWith("/admin/customers") || 
                       pathname.startsWith("/admin/users") || 
                       pathname.startsWith("/admin/profile");

  return (
    <>
      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav 
        aria-label="Mobile Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0B1E36] border-t border-slate-800/80 md:hidden pb-[env(safe-area-inset-bottom)] shadow-lg"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "relative flex flex-col items-center justify-center h-full w-full gap-1 transition-colors",
                  isActive ? "text-sky-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-normal"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-sky-400 rounded-full" />
                )}
                <Icon className={clsx("h-5 w-5", isActive ? "text-sky-400" : "text-slate-400")} />
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}

          {/* More Action Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={clsx(
              "relative flex flex-col items-center justify-center h-full w-full gap-1 transition-colors cursor-pointer",
              isMoreActive || isMoreOpen ? "text-sky-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-normal"
            )}
          >
            {(isMoreActive || isMoreOpen) && (
              <span className="absolute top-0 w-8 h-0.5 bg-sky-400 rounded-full" />
            )}
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-up Drawer for "More" options on Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Sheet */}
          <div className="relative z-10 bg-[#0F223D] border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Handle Bar */}
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-1" />

            {/* Header / User Card */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.initials || "U"}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{user?.name || "Staff Member"}</div>
                  <div className="text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                    {user?.role || "ADMIN"}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Navigation Links */}
            <div className="space-y-1 py-1">
              <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase px-2 mb-2">
                Additional Modules
              </div>

              <Link
                href="/admin/customers"
                onClick={() => setIsMoreOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                  pathname === "/admin/customers" 
                    ? "bg-slate-800 text-sky-400 font-semibold" 
                    : "text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Customers</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMoreOpen(false)}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                    pathname === "/admin/users" 
                      ? "bg-slate-800 text-sky-400 font-semibold" 
                      : "text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                      <UserCog className="w-4 h-4" />
                    </div>
                    <span>User Management</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              )}

              <Link
                href="/admin/profile"
                onClick={() => setIsMoreOpen(false)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors",
                  pathname === "/admin/profile" 
                    ? "bg-slate-800 text-sky-400 font-semibold" 
                    : "text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>Profile & Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
