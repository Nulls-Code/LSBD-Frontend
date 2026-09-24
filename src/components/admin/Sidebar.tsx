"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Truck, 
  Building2, 
  Users, 
  UserCog, 
  Settings,
  Star
} from "lucide-react";
import clsx from "clsx";

const navGroups = [
  {
    title: "OPERATIONS",
    links: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Courier Requests", href: "/admin/requests", icon: ClipboardList },
      { name: "Shipments", href: "/admin/shipments", icon: Truck },
    ]
  },
  {
    title: "NETWORK",
    links: [
      { name: "Locations", href: "/admin/locations", icon: Building2 },
      { name: "Customers", href: "/admin/customers", icon: Users },
    ]
  },
  {
    title: "ADMINISTRATION",
    links: [
      { name: "User Management", href: "/admin/users", icon: UserCog },
    ]
  },
  {
    title: "ACCOUNT",
    links: [
      { name: "Profile & Settings", href: "/admin/profile", icon: Settings },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const userData = data?.data?.user || data?.data || data?.user || data;

          if (userData) {
            const name = userData.name || userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
            const role = userData.role || "ADMIN";
            setUser({ name: name || "Aminul Haque", role });
          }
        }
      } catch (err) {
        console.error("Failed to fetch user in sidebar", err);
      }
    };

    fetchUser();

    // Listen for custom profile update events from Profile & Settings page
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const detail = customEvent.detail;
        const name = detail.fullName || `${detail.firstName || ""} ${detail.lastName || ""}`.trim();
        const role = detail.role || user?.role || "ADMIN";
        setUser({ name: name || user?.name || "Aminul Haque", role });
      }
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("user-profile-updated", handleProfileUpdate);
    };
  }, []);

  const displayName = user?.name || "Aminul Haque";
  const displayRole = user?.role || "ADMIN";

  // Filter out User Management for non-admin staff (PDF Spec RBAC Section 2.2)
  const isEmployeeOrManager = user && user.role !== "ADMIN";
  const displayedGroups = navGroups.map(group => {
    if (group.title === "ADMINISTRATION" && isEmployeeOrManager) {
      return {
        ...group,
        links: group.links.filter(link => link.href !== "/admin/users")
      };
    }
    return group;
  }).filter(group => group.links.length > 0);

  return (
    <div className="flex flex-col h-screen w-64 bg-[#0B132B] text-slate-400 font-sans border-r border-slate-800">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0 bg-white/10 rounded-lg p-1">
            <Image
              src="/logo.webp"
              alt="Logistic Star BD"
              width={26}
              height={26}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-base leading-none">LOGISTIC</span>
            <span className="text-emerald-500 text-[10px] font-semibold tracking-wider leading-none mt-1">STAR BD LTD.</span>
          </div>
        </Link>
      </div>

      {/* Workspace Selector Placeholder */}
      <div className="px-4 py-4">
        <div className="bg-slate-800/50 rounded-md px-3 py-2 flex items-center justify-between text-sm cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-2">
            <div className="bg-slate-700 rounded p-1">
              <LayoutDashboard className="h-4 w-4 text-slate-300" />
            </div>
            <span className="text-slate-200 font-medium">OPERATIONS MANAGEMENT</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {displayedGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-xs font-semibold text-slate-500 tracking-wider">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.links.map((link) => {
                const isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/admin');
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-slate-800 text-white font-medium border-l-2 border-emerald-500" 
                        : "hover:bg-slate-800/50 hover:text-slate-200"
                    )}
                  >
                    <link.icon className={clsx("h-4 w-4", isActive ? "text-emerald-500" : "text-slate-500")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic User Profile Section without profile image */}
      <Link 
        href="/admin/profile" 
        className={clsx(
          "p-4 border-t border-slate-800/50 block transition-colors group",
          pathname === "/admin/profile" ? "bg-slate-800/40" : "hover:bg-slate-800/20"
        )}
      >
        <div className="flex flex-col">
          <span className="text-slate-200 text-sm font-medium truncate group-hover:text-white transition-colors">
            {displayName}
          </span>
          <span className="text-fuchsia-400 text-[10px] font-bold tracking-wider uppercase mt-0.5">
            {displayRole}
          </span>
        </div>
      </Link>
    </div>
  );
}

