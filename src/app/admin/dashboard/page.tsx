"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Search, 
  Building2,
  MapPin, 
  ArrowRight, 
  ChevronRight, 
  RefreshCw, 
  Loader2, 
  X, 
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import clsx from "clsx";
import { fetchShipments, fetchShipmentById, fetchUserProfile } from "@/lib/api";
import { Location, Shipment, ShipmentStatus, StaffUser } from "@/lib/types";
import { CheckpointModal } from "@/components/admin/CheckpointModal";
import { CreateRequestModal } from "@/components/admin/CreateRequestModal";
import { ShipmentDetailsModal } from "@/components/admin/ShipmentDetailsModal";

// Design Tokens for Status Indicators (Pill Style from Design Mockup)
const STATUS_PILL_CONFIG: Record<
  string, 
  { border: string; text: string; bg: string; label: string }
> = {
  ARRIVED_AT_HUB: {
    border: "border-purple-300",
    text: "text-purple-700",
    bg: "bg-purple-50/50",
    label: "Arrived at Hub",
  },
  OUT_FOR_DELIVERY: {
    border: "border-orange-300",
    text: "text-orange-700",
    bg: "bg-orange-50/50",
    label: "Out for Delivery",
  },
  ON_HOLD: {
    border: "border-amber-300",
    text: "text-amber-700",
    bg: "bg-amber-50/50",
    label: "On Hold",
  },
  DELIVERED: {
    border: "border-emerald-300",
    text: "text-emerald-700",
    bg: "bg-emerald-50/50",
    label: "Delivered",
  },
  IN_TRANSIT: {
    border: "border-sky-300",
    text: "text-sky-700",
    bg: "bg-sky-50/50",
    label: "In Transit",
  },
  PROCESSING: {
    border: "border-blue-300",
    text: "text-blue-700",
    bg: "bg-blue-50/50",
    label: "Processing",
  },
  FAILED_DELIVERY: {
    border: "border-rose-300",
    text: "text-rose-700",
    bg: "bg-rose-50/50",
    label: "Failed Delivery",
  },
  PENDING: {
    border: "border-amber-300",
    text: "text-amber-700",
    bg: "bg-amber-50/50",
    label: "Awaiting Review",
  },
  APPROVED: {
    border: "border-emerald-300",
    text: "text-emerald-700",
    bg: "bg-emerald-50/50",
    label: "Approved",
  },
  REJECTED: {
    border: "border-rose-300",
    text: "text-rose-700",
    bg: "bg-rose-50/50",
    label: "Rejected",
  },
  CANCELLED: {
    border: "border-slate-300",
    text: "text-slate-600",
    bg: "bg-slate-50/50",
    label: "Cancelled",
  },
  RETURNED: {
    border: "border-slate-300",
    text: "text-slate-600",
    bg: "bg-slate-50/50",
    label: "Returned",
  },
};

