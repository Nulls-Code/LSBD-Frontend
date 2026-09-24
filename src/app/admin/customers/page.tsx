"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, SlidersHorizontal, ChevronDown, 
  Loader2, AlertCircle, RefreshCw, X
} from "lucide-react";
import clsx from "clsx";
import { fetchCustomers } from "@/lib/api";
import { CustomerListItem } from "@/lib/types";
import { CustomerDetailsModal } from "@/components/admin/CustomerDetailsModal";

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
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F0F4F8]">
      {/* Top Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight">
          Customer Directory
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Courier profiles, request history, and shipment relationships.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search company, name, phone, or email"
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all shadow-xs"
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
            "flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0",
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

      {/* Expandable Filter Panel */}
      {isFilterPanelOpen && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-100">
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

      {/* Table Container Card */}
      <div className="bg-white rounded-xl shadow-xs border border-[#162238]/80 overflow-hidden flex flex-col">
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
