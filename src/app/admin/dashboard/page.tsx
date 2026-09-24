"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ClipboardList, 
  Truck, 
  BadgeCheck, 
  Building2, 
  ClipboardCheck, 
  AlertTriangle, 
  PlusSquare, 
  FilePlus, 
  Plus, 
  Search, 
  Network,
  MapPin,
  ArrowRight,
  ChevronRight,
  Clock,
  Compass,
  RotateCcw,
  PauseCircle,
  CheckCircle2,
  XCircle,
  Slash,
  Package,
  RefreshCw,
  Loader2,
  X,
  ExternalLink
} from "lucide-react";
import clsx from "clsx";
import { fetchLocations, fetchShipments, fetchShipmentById, fetchUserProfile } from "@/lib/api";
import { Location, Shipment, ShipmentStatus, StaffUser } from "@/lib/types";
import { CheckpointModal } from "@/components/admin/CheckpointModal";
import { CreateRequestModal } from "@/components/admin/CreateRequestModal";
import { ShipmentDetailsModal } from "@/components/admin/ShipmentDetailsModal";

// Design Tokens for Status Indicators (PDF Table 2)
const STATUS_CONFIG: Record<
  string, 
  { bg: string; border: string; text: string; label: string; icon: React.ElementType }
> = {
  PENDING: {
    bg: "bg-[#FEF3C7]",
    border: "border-[#B45309]/30",
    text: "text-[#B45309]",
    label: "Awaiting Review",
    icon: Clock,
  },
  APPROVED: {
    bg: "bg-[#D1FAE5]",
    border: "border-[#047857]/30",
    text: "text-[#047857]",
    label: "Approved",
    icon: CheckCircle2,
  },
  REJECTED: {
    bg: "bg-[#FEE2E2]",
    border: "border-[#B91C1C]/30",
    text: "text-[#B91C1C]",
    label: "Rejected",
    icon: XCircle,
  },
  CANCELLED: {
    bg: "bg-[#F1F5F9]",
    border: "border-[#475569]/30",
    text: "text-[#475569]",
    label: "Cancelled",
    icon: Slash,
  },
  PROCESSING: {
    bg: "bg-[#DBEAFE]",
    border: "border-[#1D4ED8]/30",
    text: "text-[#1D4ED8]",
    label: "Processing",
    icon: Package,
  },
  IN_TRANSIT: {
    bg: "bg-[#E0F2FE]",
    border: "border-[#0369A1]/30",
    text: "text-[#0369A1]",
    label: "In Transit",
    icon: Truck,
  },
  ARRIVED_AT_HUB: {
    bg: "bg-[#EDE9FE]",
    border: "border-[#6D28D9]/30",
    text: "text-[#6D28D9]",
    label: "Arrived at Hub",
    icon: Building2,
  },
  OUT_FOR_DELIVERY: {
    bg: "bg-[#FFEDD5]",
    border: "border-[#C2410C]/30",
    text: "text-[#C2410C]",
    label: "Out for Delivery",
    icon: Compass,
  },
  DELIVERED: {
    bg: "bg-[#DCFCE7]",
    border: "border-[#15803D]/30",
    text: "text-[#15803D]",
    label: "Delivered",
    icon: BadgeCheck,
  },
  FAILED_DELIVERY: {
    bg: "bg-[#FFE4E6]",
    border: "border-[#BE123C]/30",
    text: "text-[#BE123C]",
    label: "Failed Delivery",
    icon: AlertTriangle,
  },
  ON_HOLD: {
    bg: "bg-[#FEF9C3]",
    border: "border-[#A16207]/30",
    text: "text-[#A16207]",
    label: "On Hold",
    icon: PauseCircle,
  },
  RETURNED: {
    bg: "bg-[#F3F4F6]",
    border: "border-[#374151]/30",
    text: "text-[#374151]",
    label: "Returned",
    icon: RotateCcw,
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
    const offsetMin = -d.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMin) / 60);
    const sign = offsetMin >= 0 ? "+" : "-";
    const gmtStr = `GMT${sign}${offsetHours}`;
    return `${timeStr} ${gmtStr}`;
  } catch {
    return "Just now";
  }
}