function formatElapsedTime(isoString?: string): string {
  if (!isoString) return "recently";
  const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days} day${days > 1 ? "s" : ""} ${remHours > 0 ? `${remHours} hour${remHours > 1 ? "s" : ""}` : ""}`.trim();
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
  }
  if (mins === 0) return "just now";
  return `${mins} minute${mins !== 1 ? "s" : ""}`;
}

function getOperationalShift(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Morning shift";
  if (hour >= 12 && hour < 17) return "Afternoon shift";
  if (hour >= 17 && hour < 22) return "Evening shift";
  return "Night shift";
}

function formatFeedTime(dateString?: string): string {
  if (!dateString) return "Just now";
  try {
    const d = new Date(dateString);
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return timeStr;
  } catch {
    return "Just now";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  // Primary operational stats from backend
  const [stats, setStats] = useState({
    pendingRequests: 0,
    inTransitShipments: 0,
    todaysDeliveries: 0,
    activeHubs: 0,
    totalHubs: 0,
    requestsAwaitingReview: 0,
    shipmentsNeedIntervention: 0,
    failedDeliveriesCount: 0,
    onHoldCount: 0,
  });

  // Dynamic calculated subtexts from backend
  const [subtexts, setSubtexts] = useState({
    pendingSubtext: "Checking pending requests...",
    inTransitSubtext: "Calculating active corridors...",
    deliveriesSubtext: "Calculating deliveries...",
    hubsSubtext: "Checking network status...",
    oldestPendingSubtitle: "Checking pending intake...",
    interventionSubtitle: "Monitoring shipment alerts...",
  });

  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [allActiveShipments, setAllActiveShipments] = useState<Shipment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);
  const [selectedShipmentForCheckpoint, setSelectedShipmentForCheckpoint] = useState<Shipment | null>(null);

  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedShipmentForDetails, setSelectedShipmentForDetails] = useState<Shipment | null>(null);

  // Quick Track Dialog
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState<Shipment | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  // Current logged in user (RBAC)
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    fetchUserProfile()
      .then((res) => {
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch((e) => console.error("Failed to load user profile in dashboard page", e));

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

  const fetchApi = async (url: string) => {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`API fetch failed: ${res.statusText}`);
    return res.json();
  };

  const fetchDashboardData = useCallback(async (isSilentRefresh: boolean = false) => {
    if (!isSilentRefresh) setLoading(true);
    setRefreshing(true);

    try {
      const [
        pendingReqRes,
        inTransitRes,
        deliveredRes,
        locationsRes,
        onHoldRes,
        failedDeliveryRes,
        recentShipmentsRes,
      ] = await Promise.all([
        fetchApi("/api/v1/courier-requests?status=PENDING&limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/shipments?currentStatus=IN_TRANSIT&limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/shipments?currentStatus=DELIVERED&limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/locations?limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/shipments?currentStatus=ON_HOLD&limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/shipments?currentStatus=FAILED_DELIVERY&limit=100").catch(() => ({ data: [], meta: { total: 0 } })),
        fetchApi("/api/v1/shipments?limit=10").catch(() => ({ data: [], meta: { total: 0 } })),
      ]);

      const pendingRequests = pendingReqRes.data || [];
      const pendingTotal = pendingReqRes.meta?.total ?? pendingRequests.length;
      const inTransitShipments = inTransitRes.data || [];
      const inTransitTotal = inTransitRes.meta?.total ?? inTransitShipments.length;
      const deliveredShipments = deliveredRes.data || [];
      const allLocations: Location[] = locationsRes.data || [];
      const onHoldShipments = onHoldRes.data || [];
      const onHoldCount = onHoldRes.meta?.total ?? onHoldShipments.length;
      const failedShipments = failedDeliveryRes.data || [];
      const failedCount = failedDeliveryRes.meta?.total ?? failedShipments.length;
      const latestShipments: Shipment[] = recentShipmentsRes.data || [];

      setLocations(allLocations);
      setRecentShipments(latestShipments);
      setAllActiveShipments(latestShipments);

      // 1. Pending subtext calculation (last 4 hours)
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
      const addedLast4Hours = pendingRequests.filter(
        (r: any) => new Date(r.createdAt).getTime() >= fourHoursAgo
      ).length;
      const pendingSubtext = `${addedLast4Hours} added in the last 4 hours`;

      // 2. In-Transit active corridors calculation
      const corridorSet = new Set<string>();
      inTransitShipments.forEach((s: any) => {
        const org = s.originLocation?.code || s.originLocationId || "HUB-A";
        const dst = s.destinationLocation?.code || s.destinationLocationId || "HUB-B";
        corridorSet.add(`${org}→${dst}`);
      });
      const corridorCount = corridorSet.size;
      const inTransitSubtext = `Across ${corridorCount} active corridor${corridorCount === 1 ? "" : "s"}`;

      // 3. Today's Deliveries calculation
      const todayDateStr = new Date().toDateString();
      const deliveredTodayCount = deliveredShipments.filter((s: any) => {
        const itemDate = s.updatedAt || s.createdAt;
        return itemDate && new Date(itemDate).toDateString() === todayDateStr;
      }).length;

      const scheduledTodayCount = latestShipments.filter((s: any) => {
        return s.estimatedDeliveryDate && new Date(s.estimatedDeliveryDate).toDateString() === todayDateStr;
      }).length;
      const deliveriesSubtext = `${deliveredTodayCount} delivered · ${scheduledTodayCount} scheduled`;

      // 4. Active Hubs subtext calculation
      const activeHubs = allLocations.filter((l) => l.isActive !== false);
      const inactiveCount = allLocations.length - activeHubs.length;
      const hubsSubtext =
        inactiveCount === 0
          ? "All reporting normally"
          : `${inactiveCount} location${inactiveCount === 1 ? "" : "s"} offline`;

      // 5. Oldest pending calculation
      let oldestPendingSubtitle = "No pending requests awaiting review";
      if (pendingRequests.length > 0) {
        const sorted = [...pendingRequests].sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const oldest = sorted[0];
        oldestPendingSubtitle = `Oldest pending for ${formatElapsedTime(oldest.createdAt)}`;
      }

      // 6. Intervention calculation (ON_HOLD + FAILED_DELIVERY)
      const totalIntervention = onHoldCount + failedCount;
      const interventionSubtitle =
        totalIntervention === 0
          ? "All shipments moving normally"
          : `${failedCount} failed deliver${failedCount === 1 ? "y" : "ies"} · ${onHoldCount} customs hold`;

      setStats({
        pendingRequests: pendingTotal,
        inTransitShipments: inTransitTotal,
        todaysDeliveries: deliveredTodayCount || deliveredRes.meta?.total || 0,
        activeHubs: activeHubs.length,
        totalHubs: allLocations.length,
        requestsAwaitingReview: pendingTotal,
        shipmentsNeedIntervention: totalIntervention,
        failedDeliveriesCount: failedCount,
        onHoldCount: onHoldCount,
      });

      setSubtexts({
        pendingSubtext,
        inTransitSubtext,
        deliveriesSubtext,
        hubsSubtext,
        oldestPendingSubtitle,
        interventionSubtitle,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data from backend server", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load & Polling interval (every 30 seconds)
  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    const handleDataRefresh = () => fetchDashboardData(true);
    window.addEventListener("shipment-updated", handleDataRefresh);
    window.addEventListener("courier-request-created", handleDataRefresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("shipment-updated", handleDataRefresh);
      window.removeEventListener("courier-request-created", handleDataRefresh);
    };
  }, [fetchDashboardData]);

  // Handle Quick Action: Log Checkpoint
  const handleOpenLogCheckpoint = (shipment?: Shipment) => {
    setSelectedShipmentForCheckpoint(shipment || null);
    setIsCheckpointModalOpen(true);
  };

  // Handle Feed Item Click -> Open details
  const handleOpenShipmentDetails = async (shipment: Shipment) => {
    try {
      const fullRes = await fetchShipmentById(shipment.id);
      if (fullRes.success && fullRes.data) {
        setSelectedShipmentForDetails(fullRes.data);
      } else {
        setSelectedShipmentForDetails(shipment);
      }
    } catch {
      setSelectedShipmentForDetails(shipment);
    }
    setIsDetailsModalOpen(true);
  };

  // Quick Track Search Action
  const handleQuickTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const cleanNum = trackQuery.trim();
      const res = await fetchShipments(1, 1, undefined, undefined, undefined, undefined, cleanNum);
      if (res.success && res.data && res.data.length > 0) {
        const found = res.data[0];
        const detailRes = await fetchShipmentById(found.id).catch(() => ({ data: found }));
        setTrackResult(detailRes.data || found);
      } else {
        setTrackError(`No shipment found matching tracking number "${cleanNum}". Please verify.`);
      }
    } catch (err: any) {
      setTrackError(err.message || "Failed to search tracking number");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleCopy = (e: React.MouseEvent, num: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const today = new Date();
  const formattedDayMonthYear = `${today.getDate()} ${today.toLocaleDateString("en-GB", { month: "long" })} ${today.getFullYear()}.`;
  const currentShift = getOperationalShift(today);

  // Active items to display in feed: strictly mapped from backend server recent shipments
  const displayFeedItems = recentShipments.map((s) => ({
    id: s.id,
    status: s.currentStatus || "ARRIVED_AT_HUB",
    trackingNumber: s.trackingNumber,
    description:
      s.trackingUpdates && s.trackingUpdates.length > 0
        ? s.trackingUpdates[0].description
        : `Shipment status updated to ${(s.currentStatus || "ARRIVED_AT_HUB").replace(/_/g, " ")}`,
    location:
      s.currentLocation?.name ||
      s.currentLocation?.city ||
      s.originLocation?.city ||
      "Transit Hub",
    time: formatFeedTime(s.updatedAt || s.createdAt),
    rawShipment: s,
  }));

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header with Title, Shift & Actions matching screenshot */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36] tracking-tight">
            Operations Dashboard
          </h1>
          <div className="text-xs sm:text-sm text-slate-500 mt-1 leading-snug">
            <div>{formattedDayMonthYear}</div>
            <div>{currentShift}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard data"
          >
            <RefreshCw className={clsx("h-4 w-4", refreshing && "animate-spin text-blue-600")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenLogCheckpoint()}
            className="bg-[#0B1E36] hover:bg-[#132A4B] text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Log Checkpoint</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - 2 columns on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard 
          title="PENDING REQUESTS"
          value={loading ? "..." : stats.pendingRequests}
          subtext={subtexts.pendingSubtext}
          onClick={() => router.push("/admin/requests?status=PENDING")}
        />
        <StatCard 
          title="IN-TRANSIT SHIPMENTS"
          value={loading ? "..." : stats.inTransitShipments}
          subtext={subtexts.inTransitSubtext}
          onClick={() => router.push("/admin/shipments?currentStatus=IN_TRANSIT")}
        />
        <StatCard 
          title="TODAY'S DELIVERIES"
          value={loading ? "..." : stats.todaysDeliveries}
          subtext={subtexts.deliveriesSubtext}
          onClick={() => router.push("/admin/shipments?currentStatus=DELIVERED")}
        />
        <StatCard 
          title="ACTIVE HUBS"
          value={loading ? "..." : stats.activeHubs}
          subtext={subtexts.hubsSubtext}
          onClick={() => router.push("/admin/locations")}
        />
      </div>

      {/* Middle Split: Operational Priorities (Left / Full) & Quick Actions (Right / Full) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Priorities Card Container */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Operational priorities</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-4">Immediate work requiring attention</p>
          
          <div className="space-y-3">
            {/* Priority Item 1: Pending Requests */}
            <div 
              onClick={() => router.push("/admin/requests?status=PENDING")}
              className="flex items-center justify-between group cursor-pointer py-1"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-amber-200/90 bg-amber-50/70 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="h-5 w-5 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {loading ? "..." : stats.requestsAwaitingReview} requests awaiting review
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {subtexts.oldestPendingSubtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>

            <div className="border-b border-slate-100" />

            {/* Priority Item 2: Shipments Need Intervention */}
            <div 
              onClick={() => router.push("/admin/shipments?currentStatus=ON_HOLD")}
              className="flex items-center justify-between group cursor-pointer py-1"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-rose-200/90 bg-rose-50/70 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {stats.shipmentsNeedIntervention} shipments need intervention
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {subtexts.interventionSubtitle}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>

            <div className="border-b border-slate-100" />

            {/* Priority Item 3: Log a Shipment Checkpoint */}
            <div 
              onClick={() => handleOpenLogCheckpoint()}
              className="flex items-center justify-between group cursor-pointer py-1"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-slate-700" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    Log a shipment checkpoint
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    Search by tracking number and record an event
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Quick actions</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 mb-3 sm:mb-4">Start common operational tasks</p>
          
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <QuickActionCard 
              icon={<FileText className="h-4 w-4 text-[#0284C7] shrink-0" />} 
              title="New Courier Request"
              onClick={() => setIsCreateRequestModalOpen(true)}
            />
            <QuickActionCard 
              icon={<Plus className="h-4 w-4 text-[#0284C7] shrink-0" />} 
              title="Log Checkpoint" 
              onClick={() => handleOpenLogCheckpoint()}
            />
            <QuickActionCard 
              icon={<Search className="h-4 w-4 text-[#0284C7] shrink-0" />} 
              title="Track Number" 
              onClick={() => {
                setTrackQuery("");
                setTrackResult(null);
                setTrackError(null);
                setIsTrackModalOpen(true);
              }}
            />
            <QuickActionCard 
              icon={<Building2 className="h-4 w-4 text-[#0284C7] shrink-0" />} 
              title="View Network" 
              onClick={() => router.push("/admin/locations")}
            />
          </div>
        </div>
      </div>

      {/* Recent Tracking Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">Recent tracking feed</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Latest verified checkpoints</p>
          </div>
          <button 
            onClick={() => router.push("/admin/shipments")}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {loading && displayFeedItems.length === 0 ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-100 text-slate-400 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs sm:text-sm">Loading recent updates across the network...</span>
            </div>
          ) : displayFeedItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-500 text-xs sm:text-sm shadow-2xs">
              No recent tracking checkpoints found in the network.
            </div>
          ) : (
            displayFeedItems.map((item) => {
              const pillConfig = STATUS_PILL_CONFIG[item.status] || STATUS_PILL_CONFIG["ARRIVED_AT_HUB"];
              return (
                <div 
                  key={item.id}
                  onClick={() => handleOpenShipmentDetails(item.rawShipment || item)}
                  className="bg-white rounded-2xl border border-slate-100 p-3.5 sm:p-4 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group space-y-1.5"
                >
                  {/* Top row: Status pill + Location & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={clsx(
                      "px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-tight shrink-0", 
                      pillConfig.bg, 
                      pillConfig.border, 
                      pillConfig.text
                    )}>
                      {pillConfig.label}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.location} · {item.time}</span>
                    </div>
                  </div>

                  {/* Middle row: Tracking number with Copy button */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, item.trackingNumber)}
                      title="Copy tracking number"
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-sm cursor-pointer"
                    >
                      {copiedId === item.trackingNumber ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Bottom row: Description */}
                  <div className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                    {item.description}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Checkpoint Modal */}
      {isCheckpointModalOpen && (
        <CheckpointModal
          isOpen={isCheckpointModalOpen}
          onClose={() => {
            setIsCheckpointModalOpen(false);
            setSelectedShipmentForCheckpoint(null);
          }}
          onSuccess={() => {
            fetchDashboardData(true);
          }}
          locations={locations}
          shipment={selectedShipmentForCheckpoint}
          allShipments={allActiveShipments}
          userRole={currentUser?.role}
        />
      )}

      {/* Create Request Modal */}
      {isCreateRequestModalOpen && (
        <CreateRequestModal
          isOpen={isCreateRequestModalOpen}
          onClose={() => setIsCreateRequestModalOpen(false)}
          onSuccess={() => {
            fetchDashboardData(true);
          }}
          availableLocations={locations}
        />
      )}

      {/* Shipment Details & Timeline Modal */}
      {isDetailsModalOpen && selectedShipmentForDetails && (
        <ShipmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedShipmentForDetails(null);
          }}
          shipment={selectedShipmentForDetails}
          userRole={currentUser?.role}
          onLogCheckpoint={(shipment) => {
            setIsDetailsModalOpen(false);
            handleOpenLogCheckpoint(shipment);
          }}
          onUpdateSuccess={(updated) => {
            fetchDashboardData(true);
            setSelectedShipmentForDetails(updated);
          }}
        />
      )}

      {/* Quick Track Number Dialog */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0B1E36] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Quick Shipment Lookup</h3>
              </div>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <form onSubmit={handleQuickTrackSubmit} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Tracking Number (LSBD-YYYYMM-XXXXX)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value.toUpperCase())}
                      placeholder="e.g. LSBD-202609-00001"
                      className="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                      autoFocus
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="bg-[#0B1E36] hover:bg-[#132A4B] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </div>
              </form>

              {trackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Tracking Number</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{trackResult.trackingNumber}</div>
                    </div>
                    <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                      {trackResult.currentStatus?.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Sender:</span>
                      <p className="font-semibold text-slate-800 truncate">{trackResult.senderName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Recipient:</span>
                      <p className="font-semibold text-slate-800 truncate">{trackResult.recipientName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Current Location:</span>
                      <p className="font-semibold text-slate-800">
                        {trackResult.currentLocation?.name || trackResult.originLocation?.name || "Hub"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Destination:</span>
                      <p className="font-semibold text-slate-800">
                        {trackResult.destinationLocation?.city || "Destination"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsTrackModalOpen(false);
                        setSelectedShipmentForDetails(trackResult);
                        setIsDetailsModalOpen(true);
                      }}
                      className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Full Details
                    </button>
                    <button
                      onClick={() => {
                        setIsTrackModalOpen(false);
                        handleOpenLogCheckpoint(trackResult);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log Checkpoint
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtext,
  onClick
}: { 
  title: string; 
  value: string | number; 
  subtext: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs transition-all group flex flex-col justify-between",
        onClick && "hover:border-blue-200 hover:shadow-sm cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 tracking-wider uppercase">
          {title}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 my-1 sm:my-1.5">
        {value}
      </div>
      <div className="text-[11px] sm:text-xs text-slate-500 font-medium leading-snug line-clamp-2">
        {subtext}
      </div>
    </div>
  );
}

function QuickActionCard({ 
  icon, 
  title,
  onClick
}: { 
  icon: React.ReactNode; 
  title: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors">
        {title}
      </div>
    </div>
  );
}
