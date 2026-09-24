"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Check, AlertTriangle, Clock, MapPin, 
  Loader2, CheckCircle2, Building2, Truck, Compass, 
  PauseCircle, Package, Lock, ShieldAlert, RotateCcw, Slash 
} from "lucide-react";
import clsx from "clsx";
import { Shipment, Location, ShipmentStatus } from "@/lib/types";
import { logShipmentCheckpoint, fetchUserProfile } from "@/lib/api";

interface CheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locations: Location[];
  shipment?: Shipment | null;
  allShipments?: Shipment[];
  userRole?: string;
}

const STATUS_OPTIONS: { value: ShipmentStatus; label: string; icon: React.ElementType }[] = [
  { value: "PROCESSING", label: "Processing", icon: Package },
  { value: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { value: "ARRIVED_AT_HUB", label: "Arrived at Hub", icon: Building2 },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Compass },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  { value: "ON_HOLD", label: "On Hold", icon: PauseCircle },
  { value: "FAILED_DELIVERY", label: "Failed Delivery", icon: AlertTriangle },
  { value: "RETURNED", label: "Returned", icon: RotateCcw },
  { value: "CANCELLED", label: "Cancelled", icon: Slash },
];

const STATUS_HIERARCHY: Record<string, number> = {
  PROCESSING: 1,
  IN_TRANSIT: 2,
  ARRIVED_AT_HUB: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
};

const TERMINAL_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED"];

const PRESET_DESCRIPTIONS = [
  "Arrived at sorting facility and undergoing inbound scan",
  "Customs clearance completed successfully",
  "Departed transit hub on commercial flight",
  "Out for delivery with local dispatch agent",
  "Shipment handed over and signed by recipient",
  "Held temporarily for address verification",
];

