"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, ChevronDown, RefreshCw, 
  Loader2, AlertCircle, Building2, MapPin
} from "lucide-react";
import clsx from "clsx";
import { fetchLocations } from "@/lib/api";
import { Location } from "@/lib/types";
import { CreateHubModal } from "@/components/admin/CreateHubModal";
import { DeactivateHubModal } from "@/components/admin/DeactivateHubModal";

export default function HubDirectoryPage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHubForDeactivation, setSelectedHubForDeactivation] = useState<Location | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // User profile / permissions
  const [userRole, setUserRole] = useState<string>("ADMIN");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/profile", { credentials: "include" });
        if (res.ok) {
          const profileData = await res.json();
          const role = profileData?.data?.user?.role || profileData?.data?.role || "ADMIN";
          setUserRole(role);
        }
      } catch {
        // Default to ADMIN for dev fallback
      }
    };
    fetchUser();
  }, []);

  // Fetch Locations
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchLocations(
        page,
        pageSize,
        searchQuery || undefined,
        statusFilter === "all" ? undefined : statusFilter
      );

      if (res.success) {
        setData(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalRecords(res.meta?.total || (res.data ? res.data.length : 0));
      } else {
        setError(res.message || "Failed to load hubs");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput.trim());
        setPage(1);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Re-fetch on filter changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, totalRecords);

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36] tracking-tight leading-tight">
            Locations<br className="sm:hidden" /> <span className="text-xl sm:text-3xl font-bold sm:font-extrabold text-[#0B1E36]">(Hub Directory)</span>
          </h1>
          <p className="hidden sm:block text-slate-500 text-sm font-medium mt-1">
            Operational locations, availability, and current shipment workload.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0B1E36] hover:bg-[#132A4B] text-white px-3.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer shrink-0 mt-1 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            Create Hub
          </button>
        )}
      </div>

      {/* Mobile Search Input (Visible < md, matching Mobile Mockup) */}
      <div className="relative w-full mb-4 md:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, code, city, or country"
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs text-slate-800"
        />
      </div>

      {/* Desktop Filter Bar (Visible md+) */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, code, city, or country"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-xs transition-colors"
          />
        </div>

        {/* Right Filter Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none flex items-center gap-2 border border-slate-300 pl-4 pr-9 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors bg-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs font-medium"
            >
              <option value="all">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={clsx("w-4 h-4 text-slate-500", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mobile Card List (Visible < md, matching Mobile Mockup) */}
      <div className="md:hidden space-y-3 mb-4">
        {loading && data.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs">Loading hub directory...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-rose-500 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 rounded-md border border-rose-200 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-500 text-xs shadow-2xs">
            No hubs found.
          </div>
        ) : (
          data.map((hub) => {
            const isActive = hub.isActive !== false;
            const currentShipments = hub._count?.currentShipments ?? 0;

            return (
              <div
                key={hub.id}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedHubForDeactivation(hub);
                    setIsDeactivateModalOpen(true);
                  }
                }}
                className={clsx(
                  "bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:border-blue-200 transition-all flex items-start justify-between gap-3",
                  isAdmin && "cursor-pointer"
                )}
              >
                {/* Left: Icon + Hub Info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#0B1E36] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                      {hub.name}
                    </div>

                    {/* Code pill & Active/Inactive status */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-[#0B1E36] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                        {hub.code}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            isActive ? "bg-emerald-500" : "bg-slate-400"
                          )}
                        />
                        <span className={isActive ? "text-emerald-600" : "text-slate-400"}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* City, Country */}
                    <div className="text-xs text-slate-600 font-medium mt-1.5 truncate">
                      {hub.city}{hub.country ? `, ${hub.country}` : ""}
                    </div>

                    {/* Address */}
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {hub.address || "—"}
                    </div>
                  </div>
                </div>

                {/* Right: Shipments Counter */}
                <div className="shrink-0 text-right pt-0.5">
                  <div className="font-bold text-2xl text-[#0B1E36] leading-none">
                    {currentShipments}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                    SHIPMENTS
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Pagination (Visible < md, matching Mobile Mockup) */}
      <div className="flex md:hidden items-center justify-between my-4 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700">
            {startRecord}–{endRecord}
          </span> of <span className="font-semibold text-slate-700">{totalRecords}</span> records
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>
          <span className="bg-[#0284C7] text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs">
            {page}
          </span>
          <button 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || totalPages <= 1}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Main Hub Table Card (Hidden on mobile < md) */}
      <div className="hidden md:flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B192C] text-slate-300 text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4.5 rounded-tl-xl">HUB</th>
                <th className="px-6 py-4.5">CODE</th>
                <th className="px-6 py-4.5">CITY / COUNTRY</th>
                <th className="px-6 py-4.5">STATUS</th>
                <th className="px-6 py-4.5">CURRENT SHIPMENTS</th>
                <th className="px-6 py-4.5 rounded-tr-xl">ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-sm font-medium">Loading hub directory...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-rose-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                    <p className="font-semibold text-sm">{error}</p>
                    <button
                      onClick={loadData}
                      className="mt-3 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md border border-rose-200 font-medium cursor-pointer"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center text-slate-500">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700 text-base">No hubs found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchQuery || statusFilter !== "all"
                        ? "There are no operational locations matching your search filters."
                        : "There are currently no locations registered in the directory."}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((hub) => {
                  const isActive = hub.isActive !== false;
                  const currentShipments = hub._count?.currentShipments ?? 0;

                  return (
                    <tr 
                      key={hub.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* HUB NAME & ICON */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-[#0B192C] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <Building2 className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <span className="font-bold text-[#0B132B] text-[14px] block leading-snug">
                              {hub.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* HUB CODE */}
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#1E293B] text-slate-200 font-mono text-xs font-semibold tracking-wide border border-slate-700/60 shadow-xs">
                          {hub.code}
                        </span>
                      </td>

                      {/* CITY / COUNTRY */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-[#0B132B] text-[13px]">{hub.city}</span>
                          <span className="text-slate-500 text-xs mt-0.5">{hub.country}</span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => {
                            if (isAdmin) {
                              setSelectedHubForDeactivation(hub);
                              setIsDeactivateModalOpen(true);
                            }
                          }}
                          className={clsx(
                            "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold transition-all",
                            isAdmin && "cursor-pointer hover:ring-2 hover:ring-slate-300/60",
                            isActive 
                              ? "text-emerald-700 bg-emerald-50/50" 
                              : "text-slate-600 bg-slate-100"
                          )}
                          title={isAdmin ? (isActive ? "Click to deactivate hub" : "Click to reactivate hub") : undefined}
                        >
                          <span 
                            className={clsx(
                              "w-2 h-2 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            )} 
                          />
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* CURRENT SHIPMENTS */}
                      <td className="px-6 py-5">
                        <span className="text-slate-800 font-bold text-sm">
                          {currentShipments}
                        </span>
                      </td>

                      {/* ADDRESS */}
                      <td className="px-6 py-5 text-slate-600 text-xs max-w-sm truncate">
                        {hub.address || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Dark Navy */}
        <div className="bg-[#0B192C] text-slate-300 px-6 py-3.5 flex items-center justify-between text-sm rounded-b-xl select-none">
          <div className="text-[13px]">
            Showing <span className="font-semibold text-white">{startRecord}–{endRecord}</span> of{" "}
            <span className="font-semibold text-white">{totalRecords}</span> records
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-slate-400">Rows</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none bg-[#1E293B] hover:bg-slate-800 text-white rounded px-2.5 py-1.5 pr-7 flex items-center gap-2 transition-colors cursor-pointer text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-[13px] disabled:opacity-40 disabled:hover:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 bg-[#0284C7] text-white rounded font-medium text-[13px]">
                {page}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-[#1E293B] hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-[13px] disabled:opacity-40 disabled:hover:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Hub Modal */}
      <CreateHubModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Deactivate / Reactivate Hub Modal */}
      <DeactivateHubModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setSelectedHubForDeactivation(null);
        }}
        onSuccess={() => {
          loadData();
        }}
        location={selectedHubForDeactivation}
      />
    </div>
  );
}
