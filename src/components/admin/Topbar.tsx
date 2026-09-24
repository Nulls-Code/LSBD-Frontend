"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar() {
  const [user, setUser] = useState<{ name: string; role: string; initials: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
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
          // Handle standard REST API response structures
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
        const role = detail.role || user?.role || "ADMIN";
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
        setUser({ name: name || "Staff User", role, initials });
      }
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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
      // Regardless of API success, clear out and redirect to login
      router.push("/login");
      router.refresh(); // Refresh to ensure middleware re-evaluates the new cookie state
    }
  };

  const displayName = user?.name || "Admin User";
  const displayRole = user?.role || "Admin";


  return (
    <div className="h-16 bg-[#0B132B] border-b border-slate-800/50 flex items-center justify-between px-6 shrink-0">
      <div className="flex-1 max-w-xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-400 focus:outline-none focus:bg-slate-800 focus:border-slate-600 focus:ring-1 focus:ring-slate-600 sm:text-sm transition-colors"
            placeholder="Search tracking number and press Enter..."
          />
        </form>
      </div>

      <div className="flex items-center gap-6">
        {/* Profile with Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none hover:opacity-90 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
              {user?.initials || "AH"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white text-xs font-semibold leading-tight">{user?.name || "Aminul Haque"}</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase leading-tight">{user?.role || "ADMIN"}</span>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 ml-0.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#1E293B] border border-slate-700 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