export function CheckpointModal({
  isOpen,
  onClose,
  onSuccess,
  locations,
  shipment,
  allShipments = [],
  userRole,
}: CheckpointModalProps) {
  const [internalRole, setInternalRole] = useState<string | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [status, setStatus] = useState<ShipmentStatus>("ARRIVED_AT_HUB");
  const [description, setDescription] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If userRole is not provided via prop, fetch as resilient fallback (PDF Spec Section 7.1.4)
  useEffect(() => {
    if (!userRole && isOpen) {
      fetchUserProfile()
        .then((res) => {
          if (res.success && res.data?.role) {
            setInternalRole(res.data.role);
          }
        })
        .catch(() => {});
    }
  }, [userRole, isOpen]);

  const effectiveRole = (userRole || internalRole || "EMPLOYEE").toUpperCase();
  const isEmployee = effectiveRole === "EMPLOYEE";
  const isManagerOrAdmin = effectiveRole === "MANAGER" || effectiveRole === "ADMIN";

  useEffect(() => {
    if (isOpen) {
      setError(null);
      const activeShipment = shipment || (allShipments.length > 0 ? allShipments[0] : null);
      if (activeShipment) {
        setSelectedShipmentId(activeShipment.id);
        setSelectedLocationId(
          activeShipment.currentLocation?.id || 
          activeShipment.originLocation?.id || 
          (locations.length > 0 ? locations[0].id : "")
        );
        const curStatus = activeShipment.currentStatus;
        if (curStatus === "PROCESSING") setStatus("IN_TRANSIT");
        else if (curStatus === "IN_TRANSIT") setStatus("ARRIVED_AT_HUB");
        else if (curStatus === "ARRIVED_AT_HUB") setStatus("OUT_FOR_DELIVERY");
        else if (curStatus === "OUT_FOR_DELIVERY") setStatus("DELIVERED");
        else if (["DELIVERED", "CANCELLED", "RETURNED", "ON_HOLD", "FAILED_DELIVERY"].includes(curStatus)) {
          setStatus(curStatus as ShipmentStatus);
        } else {
          setStatus("ARRIVED_AT_HUB");
        }
      } else {
        if (locations.length > 0) setSelectedLocationId(locations[0].id);
        setStatus("ARRIVED_AT_HUB");
      }

      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setTimestamp(localIso);
      setDescription("");
      setIsPublic(true);
    }
  }, [isOpen, shipment, allShipments, locations]);

  if (!isOpen) return null;

  const currentActiveShipment = shipment || allShipments.find(s => s.id === selectedShipmentId);
  const currentHierarchy = currentActiveShipment ? STATUS_HIERARCHY[currentActiveShipment.currentStatus] || 0 : 0;
  const targetHierarchy = STATUS_HIERARCHY[status] || 0;

  // Terminal State Lock (PDF Section 3.3.2): DELIVERED, CANCELLED, RETURNED
  const isCurrentTerminal = Boolean(
    currentActiveShipment && TERMINAL_STATUSES.includes(currentActiveShipment.currentStatus)
  );
  const isTerminalLockedForUser = isCurrentTerminal && isEmployee;

  // Backward Flow Guard (PDF Section 3.3.2): Transition to earlier status requires Manager/Admin & description
  const isBackwardsTransition = 
    currentHierarchy > 0 && 
    targetHierarchy > 0 && 
    targetHierarchy < currentHierarchy;

  const isBackwardOption = (optValue: string): boolean => {
    if (!currentActiveShipment) return false;
    const currentLevel = STATUS_HIERARCHY[currentActiveShipment.currentStatus] || 0;
    const optLevel = STATUS_HIERARCHY[optValue] || 0;
    return currentLevel > 0 && optLevel > 0 && optLevel < currentLevel;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipmentId) {
      setError("Please select a shipment.");
      return;
    }
    if (!selectedLocationId) {
      setError("Please select a transit hub / location.");
      return;
    }

    // RBAC: Terminal State Enforcement (PDF Section 3.3.2)
    if (isTerminalLockedForUser) {
      setError("Terminal State Lock: Regular employees cannot transition a shipment out of a terminal state (PDF Section 3.3.2). Only a Manager or Admin can override.");
      return;
    }

    // RBAC: Backward Flow Enforcement (PDF Section 3.3.2)
    if (isEmployee && isBackwardsTransition) {
      setError("Role Permission Restricted: Regular employees cannot revert shipment status to an earlier stage (PDF Section 3.3.2).");
      return;
    }

    // RBAC: Audit explanation requirement for backward transitions
    if (isBackwardsTransition && !description.trim()) {
      setError("Audit justification description is mandatory when performing a backwards status transition (PDF Section 3.3.2).");
      return;
    }

    if (!description.trim()) {
      setError("Please provide a description or audit note.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await logShipmentCheckpoint(selectedShipmentId, {
        locationId: selectedLocationId,
        status,
        description: description.trim(),
        isPublic,
        timestamp: new Date(timestamp).toISOString(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log checkpoint update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0f1b3b] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Log Checkpoint Update</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Record a physical parcel movement into the internal audit trail.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Shipment Target */}
          {!shipment && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Shipment
              </label>
              <select
                value={selectedShipmentId}
                onChange={(e) => setSelectedShipmentId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a shipment...</option>
                {allShipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} — {s.senderName} ({s.currentStatus})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentActiveShipment && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500">Tracking #: </span>
                <span className="font-bold text-slate-800">{currentActiveShipment.trackingNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Current Status: </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentActiveShipment.currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          )}

          {/* RBAC Directive: Terminal State Lock Banner (PDF Section 3.3.2) */}
          {isTerminalLockedForUser && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 leading-relaxed">
                <span className="font-bold">Terminal State Locked:</span> This shipment is in <strong>{currentActiveShipment?.currentStatus}</strong> status. Regular employees cannot transition a shipment out of a terminal state (PDF Section 3.3.2). Only a Manager or Admin can perform an override.
              </div>
            </div>
          )}

          {/* RBAC Directive: Supervisor Override Notice (PDF Section 3.3.2 & UI Directive Page 7) */}
          {isBackwardsTransition && isManagerOrAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900">
                  Supervisor Override: Backwards status change requires an audit explanation.
                </div>
                <div className="text-amber-800 mt-0.5">
                  Reverting shipment status from <strong>{currentActiveShipment?.currentStatus.replace(/_/g, " ")}</strong> to <strong>{status.replace(/_/g, " ")}</strong> requires an audit justification (PDF Section 3.3.2). Ensure the description textarea is filled.
                </div>
              </div>
            </div>
          )}

          {/* Station / Hub Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Transit Hub / Location
            </label>
            <select
              value={selectedLocationId}
              disabled={isTerminalLockedForUser}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* New Status Grid (PDF Directive: Disable backwards transitions for Employee) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                New Shipment Status
              </label>
              {isEmployee && (
                <span className="text-[11px] text-slate-500">
                  Role: Employee (Sequential flow enforced)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.value;
                const isBackward = isBackwardOption(opt.value);
                const isDisabledForEmployee = (isEmployee && isBackward) || isTerminalLockedForUser;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabledForEmployee || isSubmitting}
                    onClick={() => {
                      if (!isDisabledForEmployee) {
                        setStatus(opt.value);
                      }
                    }}
                    title={
                      isTerminalLockedForUser
                        ? "Shipment is in terminal state"
                        : isEmployee && isBackward
                        ? "Permission Restricted: Regular employees cannot revert shipment status (PDF Section 3.3.2)"
                        : opt.label
                    }
                    className={clsx(
                      "flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-medium transition-all text-left relative",
                      isDisabledForEmployee
                        ? "opacity-35 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        : isSelected
                        ? "border-[#0B132B] bg-[#0B132B] text-white shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={clsx("w-3.5 h-3.5 shrink-0", isSelected ? "text-emerald-400" : "text-slate-400")} />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isEmployee && isBackward && (
                      <span className="text-[9px] uppercase font-bold text-rose-500 shrink-0 ml-1">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Event Description & Audit Notes{" "}
                {isBackwardsTransition && <span className="text-rose-600 font-bold">* (Mandatory for Override)</span>}
              </label>
              {!isTerminalLockedForUser && <span className="text-[11px] text-slate-400">Click a preset below</span>}
            </div>
            
            {!isTerminalLockedForUser && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_DESCRIPTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDescription(preset)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors cursor-pointer"
                  >
                    {preset.slice(0, 30)}...
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={3}
              disabled={isTerminalLockedForUser}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isBackwardsTransition 
                  ? "Mandatory audit justification: explain why this shipment status is being reverted..." 
                  : "e.g. Arrived at sorting facility, customs scan completed..."
              }
              className={clsx(
                "w-full border rounded-md p-2.5 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors",
                isTerminalLockedForUser
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
                  : isBackwardsTransition
                  ? "border-amber-400 bg-amber-50/20 text-slate-900 focus:border-amber-500 focus:ring-amber-500"
                  : "border-slate-300 text-slate-800 bg-white focus:border-blue-500 focus:ring-blue-500"
              )}
              required
            />
          </div>

          {/* Timestamp & Public Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Event Timestamp
              </label>
              <input
                type="datetime-local"
                disabled={isTerminalLockedForUser}
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="isPublicCheckbox"
                type="checkbox"
                disabled={isTerminalLockedForUser}
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="isPublicCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
                Visible on public tracking portal
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isTerminalLockedForUser}
              className={clsx(
                "px-5 py-2 text-sm font-semibold text-white rounded-md shadow-sm transition-colors flex items-center gap-2",
                isTerminalLockedForUser
                  ? "bg-slate-400 cursor-not-allowed opacity-60"
                  : "bg-[#0f1b3b] hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isTerminalLockedForUser ? (
                <>
                  <Lock className="w-4 h-4" />
                  Terminal State Locked
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Log Checkpoint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

