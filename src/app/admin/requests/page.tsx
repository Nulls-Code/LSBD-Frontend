"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, Search, ChevronDown, Calendar, RefreshCw, 
  Check, Clock, X, Copy, MoreHorizontal, Loader2, AlertCircle,
  CheckCircle2, XCircle, Slash, Eye, FileCheck2, ExternalLink, 
  FilterX, ShieldAlert, Sparkles
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { 
  fetchCourierRequests, 
  fetchLocations, 
  fetchCourierRequestStatusCounts, 
  fetchUserProfile 
} from "@/lib/api";
import { CourierRequest, Location, StaffUser } from "@/lib/types";
import { ReviewRequestModal } from "@/components/admin/ReviewRequestModal";
import { CancelRequestModal } from "@/components/admin/CancelRequestModal";
import { RequestDetailsModal } from "@/components/admin/RequestDetailsModal";
import { CreateRequestModal } from "@/components/admin/CreateRequestModal";

function TabItem({ 
  label, 
  count, 
  active, 
  badgeColor,
  onClick
}: { 
  label: string, 
  count?: number, 
  active?: boolean, 
  badgeColor: string,
  onClick: () => void 
}) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 pb-3 cursor-pointer transition-colors relative shrink-0",
        active ? "text-[#0B132B]" : "text-slate-600 hover:text-slate-900"
      )}
    >
      <span className={clsx("text-sm", active ? "font-bold" : "font-medium")}>{label}</span>
      {count !== undefined && (
        <span className={clsx(
          "text-[10px] font-bold px-2 py-0.5 rounded-full text-white leading-none shadow-sm transition-all",
          badgeColor
        )}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0B132B]"></div>
      )}
    </button>
  );
}

