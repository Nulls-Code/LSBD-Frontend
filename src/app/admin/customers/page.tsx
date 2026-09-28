"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, SlidersHorizontal, ChevronDown, 
  Loader2, AlertCircle, RefreshCw, X, Phone, Mail
} from "lucide-react";
import clsx from "clsx";
import { fetchCustomers } from "@/lib/api";
import { CustomerListItem } from "@/lib/types";
import { CustomerDetailsModal } from "@/components/admin/CustomerDetailsModal";

function getCustomerInitials(companyOrName: string): string {
  if (!companyOrName) return "C";
  const words = companyOrName.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyOrName.slice(0, 2).toUpperCase();
}

export default function CustomerDirectoryPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "company" | "shipments">("recent");
  const [filterMinShipments, setFilterMinShipments] = useState<number>(0);

  // Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // User Profile / Permissions
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
        // Fallback for dev environment
      }
    };
    fetchUser();
  }, []);

  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";
  const accessLabel = canEdit ? "Read / edit" : "Read only";

  // Fetch Customers from API
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchCustomers(page, pageSize, searchQuery || undefined);

      if (res.success) {
        setCustomers(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalRecords(res.meta?.total || (res.data ? res.data.length : 0));
      } else {
        setError(res.message || "Failed to load customers");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput.trim());
        setPage(1);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Re-fetch when dependencies change
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handle open modal
  const handleOpenDetails = (id: string) => {
    setSelectedCustomerId(id);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedCustomerId(null);
  };

  // Client-side sort/filter if user applies custom sorting
  const displayedCustomers = useMemo(() => {
    let list = [...customers];

    if (filterMinShipments > 0) {
      list = list.filter((c) => (c._count?.courierRequests ?? 0) >= filterMinShipments);
    }

    if (sortBy === "company") {
      list.sort((a, b) => {
        const nameA = (a.company || a.name || "").toLowerCase();
        const nameB = (b.company || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === "shipments") {
      list.sort((a, b) => (b._count?.courierRequests ?? 0) - (a._count?.courierRequests ?? 0));
    }

    return list;
  }, [customers, sortBy, filterMinShipments]);

  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, totalRecords);

  const resetFilters = () => {
    setSortBy("recent");
    setFilterMinShipments(0);
    setIsFilterPanelOpen(false);
  };

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F0F4F8]">
      {/* Top Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36] tracking-tight">
          Customer Directory
        </h1>
        <p className="hidden sm:block text-slate-500 text-sm font-medium mt-1">
          Courier profiles, request history, and shipment relationships.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3.5 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search company, name, phone, or email"
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={clsx(
            "hidden md:flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0",
            isFilterPanelOpen || sortBy !== "recent" || filterMinShipments > 0
              ? "bg-[#0B132B] text-white border-[#0B132B]"
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(sortBy !== "recent" || filterMinShipments > 0) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5"></span>
          )}
        </button>
      </div>

      {/* Expandable Filter Panel (Desktop) */}
      {isFilterPanelOpen && (
        <div className="hidden md:flex mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex-wrap items-center justify-between gap-4 animate-in fade-in duration-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="recent">Recent (Default)</option>
                <option value="company">Company / Contact Name</option>
                <option value="shipments">Most Shipments</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Min Shipments:</span>
              <select
                value={filterMinShipments}
                onChange={(e) => setFilterMinShipments(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={0}>All Records</option>
                <option value={1}>At least 1 shipment</option>
                <option value={5}>5+ shipments</option>
                <option value={10}>10+ shipments</option>
                <option value={20}>20+ shipments</option>
              </select>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadCustomers}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 rounded-md text-xs font-bold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Mobile Customer Cards List (Visible < md, matching Mobile Screenshot) */}
      <div className="md:hidden space-y-3 mb-4">
        {loading && customers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span className="text-xs">Loading customer directory...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-rose-500 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadCustomers}
              className="mt-2 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 rounded-md border border-rose-200 font-medium"
            >
              Try Again
            </button>
          </div>
        ) : displayedCustomers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-500 text-xs shadow-2xs">
            No customer records found.
          </div>
        ) : (
          displayedCustomers.map((cust) => {
            const companyName = cust.company?.trim() || cust.name;
            const contactPerson = cust.company?.trim() ? cust.name : "—";
            const totalShipments = cust._count?.courierRequests ?? 0;

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:border-blue-200 transition-all space-y-3"
              >
                {/* Top Row: Avatar + Names on Left, Total Shipments on Right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#1A3150] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs">
                      {getCustomerInitials(companyName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                        {companyName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {contactPerson !== "—" ? contactPerson : cust.name}
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Shipments */}
                  <div className="shrink-0 text-right">
                    <div className="font-bold text-xl sm:text-2xl text-[#0B1E36] leading-none">
                      {totalShipments}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                      SHIPMENTS
                    </div>
                  </div>
                </div>

                {/* Middle: Phone & Email */}
                <div className="space-y-1 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{cust.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.email || "—"}</span>
                  </div>
                </div>

                {/* Bottom Row: View Button on Right */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenDetails(cust.id)}
                    className="border border-slate-200 hover:border-blue-300 bg-white text-blue-600 hover:bg-blue-50/50 px-5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Pagination (Visible < md, matching Mobile Screenshot) */}
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

      {/* Table Container Card (Hidden on mobile < md) */}
      <div className="hidden md:flex flex-col bg-white rounded-xl shadow-xs border border-[#162238]/80 overflow-hidden">
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Dark Navy Table Header */}
            <thead>
              <tr className="bg-[#162238] text-slate-400 text-[11px] font-bold tracking-wider uppercase select-none border-b border-slate-800">
                <th className="py-4 px-6 font-bold w-[24%]">COMPANY</th>
                <th className="py-4 px-6 font-bold w-[16%]">CONTACT</th>
                <th className="py-4 px-6 font-bold w-[16%]">PHONE</th>
                <th className="py-4 px-6 font-bold w-[22%]">EMAIL</th>
                <th className="py-4 px-4 font-bold text-center w-[10%] leading-tight">
                  <div>TOTAL</div>
                  <div>SHIPMENTS</div>
                </th>
                <th className="py-4 px-6 font-bold w-[10%]">ACCESS</th>
                <th className="py-4 px-6 font-bold text-right w-[8%]">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200">
              {loading && customers.length === 0 ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse bg-white">
                    <td className="py-5 px-6">
                      <div className="h-4 bg-slate-200 rounded w-4/5 mb-1"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : displayedCustomers.length > 0 ? (
                displayedCustomers.map((cust) => {
                  const companyName = cust.company?.trim() || cust.name;
                  const contactPerson = cust.company?.trim() ? cust.name : "—";
                  const totalShipments = cust._count?.courierRequests ?? 0;

                  return (
                    <tr
                      key={cust.id}
                      className="bg-white hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* COMPANY */}
                      <td className="py-5 px-6 font-semibold text-[#0B132B] text-sm leading-snug">
                        {companyName}
                      </td>

                      {/* CONTACT */}
                      <td className="py-5 px-6 text-slate-600 font-medium text-sm">
                        {contactPerson}
                      </td>

                      {/* PHONE */}
                      <td className="py-5 px-6 text-slate-600 font-medium text-sm whitespace-nowrap">
                        {cust.phone}
                      </td>

                      {/* EMAIL */}
                      <td className="py-5 px-6 text-slate-600 font-medium text-sm truncate max-w-55" title={cust.email || ""}>
                        {cust.email || "—"}
                      </td>

                      {/* TOTAL SHIPMENTS */}
                      <td className="py-5 px-4 text-center font-bold text-[#0B132B] text-base">
                        {totalShipments}
                      </td>

                      {/* ACCESS */}
                      <td className="py-5 px-6 text-slate-600 font-medium text-sm whitespace-nowrap">
                        {accessLabel}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(cust.id)}
                          className="text-[#0B132B] hover:text-blue-600 font-bold text-sm cursor-pointer transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty State */
                <tr>
                  <td colSpan={7} className="py-16 text-center bg-white">
                    <p className="text-slate-500 font-medium text-sm">
                      {searchQuery
                        ? `No customers found matching "${searchQuery}"`
                        : "No customer records found."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dark Navy Table Footer / Pagination */}
        <div className="bg-[#162238] px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none border-t border-slate-800">
          {/* Left record counters */}
          <div className="text-slate-400 text-xs sm:text-sm font-normal">
            Showing{" "}
            <span className="text-white font-medium">
              {totalRecords > 0 ? `${startRecord}–${endRecord}` : "0"}
            </span>{" "}
            of <span className="text-white font-medium">{totalRecords}</span> records
          </div>

          {/* Right pagination controls */}
          <div className="flex items-center gap-3">
            {/* Rows selector */}
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
              <span>Rows</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none bg-[#0B132B] border border-slate-700 text-white text-xs font-semibold rounded-md pl-3 pr-7 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Previous Button */}
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white bg-[#0B132B]/80 hover:bg-[#0B132B] border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>

            {/* Current Page Pill */}
            <button className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-[#0284C7] shadow-xs">
              {page}
            </button>

            {/* Next Button */}
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 hover:text-white bg-[#0B132B]/80 hover:bg-[#0B132B] border border-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details & History Modal */}
      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        customerId={selectedCustomerId}
        userRole={userRole}
        onCustomerUpdated={loadCustomers}
      />
    </div>
  );
}
