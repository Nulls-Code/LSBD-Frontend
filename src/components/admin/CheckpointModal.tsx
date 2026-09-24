"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Check, AlertTriangle, Clock, MapPin, 
  Loader2, CheckCircle2, Building2, Truck, Compass, PauseCircle, Package
} from "lucide-react";
import clsx from "clsx";
import { Shipment, Location, ShipmentStatus } from "@/lib/types";
import { logShipmentCheckpoint } from "@/lib/api";

interface CheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  locations: Location[];
  shipment?: Shipment | null;
  allShipments?: Shipment[];
}

const STATUS_OPTIONS: { value: ShipmentStatus; label: string; icon: React.ElementType }[] = [
  { value: "PROCESSING", label: "Processing", icon: Package },
  { value: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { value: "ARRIVED_AT_HUB", label: "Arrived at Hub", icon: Building2 },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Compass },
  { value: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
  { value: "ON_HOLD", label: "On Hold", icon: PauseCircle },
  { value: "FAILED_DELIVERY", label: "Failed Delivery", icon: AlertTriangle },
];

const STATUS_HIERARCHY: Record<string, number> = {
  PROCESSING: 1,
  IN_TRANSIT: 2,
  ARRIVED_AT_HUB: 3,
  OUT_FOR_DELIVERY: 4,
  DELIVERED: 5,
  ON_HOLD: 99,
  FAILED_DELIVERY: 99,
  RETURNED: 99,
};

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
}: CheckpointModalProps) {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [status, setStatus] = useState<ShipmentStatus>("ARRIVED_AT_HUB");
  const [description, setDescription] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        else setStatus("ARRIVED_AT_HUB");
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
  const isBackwardsTransition = 
    currentHierarchy > 0 && 
    targetHierarchy > 0 && 
    targetHierarchy < currentHierarchy &&
    currentHierarchy !== 99 &&
    targetHierarchy !== 99;

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
          <div>
            <h2 className="text-lg font-bold">Log Checkpoint Update</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Record a physical parcel event into the audit trail.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
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
              <div>
                <span className="text-slate-500">Current Status: </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentActiveShipment.currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          )}

          {/* Backwards Warning Alert */}
          {isBackwardsTransition && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Supervisor Override Notice</div>
                <div>Backwards status transition detected. You must provide an explicit justification in the description.</div>
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
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              required
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          {/* New Status Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              New Shipment Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    className={clsx(
                      "flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all text-left",
                      isSelected
                        ? "border-[#0B132B] bg-[#0B132B] text-white shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                    )}
                  >
                    <Icon className={clsx("w-3.5 h-3.5 shrink-0", isSelected ? "text-emerald-400" : "text-slate-400")} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Event Description & Audit Notes
              </label>
              <span className="text-[11px] text-slate-400">Click a preset below</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_DESCRIPTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDescription(preset)}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                >
                  {preset.slice(0, 30)}...
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Arrived at sorting facility, customs scan completed..."
              className="w-full border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <input
                id="isPublicCheckbox"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0f1b3b] hover:bg-slate-800 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
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