export default function DashboardPage() {
  const router = useRouter();

  // Primary operational stats
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

  // Dynamic calculated subtexts
  const [subtexts, setSubtexts] = useState({
    pendingSubtext: "Checking requests...",
    inTransitSubtext: "Calculating corridors...",
    deliveriesSubtext: "0 delivered · 0 scheduled",
    hubsSubtext: "All reporting normally",
    oldestPendingSubtitle: "Calculating pending time...",
    interventionSubtitle: "0 failed deliveries · 0 customs hold",
  });

  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [allActiveShipments, setAllActiveShipments] = useState<Shipment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

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
      const corridorCount = corridorSet.size || (inTransitTotal > 0 ? 1 : 0);
      const inTransitSubtext = `Across ${corridorCount} active corridor${corridorCount === 1 ? "" : "s"}`;

      // 3. Today's Deliveries calculation
      const todayDateStr = new Date().toDateString();
      const deliveredTodayCount = deliveredShipments.filter((s: any) => {
        const itemDate = s.updatedAt || s.createdAt;
        return itemDate && new Date(itemDate).toDateString() === todayDateStr;
      }).length;

      // Shipments scheduled today
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
          : `${failedCount} failed deliver${failedCount === 1 ? "y" : "ies"} · ${onHoldCount} customs/operational hold`;

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

      setLastRefreshedAt(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
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
        // Fetch complete details including trackingUpdates timeline
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

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: "long", 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  };
  const formattedDate = today.toLocaleDateString("en-GB", dateOptions);
  const currentShift = getOperationalShift(today);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Shift & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm">
            <span>{formattedDate}</span>
            <span>·</span>
            <span className="font-medium text-slate-700">{currentShift}</span>
            <span>·</span>
            <span className="text-xs text-slate-400">
              Updated {lastRefreshedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={clsx("h-4 w-4 text-slate-600", refreshing && "animate-spin text-blue-600")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenLogCheckpoint()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Log Checkpoint
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - All Clickable with Live Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<ClipboardList className="h-5 w-5 text-slate-600" />}
          title="PENDING REQUESTS"
          value={loading ? "..." : stats.pendingRequests}
          subtext={subtexts.pendingSubtext}
          onClick={() => router.push("/admin/requests?status=PENDING")}
        />
        <StatCard 
          icon={<Truck className="h-5 w-5 text-slate-600" />}
          title="IN-TRANSIT SHIPMENTS"
          value={loading ? "..." : stats.inTransitShipments}
          subtext={subtexts.inTransitSubtext}
          onClick={() => router.push("/admin/shipments?currentStatus=IN_TRANSIT")}
        />
        <StatCard 
          icon={<BadgeCheck className="h-5 w-5 text-slate-600" />}
          title="TODAY'S DELIVERIES"
          value={loading ? "..." : stats.todaysDeliveries}
          subtext={subtexts.deliveriesSubtext}
          onClick={() => router.push("/admin/shipments?currentStatus=DELIVERED")}
        />
        <StatCard 
          icon={<Building2 className="h-5 w-5 text-slate-600" />}
          title="ACTIVE HUBS"
          value={loading ? "..." : stats.activeHubs}
          subtext={subtexts.hubsSubtext}
          onClick={() => router.push("/admin/locations")}
        />
      </div>

      {/* Middle Split Section: Operational Priorities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Priorities */}
        <div className="lg:col-span-2 bg-blue-50/30 rounded-xl border border-blue-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">Operational priorities</h2>
          <p className="text-sm text-slate-500 mb-5">Immediate work requiring attention</p>
          
          <div className="space-y-3">
            <PriorityCard 
              icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
              iconBg="bg-amber-100"
              title={`${loading ? "..." : stats.requestsAwaitingReview} requests awaiting review`}
              subtitle={subtexts.oldestPendingSubtitle}
              onClick={() => router.push("/admin/requests?status=PENDING")}
            />
            <PriorityCard 
              icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
              iconBg="bg-rose-100"
              title={`${stats.shipmentsNeedIntervention} shipments need intervention`}
              subtitle={subtexts.interventionSubtitle}
              onClick={() => router.push("/admin/shipments?currentStatus=ON_HOLD")}
            />
            <PriorityCard 
              icon={<PlusSquare className="h-5 w-5 text-slate-600" />}
              iconBg="bg-slate-200"
              title="Log a shipment checkpoint"
              subtitle="Search by tracking number and record an event"
              onClick={() => handleOpenLogCheckpoint()}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50/30 rounded-xl border border-blue-100 p-6">
          <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
          <p className="text-sm text-slate-500 mb-5">Start common operational tasks</p>
          
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard 
              icon={<FilePlus className="h-4 w-4 text-blue-600" />} 
              title="New Courier Request"
              onClick={() => setIsCreateRequestModalOpen(true)}
            />
            <QuickActionCard 
              icon={<Plus className="h-4 w-4 text-blue-600" />} 
              title="Log Checkpoint" 
              onClick={() => handleOpenLogCheckpoint()}
            />
            <QuickActionCard 
              icon={<Search className="h-4 w-4 text-blue-600" />} 
              title="Track Number" 
              onClick={() => {
                setTrackQuery("");
                setTrackResult(null);
                setTrackError(null);
                setIsTrackModalOpen(true);
              }}
            />
            <QuickActionCard 
              icon={<Network className="h-4 w-4 text-blue-600" />} 
              title="View Network" 
              onClick={() => router.push("/admin/locations")}
            />
          </div>
        </div>
      </div>

      {/* Recent Tracking Feed (PDF Screen 4: Chronological list of last 10 checkpoint updates) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent tracking feed</h2>
            <p className="text-sm text-slate-500">Latest verified checkpoints across the LSBD network</p>
          </div>
          <button 
            onClick={() => router.push("/admin/shipments")}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            View all shipments
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center p-8 bg-white rounded-xl border border-slate-200 text-slate-500 gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm">Loading recent updates across the network...</span>
            </div>
          ) : recentShipments.length > 0 ? (
            recentShipments.map((shipment) => {
              const currentStatus = shipment.currentStatus || "ARRIVED_AT_HUB";
              const latestCheckpointDesc = 
                shipment.trackingUpdates && shipment.trackingUpdates.length > 0
                  ? shipment.trackingUpdates[0].description
                  : `Shipment status updated to ${currentStatus.replace(/_/g, " ")}`;

              const locationDisplay =
                shipment.currentLocation?.name ||
                shipment.currentLocation?.code ||
                shipment.originLocation?.name ||
                "Transit Hub";

              const timeDisplay = formatFeedTime(shipment.updatedAt || shipment.createdAt);

              return (
                <FeedItem 
                  key={shipment.id || shipment.trackingNumber}
                  status={currentStatus}
                  trackingNumber={shipment.trackingNumber}
                  description={latestCheckpointDesc}
                  location={locationDisplay}
                  time={timeDisplay}
                  onClick={() => handleOpenShipmentDetails(shipment)}
                />
              );
            })
          ) : (
            <div className="text-sm text-slate-500 p-8 text-center bg-white rounded-xl border border-slate-200">
              No recent tracking updates available.
            </div>
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
          onLogCheckpoint={(shipment) => {
            setIsDetailsModalOpen(false);
            handleOpenLogCheckpoint(shipment);
          }}
        />
      )}

      {/* Quick Track Number Dialog */}
      {isTrackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#0B132B] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Quick Shipment Lookup</h3>
              </div>
              <button
                onClick={() => setIsTrackModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                      className="w-full pl-3 pr-4 py-2 border border-slate-300 rounded-md text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                      autoFocus
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search
                  </button>
                </div>
              </form>

              {trackError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-xs text-slate-500">Tracking Number</div>
                      <div className="font-mono font-bold text-sm text-slate-900">{trackResult.trackingNumber}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                      {trackResult.currentStatus?.replace(/_/g, " ")}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Sender:</span>
                      <p className="font-semibold text-slate-800 truncate">{trackResult.senderName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Recipient:</span>
                      <p className="font-semibold text-slate-800 truncate">{trackResult.recipientName}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Current Location:</span>
                      <p className="font-semibold text-slate-800">
                        {trackResult.currentLocation?.name || trackResult.originLocation?.name || "Hub"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Destination:</span>
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
                      className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Full Details
                    </button>
                    <button
                      onClick={() => {
                        setIsTrackModalOpen(false);
                        handleOpenLogCheckpoint(trackResult);
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded flex items-center justify-center gap-1.5 transition-colors"
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
  icon, 
  title, 
  value, 
  subtext,
  onClick
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  subtext: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-all group",
        onClick && "hover:border-blue-300 hover:shadow-md cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="text-[11px] font-bold text-slate-800 tracking-wider mb-1">{title}</div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium truncate">{subtext}</div>
    </div>
  );
}

function PriorityCard({ 
  icon, 
  iconBg, 
  title, 
  subtitle,
  onClick
}: { 
  icon: React.ReactNode; 
  iconBg: string; 
  title: string; 
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-blue-100 p-4 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={clsx("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
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
      className="bg-white rounded-xl border border-blue-100 p-4 flex flex-col items-start gap-3 hover:border-blue-300 transition-colors cursor-pointer group shadow-sm aspect-video justify-center"
    >
      <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <div className="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-700 transition-colors">{title}</div>
    </div>
  );
}

function FeedItem({ 
  status, 
  trackingNumber, 
  description, 
  location, 
  time,
  onClick
}: { 
  status: ShipmentStatus | string; 
  trackingNumber: string; 
  description: string; 
  location: string; 
  time: string;
  onClick?: () => void;
}) {
  // Exhaustive mapping based strictly on Design Tokens in the PDF (Table 2)
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["ARRIVED_AT_HUB"];
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl border border-blue-100 p-4 flex items-center justify-between shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold shrink-0 shadow-sm", config.bg, config.border, config.text)}>
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </div>
        <div className="flex items-center gap-3 min-w-0 truncate">
          <span className="text-slate-900 font-bold text-sm shrink-0 group-hover:text-blue-700 transition-colors">
            {trackingNumber}
          </span>
          <span className="text-slate-400 shrink-0">·</span>
          <span className="text-slate-600 text-sm truncate">{description}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium shrink-0 ml-4">
        <MapPin className="h-3.5 w-3.5 text-slate-400" />
        <span>{location}</span>
        <span className="mx-0.5">·</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