function FilterSelect({ 
  value, 
  onChange, 
  options, 
  defaultLabel 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  options: {value: string, label: string}[], 
  defaultLabel: string 
}) {
  return (
    <div className="relative shrink-0">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none flex items-center gap-2 border border-slate-300 pl-3.5 pr-8 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white focus:outline-none focus:border-blue-500 cursor-pointer max-w-[190px] truncate shadow-sm"
      >
        <option value="">{defaultLabel}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

// Strict Table 2 Design Tokens & Badges from PDF Specification
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-300 text-emerald-700 bg-[#D1FAE5]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 text-amber-700 bg-[#FEF3C7]">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Awaiting Review
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 bg-[#FEE2E2]">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 bg-[#F1F5F9]">
          <Slash className="w-3.5 h-3.5 text-slate-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 text-slate-600 bg-slate-50">
          {status}
        </span>
      );
  }
}

export default function CourierRequestsPage() {
  const [data, setData] = useState<CourierRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);
  
  // Current logged in user (RBAC)
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const isEmployee = currentUser?.role?.toUpperCase() === "EMPLOYEE";

  // Tab & Pagination
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Dynamic Tab Counts across ALL statuses
  const [statusCounts, setStatusCounts] = useState<{
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    CANCELLED: number;
  }>({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  });

  // Filters
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [originLocationId, setOriginLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Action Menu & Clipboard State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Modals State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<CourierRequest | null>(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] = useState<CourierRequest | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<CourierRequest | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Read URL search params on mount (e.g. from Dashboard click)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("status");
      if (statusParam && ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(statusParam.toUpperCase())) {
        setActiveTab(statusParam.toUpperCase());
      }
    }
  }, []);

  // Load User Profile on mount for RBAC
  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch((e) => console.error("Failed to load user profile in requests page", e));

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentUser((prev) => ({
          ...prev,
          ...customEvent.detail,
        }));
      }
    };

    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("user-profile-updated", handleProfileUpdate);
  }, []);

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await fetchLocations(1, 100);
        if (res.success) {
          setLocations(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch locations", e);
      }
    };
    loadLocations();
  }, []);

  // Close row action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch status counts dynamically across all categories
  const loadCounts = useCallback(async () => {
    try {
      const counts = await fetchCourierRequestStatusCounts({
        originLocationId: originLocationId || undefined,
        destinationLocationId: destinationLocationId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchQuery || undefined,
      });
      setStatusCounts(counts as any);
    } catch (err) {
      console.error("Failed to load request status counts", err);
    }
  }, [originLocationId, destinationLocationId, startDate, endDate, searchQuery]);

  // Main data fetch
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCourierRequests(
        page, 
        pageSize, 
        activeTab,
        originLocationId || undefined,
        destinationLocationId || undefined,
        startDate || undefined,
        endDate || undefined,
        searchQuery || undefined
      );
      if (res.success) {
        setData(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalRecords(res.meta.total);
      } else {
        setError(res.message || "Failed to load data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, originLocationId, destinationLocationId, startDate, endDate, searchQuery]);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== searchInput.trim()) {
        setSearchQuery(searchInput.trim());
        setPage(1);
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [searchInput, searchQuery]);

  // Load data and refresh counts when dependencies change
  useEffect(() => {
    loadData();
    loadCounts();
  }, [loadData, loadCounts]);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) return;
    setActiveTab(tabId);
    setPage(1);
  };

  const handleRefresh = () => {
    loadData();
    loadCounts();
    setToastMessage({ text: "Requests and status metrics refreshed.", type: "info" });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setOriginLocationId("");
    setDestinationLocationId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || originLocationId || destinationLocationId || startDate || endDate
  );

  const handleCopyTracking = (trackingNumber: string, id: string) => {
    navigator.clipboard.writeText(trackingNumber);
    setCopiedId(`track-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyRequestId = (reqId: string) => {
    navigator.clipboard.writeText(reqId);
    setCopiedId(`req-${reqId}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", { 
      day: "numeric", month: "short", year: "numeric", 
      hour: "numeric", minute: "2-digit", hour12: true 
    }).format(d);
  };

  const locationOptions = locations.map(loc => ({
    value: loc.id,
    label: `${loc.city} (${loc.code})`
  }));

  // Handlers for modal callbacks triggering reactive UI updates
  const handleReviewSuccess = (reviewedData?: any) => {
    loadData();
    loadCounts();
    const isApproved = reviewedData?.status === "APPROVED";
    setToastMessage({
      text: isApproved 
        ? `Request approved! Atomic shipment created (${reviewedData?.shipment?.trackingNumber || "Active"}).`
        : "Request review recorded as REJECTED.",
      type: "success",
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleCancelSuccess = () => {
    loadData();
    loadCounts();
    setToastMessage({
      text: "Courier request cancelled successfully.",
      type: "success",
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateSuccess = (newRequest?: CourierRequest) => {
    loadData();
    loadCounts();
    setToastMessage({
      text: `New request #${newRequest?.id.slice(0, 8).toUpperCase() || ""} submitted successfully!`,
      type: "success",
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-[#f8fafc]" ref={menuContainerRef}>
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className={clsx(
          "mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-200",
          toastMessage.type === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
          toastMessage.type === "info" && "bg-blue-50 border-blue-200 text-blue-800",
          toastMessage.type === "error" && "bg-rose-50 border-rose-200 text-rose-800"
        )}>
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {toastMessage.type === "info" && <Sparkles className="w-4 h-4 text-blue-600" />}
            {toastMessage.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{toastMessage.text}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B132B] mb-2 tracking-tight">Request Management</h1>
          <p className="text-slate-500 text-sm font-medium">
            Review intake, authorize shipments, and retain a clear decision record (Screen 5).
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#1e293b] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Dynamic Tabs with Live Record Counts */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6 w-full overflow-x-auto pb-0.5">
        <TabItem 
          label="All" 
          count={statusCounts.ALL} 
          active={activeTab === "ALL"} 
          badgeColor="bg-[#1e293b]" 
          onClick={() => handleTabClick("ALL")}
        />
        <TabItem 
          label="Pending" 
          count={statusCounts.PENDING} 
          active={activeTab === "PENDING"} 
          badgeColor="bg-amber-500" 
          onClick={() => handleTabClick("PENDING")}
        />
        <TabItem 
          label="Approved" 
          count={statusCounts.APPROVED} 
          active={activeTab === "APPROVED"} 
          badgeColor="bg-emerald-600" 
          onClick={() => handleTabClick("APPROVED")}
        />
        <TabItem 
          label="Rejected" 
          count={statusCounts.REJECTED} 
          active={activeTab === "REJECTED"} 
          badgeColor="bg-rose-500" 
          onClick={() => handleTabClick("REJECTED")}
        />
        <TabItem 
          label="Cancelled" 
          count={statusCounts.CANCELLED} 
          active={activeTab === "CANCELLED"} 
          badgeColor="bg-slate-500" 
          onClick={() => handleTabClick("CANCELLED")}
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search request, sender, or recipient..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm placeholder-slate-400"
          />
        </div>
        
        <FilterSelect 
          defaultLabel="All origins" 
          options={locationOptions} 
          value={originLocationId} 
          onChange={(val) => { setOriginLocationId(val); setPage(1); }} 
        />
        
        <FilterSelect 
          defaultLabel="All destinations" 
          options={locationOptions} 
          value={destinationLocationId} 
          onChange={(val) => { setDestinationLocationId(val); setPage(1); }} 
        />
        
        <div className="flex items-center gap-2 border border-slate-300 px-3 py-1.5 rounded-md bg-white shrink-0 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="text-xs text-slate-600 bg-transparent focus:outline-none w-auto max-w-[110px]"
            title="Start Date"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="text-xs text-slate-600 bg-transparent focus:outline-none w-auto max-w-[110px]"
            title="End Date"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors border border-rose-200 shrink-0"
            title="Clear all filters"
          >
            <FilterX className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}

        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white ml-auto disabled:opacity-50 shrink-0 shadow-sm"
        >
          <RefreshCw className={clsx("w-4 h-4 text-slate-400", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[420px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f1b3b] text-slate-300 text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">REQUEST ID</th>
                <th className="px-6 py-4">SENDER / RECIPIENT</th>
                <th className="px-6 py-4">ROUTE</th>
                <th className="px-6 py-4">PACKAGE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">CREATED</th>
                <th className="px-6 py-4">SHIPMENT</th>
                <th className="px-6 py-4 rounded-tr-xl text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    Loading requests and synchronizing state...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-rose-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-rose-500" />
                    <p className="font-semibold">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded text-xs hover:bg-slate-800 transition-colors"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="text-base font-semibold text-slate-800">No requests found</p>
                      <p className="text-xs text-slate-500">
                        {hasActiveFilters 
                          ? "No courier requests match your current filters. Try resetting the filters."
                          : "There are currently no courier intake requests under this tab."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* REQUEST ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRequestForDetails(req);
                            setIsDetailsModalOpen(true);
                          }}
                          className="font-mono text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          title="Click to view full request details"
                        >
                          {req.id.slice(0, 8).toUpperCase()}
                        </button>
                        <button
                          onClick={() => handleCopyRequestId(req.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="Copy full request ID"
                        >
                          {copiedId === `req-${req.id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* SENDER / RECIPIENT */}
                    <td className="px-6 py-4">
                      <div className="text-[#0B132B] font-bold text-[13px] leading-tight truncate max-w-[200px]">
                        {req.senderName}
                      </div>
                      <div className="text-slate-500 text-[12px] mt-0.5 truncate max-w-[200px]">
                        To: {req.recipientName}
                      </div>
                    </td>

                    {/* ROUTE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#0B132B] text-[13px]">
                        <span className="font-medium">{req.originLocation?.city || "Unknown"}</span> 
                        <span className="text-slate-400 text-xs">→</span> 
                        <span className="font-medium">{req.destinationLocation?.city || "Unknown"}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {req.originLocation?.code} → {req.destinationLocation?.code}
                      </div>
                    </td>

                    {/* PACKAGE */}
                    <td className="px-6 py-4">
                      <div className="text-[#0B132B] text-[13px] leading-tight font-medium truncate max-w-[220px]">
                        {req.packageDescription}
                      </div>
                      <div className="text-slate-500 text-[12px] mt-0.5">
                        {req.packageWeight} {req.weightUnit} · {req.packageCount || 1} pkg(s)
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* CREATED */}
                    <td className="px-6 py-4 text-slate-500 text-[12px]">
                      {formatDate(req.createdAt)}
                    </td>

                    {/* SHIPMENT (Visual Indication per PDF Section 4.5) */}
                    <td className="px-6 py-4">
                      {req.shipment ? (
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active Shipment
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">({req.shipment.currentStatus})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-semibold text-slate-800">
                              {req.shipment.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleCopyTracking(req.shipment!.trackingNumber, req.id)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                              title="Copy tracking number"
                            >
                              {copiedId === `track-${req.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <Link
                              href={`/admin/shipments?search=${encodeURIComponent(req.shipment.trackingNumber)}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-0.5"
                              title="View in shipments list"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs italic">
                          <Clock className="w-3 h-3 text-slate-300" />
                          Not created
                        </span>
                      )}
                    </td>

                    {/* ACTIONS (PDF Section 4.5: Review, Cancel, View Details) */}
                    <td className="px-6 py-4 text-center relative">
                      <div className="inline-flex items-center gap-1">
                        {/* Quick review shortcut button for PENDING requests when user is Admin/Manager */}
                        {req.status === "PENDING" && !isEmployee && (
                          <button
                            onClick={() => {
                              setSelectedRequestForReview(req);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors shadow-sm"
                            title="Review request"
                          >
                            Review
                          </button>
                        )}

                        {/* Dropdown Menu Trigger */}
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === req.id ? null : req.id);
                            }}
                            className={clsx(
                              "text-slate-400 hover:text-[#0B132B] transition-colors p-1.5 rounded-md hover:bg-slate-100",
                              activeMenuId === req.id && "bg-slate-100 text-slate-800"
                            )}
                            title="Action options"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Interactive Dropdown */}
                          {activeMenuId === req.id && (
                            <div 
                              className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-left text-xs animate-in fade-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setSelectedRequestForDetails(req);
                                  setIsDetailsModalOpen(true);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium transition-colors"
                              >
                                <Eye className="w-4 h-4 text-slate-500" />
                                View Details
                              </button>

                              {req.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (isEmployee) return;
                                      setSelectedRequestForReview(req);
                                      setIsReviewModalOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    disabled={isEmployee}
                                    className={clsx(
                                      "w-full px-3 py-2 flex items-center gap-2 font-medium transition-colors",
                                      isEmployee 
                                        ? "text-slate-400 cursor-not-allowed opacity-60" 
                                        : "text-emerald-700 hover:bg-emerald-50"
                                    )}
                                  >
                                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                    Review Decision
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (isEmployee) return;
                                      setSelectedRequestForCancel(req);
                                      setIsCancelModalOpen(true);
                                      setActiveMenuId(null);
                                    }}
                                    disabled={isEmployee}
                                    className={clsx(
                                      "w-full px-3 py-2 flex items-center gap-2 font-medium transition-colors border-t border-slate-100",
                                      isEmployee 
                                        ? "text-slate-400 cursor-not-allowed opacity-60" 
                                        : "text-rose-600 hover:bg-rose-50"
                                    )}
                                  >
                                    <Slash className="w-4 h-4 text-rose-500" />
                                    Cancel Request
                                  </button>
                                </>
                              )}

                              {req.shipment && (
                                <Link
                                  href={`/admin/shipments?search=${encodeURIComponent(req.shipment.trackingNumber)}`}
                                  className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-medium transition-colors border-t border-slate-100"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <ExternalLink className="w-4 h-4 text-blue-500" />
                                  Track Shipment
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination & Page Size */}
        <div className="bg-[#0f1b3b] text-slate-300 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-sm rounded-b-xl gap-4">
          <div className="text-[13px]">
            Showing <span className="font-semibold text-white">
              {totalRecords > 0 ? ((page - 1) * pageSize) + 1 : 0}-
              {Math.min(page * pageSize, totalRecords)}
            </span> of <span className="font-semibold text-white">{totalRecords}</span> records
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
                  className="appearance-none bg-[#1e293b] hover:bg-slate-800 text-white rounded pl-2.5 pr-7 py-1.5 text-xs font-medium cursor-pointer focus:outline-none transition-colors"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors text-[13px] disabled:opacity-50 disabled:hover:text-slate-400"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 bg-[#0ea5e9] text-white rounded font-medium text-[13px]">
                {page} / {Math.max(1, totalPages)}
              </span>
              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-white rounded transition-colors text-[13px] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Request Modal (PDF Section 7.3.3) */}
      <ReviewRequestModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequestForReview(null);
        }}
        request={selectedRequestForReview}
        userRole={currentUser?.role}
        onSuccess={handleReviewSuccess}
      />

      {/* Cancel Request Modal (PDF Section 7.3.4) */}
      <CancelRequestModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedRequestForCancel(null);
        }}
        request={selectedRequestForCancel}
        userRole={currentUser?.role}
        onSuccess={handleCancelSuccess}
      />

      {/* Request Details Modal (PDF Section 4.5) */}
      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRequestForDetails(null);
        }}
        request={selectedRequestForDetails}
        userRole={currentUser?.role}
        onOpenReview={(req) => {
          setSelectedRequestForReview(req);
          setIsReviewModalOpen(true);
        }}
        onOpenCancel={(req) => {
          setSelectedRequestForCancel(req);
          setIsCancelModalOpen(true);
        }}
      />

      {/* Create New Request Modal (PDF Section 4.2 & 7.3.1) */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        availableLocations={locations}
      />
    </div>
  );
}
