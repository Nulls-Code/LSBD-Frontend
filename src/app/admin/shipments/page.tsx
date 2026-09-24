"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, Search, ChevronDown, RefreshCw, 
  Copy, Check, Loader2, AlertCircle, Truck, 
  Building2, Compass, PauseCircle, CheckCircle2, AlertTriangle, Package, RotateCcw, Slash
} from "lucide-react";
import clsx from "clsx";
import { fetchShipments, fetchLocations, fetchStaffUsers, fetchUserProfile } from "@/lib/api";
import { Shipment, Location, StaffUser, ShipmentStatus } from "@/lib/types";
import { CheckpointModal } from "@/components/admin/CheckpointModal";
import { ShipmentDetailsModal } from "@/components/admin/ShipmentDetailsModal";

function FilterDropdown({ 
  value, 
  onChange, 
  options, 
  defaultLabel 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[]; 
  defaultLabel: string; 
}) {
  return (
    <div className="relative shrink-0">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none flex items-center gap-2 border border-slate-300 pl-3.5 pr-8 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white focus:outline-none focus:border-blue-500 cursor-pointer min-w-[130px] max-w-[170px] truncate shadow-sm"
      >
        <option value="">{defaultLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

function StatusBadge({ status }: { status: ShipmentStatus | string }) {
  switch (status) {
    case "ARRIVED_AT_HUB":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-purple-300 text-purple-700 bg-[#F3E8FF]">
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          Arrived at Hub
        </span>
      );
    case "IN_TRANSIT":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-sky-300 text-sky-700 bg-[#E0F2FE]">
          <Truck className="w-3.5 h-3.5 text-sky-600" />
          In Transit
        </span>
      );
    case "OUT_FOR_DELIVERY":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-orange-300 text-orange-700 bg-[#FFEDD5]">
          <Compass className="w-3.5 h-3.5 text-orange-600" />
          Out for Delivery
        </span>
      );
    case "ON_HOLD":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 text-amber-700 bg-[#FEF9C3]">
          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
          On Hold
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-300 text-emerald-700 bg-[#DCFCE7]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Delivered
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-blue-300 text-blue-700 bg-[#DBEAFE]">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          Processing
        </span>
      );
    case "FAILED_DELIVERY":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 bg-[#FFE4E6]">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Failed Delivery
        </span>
      );
    case "RETURNED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-700 bg-[#F3F4F6]">
          <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
          Returned
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 bg-[#F1F5F9]">
          <Slash className="w-3.5 h-3.5 text-slate-600" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 bg-slate-50">
          {status}
        </span>
      );
  }
}

export default function ShipmentsPage() {
  const [data, setData] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchTrackingNumber, setSearchTrackingNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [routeFilter, setRouteFilter] = useState(""); // originId_destId
  const [staffFilter, setStaffFilter] = useState("");

  // Metadata options
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);

  // Modals state
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [selectedShipmentForCheckpoint, setSelectedShipmentForCheckpoint] = useState<Shipment | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<Shipment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Current logged in user (RBAC)
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);

  // Load User Profile on mount for RBAC
  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch((e) => console.error("Failed to load user profile in shipments page", e));

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

  // Load locations and staff for dropdowns
  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      try {
        const locPromise = fetchLocations(1, 100).catch(() => ({ success: false, data: [] }));
        const staffPromise = (async () => {
          try {
            if (typeof fetchStaffUsers === "function") {
              const res = await fetchStaffUsers(1, 100);
              if (res?.success && Array.isArray(res.data)) return res;
            }
            // Fallback direct fetch if helper is not yet available in cached bundle
            const directRes = await fetch("/api/v1/users?limit=100", {
              credentials: "include",
            });
            if (directRes.ok) {
              return await directRes.json();
            }
          } catch {
            // Silently ignore if not authorized (e.g. non-Admin)
          }
          return { success: false, data: [] };
        })();

        const [locRes, staffRes] = await Promise.all([locPromise, staffPromise]);
        if (isMounted) {
          if (locRes && locRes.success && Array.isArray(locRes.data)) {
            setLocations(locRes.data);
          }
          if (staffRes && staffRes.success && Array.isArray(staffRes.data)) {
            setStaffUsers(staffRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Read URL search params on mount (e.g. from Dashboard click)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("currentStatus");
      const trackParam = params.get("trackingNumber");
      if (statusParam) {
        setStatusFilter(statusParam);
      }
      if (trackParam) {
        setSearchTrackingNumber(trackParam);
        setSearchInput(trackParam);
      }
    }
  }, []);

  // Fetch Shipments
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let originLocationId: string | undefined;
      let destinationLocationId: string | undefined;
      if (routeFilter && routeFilter.includes("_")) {
        const parts = routeFilter.split("_");
        originLocationId = parts[0] || undefined;
        destinationLocationId = parts[1] || undefined;
      }

      const res = await fetchShipments(
        page,
        pageSize,
        statusFilter || undefined,
        originLocationId,
        destinationLocationId,
        staffFilter || undefined,
        searchTrackingNumber || undefined
      );

      if (res.success) {
        setData(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
        setTotalRecords(res.meta?.total || (res.data ? res.data.length : 0));
      } else {
        setError(res.message || "Failed to load shipments");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, routeFilter, staffFilter, searchTrackingNumber]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTrackingNumber) {
        setSearchTrackingNumber(searchInput.trim());
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, searchTrackingNumber]);

  // Fetch on filter change
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTracking = (trackingNumber: string) => {
    if (!trackingNumber) return null;
    const parts = trackingNumber.split("-");
    if (parts.length >= 3) {
      return (
        <div className="flex flex-col text-[12px] font-mono leading-tight text-slate-600">
          <span>{parts[0]}-</span>
          <span>{parts[1]}-</span>
          <span>{parts.slice(2).join("-")}</span>
        </div>
      );
    }
    return <span className="font-mono text-xs text-slate-700">{trackingNumber}</span>;
  };

  const formatEstDelivery = (dateString?: string | null) => {
    if (!dateString) return <span className="text-slate-400">—</span>;
    const d = new Date(dateString);
    const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d);
    const year = d.getFullYear();
    return (
      <div className="flex flex-col text-[13px] leading-tight text-slate-700">
        <span className="font-medium">{dayMonth}</span>
        <span className="text-slate-500">{year}</span>
      </div>
    );
  };

  // Build filter options
  const statusOptions = [
    { value: "PROCESSING", label: "Processing" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "ARRIVED_AT_HUB", label: "Arrived at Hub" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "FAILED_DELIVERY", label: "Failed Delivery" },
    { value: "RETURNED", label: "Returned" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  // Derive unique route pairs from locations or shipments
  const routeOptions = locations.flatMap((orig) =>
    locations
      .filter((dest) => dest.id !== orig.id)
      .map((dest) => ({
        value: `${orig.id}_${dest.id}`,
        label: `${orig.city} → ${dest.city}`,
      }))
  ).slice(0, 15);

  // Build staff options from both users API and loaded shipments
  const staffOptionsMap = new Map<string, string>();
  if (Array.isArray(staffUsers)) {
    staffUsers.forEach((user) => {
      if (user?.id && (user.firstName || user.lastName)) {
        staffOptionsMap.set(user.id, `${user.firstName || ""} ${user.lastName || ""}`.trim());
      }
    });
  }
  if (Array.isArray(data)) {
    data.forEach((s) => {
      if (s.assignedTo?.id) {
        const name = `${s.assignedTo.firstName || ""} ${s.assignedTo.lastName || ""}`.trim();
        if (name) staffOptionsMap.set(s.assignedTo.id, name);
      }
    });
  }
  const staffOptions = Array.from(staffOptionsMap.entries()).map(([value, label]) => ({
    value,
    label,
  }));

  const startRecord = totalRecords > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight">Shipments</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Search, inspect, and update active international shipments.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedShipmentForCheckpoint(null);
            setIsCheckpointModalOpen(true);
          }}
          className="bg-[#1e293b] hover:bg-[#0f1b3b] text-white px-4 py-2.5 rounded-md flex items-center gap-2 text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log Checkpoint
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tracking number"
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Dropdowns */}
        <FilterDropdown
          defaultLabel="All statuses"
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        />

        <FilterDropdown
          defaultLabel="All routes"
          options={routeOptions}
          value={routeFilter}
          onChange={(val) => {
            setRouteFilter(val);
            setPage(1);
          }}
        />

        <FilterDropdown
          defaultLabel="All staff"
          options={staffOptions}
          value={staffFilter}
          onChange={(val) => {
            setStaffFilter(val);
            setPage(1);
          }}
        />

        {/* Refresh Button */}
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw className={clsx("w-4 h-4 text-slate-400", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0f1b3b] text-slate-300 text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">TRACKING #</th>
                <th className="px-6 py-4">SENDER / RECIPIENT</th>
                <th className="px-6 py-4">ROUTE</th>
                <th className="px-6 py-4">CURRENT HUB</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">EST. DELIVERY</th>
                <th className="px-6 py-4">ASSIGNED</th>
                <th className="px-6 py-4 rounded-tr-xl text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-sm font-medium">Loading shipments...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-rose-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
                    <p className="font-semibold text-sm">{error}</p>
                    <button
                      onClick={loadData}
                      className="mt-3 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md border border-rose-200 font-medium"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                /* User comment: If the backend api doesn't return anything or empty list then, keep the table empty with a suitable text in the middle of the table. */
                <tr>
                  <td colSpan={8} className="px-6 py-24 text-center text-slate-500">
                    <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-semibold text-slate-700 text-base">No shipments found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTrackingNumber || statusFilter || routeFilter || staffFilter
                        ? "There are no shipments matching your search filters."
                        : "There are currently no active shipments registered in the system."}
                    </p>
                  </td>
                </tr>
              ) : (
                data.map((shipment) => {
                  const currentHub =
                    shipment.currentLocation?.city ||
                    shipment.currentLocation?.name ||
                    shipment.originLocation?.city ||
                    "In Transit";

                  const assignedStaffName = shipment.assignedTo
                    ? `${shipment.assignedTo.firstName} ${shipment.assignedTo.lastName}`
                    : "—";

                  return (
                    <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* TRACKING # */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {formatTracking(shipment.trackingNumber)}
                          <button
                            onClick={() => handleCopy(shipment.trackingNumber, shipment.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
                            title="Copy tracking number"
                          >
                            {copiedId === shipment.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* SENDER / RECIPIENT */}
                      <td className="px-6 py-4">
                        <div className="text-[#0B132B] font-bold text-[13px] leading-tight">
                          {shipment.senderName}
                        </div>
                        <div className="text-slate-500 text-[12px] mt-0.5">
                          {shipment.recipientName}
                        </div>
                      </td>

                      {/* ROUTE */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-[13px] leading-tight text-slate-700">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{shipment.originLocation?.city || "Origin"}</span>
                            <span className="text-slate-400 text-xs">➔</span>
                          </div>
                          <span className="font-medium mt-0.5">
                            {shipment.destinationLocation?.city || "Destination"}
                          </span>
                        </div>
                      </td>

                      {/* CURRENT HUB */}
                      <td className="px-6 py-4 text-slate-700 text-[13px] font-medium">
                        {currentHub}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <StatusBadge status={shipment.currentStatus} />
                      </td>

                      {/* EST. DELIVERY */}
                      <td className="px-6 py-4">
                        {formatEstDelivery(shipment.estimatedDeliveryDate)}
                      </td>

                      {/* ASSIGNED */}
                      <td className="px-6 py-4 text-slate-700 text-[13px] font-medium">
                        {assignedStaffName}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedShipmentForDetails(shipment);
                              setIsDetailsModalOpen(true);
                            }}
                            className="text-xs font-semibold text-slate-600 hover:text-[#0B132B] px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedShipmentForCheckpoint(shipment);
                              setIsCheckpointModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-600 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Log checkpoint"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Dark Navy */}
        <div className="bg-[#0f1b3b] text-slate-300 px-6 py-3.5 flex items-center justify-between text-sm rounded-b-xl select-none">
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
                  className="appearance-none bg-[#1e293b] hover:bg-slate-800 text-white rounded px-2.5 py-1.5 pr-7 flex items-center gap-2 transition-colors cursor-pointer text-xs focus:outline-none"
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
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-[13px] disabled:opacity-40 disabled:hover:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 bg-[#0284C7] text-white rounded font-medium text-[13px]">
                {page}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors text-[13px] disabled:opacity-40 disabled:hover:text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Checkpoint Logger Dialog */}
      <CheckpointModal
        isOpen={isCheckpointModalOpen}
        onClose={() => setIsCheckpointModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        locations={locations}
        shipment={selectedShipmentForCheckpoint}
        allShipments={data}
        userRole={currentUser?.role}
      />

      {/* 360-degree Shipment Details & Timeline Modal */}
      <ShipmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        shipment={selectedShipmentForDetails}
        userRole={currentUser?.role}
        staffUsers={staffUsers}
        onLogCheckpoint={(shipment) => {
          setSelectedShipmentForCheckpoint(shipment);
          setIsCheckpointModalOpen(true);
        }}
        onUpdateSuccess={(updated) => {
          loadData();
          setSelectedShipmentForDetails(updated);
        }}
      />
    </div>
  );
}
