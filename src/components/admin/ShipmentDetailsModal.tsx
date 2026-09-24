"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Copy, Check, Clock, MapPin, 
  Building2, Truck, Compass, PauseCircle, CheckCircle2, AlertTriangle, 
  Plus, Package, Calendar, User, Pencil, Save, RotateCcw, Printer, Loader2, Lock, ShieldAlert
} from "lucide-react";
import clsx from "clsx";
import { Shipment, ShipmentStatus, StaffUser } from "@/lib/types";
import { updateShipment, fetchStaffUsers, fetchUserProfile } from "@/lib/api";

interface ShipmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onLogCheckpoint: (shipment: Shipment) => void;
  userRole?: string;
  staffUsers?: StaffUser[];
  onUpdateSuccess?: (updatedShipment: Shipment) => void;
}

export function StatusBadge({ status }: { status: ShipmentStatus | string }) {
  switch (status) {
    case "ARRIVED_AT_HUB":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-purple-300 text-purple-700 bg-purple-50">
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          Arrived at Hub
        </span>
      );
    case "IN_TRANSIT":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-sky-300 text-sky-700 bg-sky-50">
          <Truck className="w-3.5 h-3.5 text-sky-600" />
          In Transit
        </span>
      );
    case "OUT_FOR_DELIVERY":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-orange-300 text-orange-700 bg-orange-50">
          <Compass className="w-3.5 h-3.5 text-orange-600" />
          Out for Delivery
        </span>
      );
    case "ON_HOLD":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 text-amber-700 bg-amber-50">
          <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
          On Hold
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-green-300 text-green-700 bg-green-50">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          Delivered
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-blue-300 text-blue-700 bg-blue-50">
          <Package className="w-3.5 h-3.5 text-blue-600" />
          Processing
        </span>
      );
    case "FAILED_DELIVERY":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 bg-rose-50">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Failed Delivery
        </span>
      );
    case "RETURNED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 text-gray-700 bg-gray-50">
          <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
          Returned
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

export function ShipmentDetailsModal({
  isOpen,
  onClose,
  shipment,
  onLogCheckpoint,
  userRole: propUserRole,
  staffUsers: propStaffUsers,
  onUpdateSuccess,
}: ShipmentDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(shipment);

  // RBAC Role Resolution
  const [resolvedRole, setResolvedRole] = useState<string>(propUserRole || "");
  const [availableStaff, setAvailableStaff] = useState<StaffUser[]>(propStaffUsers || []);

  // Operational Editing Drawer State
  const [isEditing, setIsEditing] = useState(false);
  const [editAssignedToId, setEditAssignedToId] = useState("");
  const [editEstDeliveryDate, setEditEstDeliveryDate] = useState("");
  const [editInternalNotes, setEditInternalNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Sync state whenever shipment prop changes or modal opens
  useEffect(() => {
    if (shipment) {
      setCurrentShipment(shipment);
      setEditAssignedToId(shipment.assignedTo?.id || shipment.assignedToId || "");
      setEditEstDeliveryDate(
        shipment.estimatedDeliveryDate
          ? new Date(shipment.estimatedDeliveryDate).toISOString().slice(0, 16)
          : ""
      );
      setEditInternalNotes(shipment.internalNotes || "");
      setIsEditing(false);
      setSaveError(null);
      setSaveSuccess(null);
    }
  }, [shipment, isOpen]);

  // Update resolved role from prop or fetch profile
  useEffect(() => {
    if (propUserRole) {
      setResolvedRole(propUserRole);
    } else if (isOpen && !resolvedRole) {
      fetchUserProfile()
        .then((res) => {
          if (res.success && res.data?.role) {
            setResolvedRole(res.data.role);
          }
        })
        .catch(() => {});
    }
  }, [propUserRole, isOpen, resolvedRole]);

  // Check if role is authorized for operational updates (Section 2.2: ADMIN, MANAGER only)
  const canEditOperational = 
    resolvedRole.toUpperCase() === "ADMIN" || 
    resolvedRole.toUpperCase() === "MANAGER";

  // Fetch staff users if list is empty and user has manager/admin permissions
  useEffect(() => {
    if (propStaffUsers && propStaffUsers.length > 0) {
      setAvailableStaff(propStaffUsers);
    } else if (isOpen && canEditOperational && availableStaff.length === 0) {
      fetchStaffUsers(1, 100)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setAvailableStaff(res.data);
          }
        })
        .catch(() => {});
    }
  }, [propStaffUsers, isOpen, canEditOperational, availableStaff.length]);

  if (!isOpen || !currentShipment) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Not specified";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  const handleStartEdit = () => {
    setEditAssignedToId(currentShipment.assignedTo?.id || currentShipment.assignedToId || "");
    setEditEstDeliveryDate(
      currentShipment.estimatedDeliveryDate
        ? new Date(currentShipment.estimatedDeliveryDate).toISOString().slice(0, 16)
        : ""
    );
    setEditInternalNotes(currentShipment.internalNotes || "");
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSaveOperationalDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditOperational) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const payload = {
        assignedToId: editAssignedToId ? editAssignedToId : null,
        estimatedDeliveryDate: editEstDeliveryDate ? new Date(editEstDeliveryDate).toISOString() : null,
        internalNotes: editInternalNotes.trim() || null,
      };

      const res = await updateShipment(currentShipment.id, payload);

      if (res.success && res.data) {
        setCurrentShipment(res.data);
        setSaveSuccess("Shipment operational details updated successfully.");
        setIsEditing(false);
        onUpdateSuccess?.(res.data);
        setTimeout(() => setSaveSuccess(null), 3500);
      } else {
        // Fallback update local state if server returned success without full payload
        const updatedAssigned = availableStaff.find(s => s.id === editAssignedToId) || null;
        const updatedLocalShipment: Shipment = {
          ...currentShipment,
          assignedToId: payload.assignedToId,
          assignedTo: updatedAssigned,
          estimatedDeliveryDate: payload.estimatedDeliveryDate,
          internalNotes: payload.internalNotes || undefined,
        };
        setCurrentShipment(updatedLocalShipment);
        setSaveSuccess("Shipment operational details updated successfully.");
        setIsEditing(false);
        onUpdateSuccess?.(updatedLocalShipment);
        setTimeout(() => setSaveSuccess(null), 3500);
      }
    } catch (err: any) {
      console.error("Failed to update operational details:", err);
      setSaveError(err.message || "Failed to update operational details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Header - Screen 7 Standard */}
        <div className="bg-[#0f1b3b] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:bg-transparent print:text-black print:border-b">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold tracking-tight text-white print:text-black">
                  {currentShipment.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentShipment.trackingNumber)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white print:hidden"
                  title="Copy tracking number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 print:text-slate-600">
                Created {formatDate(currentShipment.createdAt)}
              </p>
            </div>
            <StatusBadge status={currentShipment.currentStatus} />
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {/* Print Waybill Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              title="Print Shipment Summary / Waybill"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Waybill
            </button>

            {/* Log Checkpoint Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogCheckpoint(currentShipment);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Checkpoint
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Notification Banners */}
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{saveError}</span>
            </div>
          )}

          {/* Top Info Cards: Sender & Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sender Information
              </span>
              <h4 className="font-bold text-slate-900 text-base">{currentShipment.senderName}</h4>
              {currentShipment.senderPhone && (
                <p className="text-xs text-slate-600 mt-1">Phone: {currentShipment.senderPhone}</p>
              )}
              {currentShipment.senderAddress && (
                <p className="text-xs text-slate-500 mt-1">{currentShipment.senderAddress}</p>
              )}
            </div>

            {/* Recipient */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recipient Information
              </span>
              <h4 className="font-bold text-slate-900 text-base">{currentShipment.recipientName}</h4>
              {currentShipment.recipientPhone && (
                <p className="text-xs text-slate-600 mt-1">Phone: {currentShipment.recipientPhone}</p>
              )}
              {currentShipment.recipientAddress && (
                <p className="text-xs text-slate-500 mt-1">{currentShipment.recipientAddress}</p>
              )}
            </div>
          </div>

          {/* Operational Controls & Drawer - Section 2.2 & Screen 7 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#0f1b3b]" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Details &amp; Assignment
                </span>
              </div>

              {/* RBAC Directive: Only show edit pencil/button to MANAGER and ADMIN */}
              {canEditOperational ? (
                !isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3 h-3 text-blue-600" />
                    Edit Operational Details
                  </button>
                ) : (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Editing Mode (Manager/Admin)
                  </span>
                )
              ) : (
                <div 
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 cursor-help"
                  title="Only Managers and Admins can edit assigned staff or operational metadata"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Read Only ({resolvedRole || "Employee"})</span>
                </div>
              )}
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-blue-900 uppercase">Route</div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {currentShipment.originLocation?.city || "Origin"} → {currentShipment.destinationLocation?.city || "Destination"}
                    </div>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-purple-900 uppercase">Current Station</div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {currentShipment.currentLocation?.city || currentShipment.currentLocation?.name || currentShipment.originLocation?.city || "Transit Hub"}
                    </div>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-amber-900 uppercase flex items-center justify-between">
                      <span>Est. Delivery</span>
                      {canEditOperational && (
                        <button 
                          onClick={handleStartEdit} 
                          className="text-amber-700 hover:text-amber-900 text-[10px] font-normal underline cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {formatDate(currentShipment.estimatedDeliveryDate)}
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-emerald-900 uppercase flex items-center justify-between">
                      <span>Assigned Staff</span>
                      {canEditOperational && (
                        <button 
                          onClick={handleStartEdit} 
                          className="text-emerald-700 hover:text-emerald-900 text-[10px] font-normal underline cursor-pointer"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {currentShipment.assignedTo 
                          ? `${currentShipment.assignedTo.firstName} ${currentShipment.assignedTo.lastName}` 
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internal Operational Notes */}
                <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-950 uppercase text-[10px] tracking-wider">
                      Internal Handling Notes &amp; Dispatch Instructions
                    </span>
                    {canEditOperational && (
                      <button 
                        onClick={handleStartEdit} 
                        className="text-amber-700 hover:text-amber-900 font-semibold text-[11px] underline cursor-pointer"
                      >
                        Edit Notes
                      </button>
                    )}
                  </div>
                  {currentShipment.internalNotes ? (
                    <p className="text-amber-900 whitespace-pre-line leading-relaxed font-sans">
                      {currentShipment.internalNotes}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">
                      No internal operational notes logged for this shipment.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Operational Drawer Edit Form (MANAGER & ADMIN only) */
              <form onSubmit={handleSaveOperationalDetails} className="p-4 bg-blue-50/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assigned Driver/Staff Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Assigned Driver / Staff
                    </label>
                    <select
                      value={editAssignedToId}
                      onChange={(e) => setEditAssignedToId(e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
                    >
                      <option value="">Unassigned (No staff assigned)</option>
                      {availableStaff.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName} • {staff.role} ({staff.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Designate an active courier driver or sorting hub officer.
                    </p>
                  </div>

                  {/* Estimated Delivery Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                      Estimated Delivery Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editEstDeliveryDate}
                      onChange={(e) => setEditEstDeliveryDate(e.target.value)}
                      disabled={isSaving}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Promised delivery target shown to customers on public tracking.
                    </p>
                  </div>
                </div>

                {/* Internal Notes Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Internal Operational Instructions &amp; Handling Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editInternalNotes}
                    onChange={(e) => setEditInternalNotes(e.target.value)}
                    disabled={isSaving}
                    placeholder="Enter internal handling instructions (e.g. Fragile contents, priority customs clearance, commercial samples)..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Internal only — permanently sanitized and never visible to public visitors.
                  </p>
                </div>

                {/* Edit Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Operational Details
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Audit Timeline */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Checkpoint Audit Timeline
            </h4>

            {currentShipment.trackingUpdates && currentShipment.trackingUpdates.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 ml-3.5 space-y-6 py-2">
                {currentShipment.trackingUpdates.map((update, idx) => (
                  <div key={update.id || idx} className="relative pl-6">
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={update.status} />
                        <span className="text-xs font-medium text-slate-500">
                          {formatDate(update.timestamp || update.createdAt)}
                        </span>
                      </div>
                      {update.createdBy && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          Logged by: {update.createdBy.firstName} {update.createdBy.lastName} ({update.createdBy.role})
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-700 font-medium mt-1.5">
                      {update.description}
                    </p>

                    {update.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {update.location.name} ({update.location.code}) - {update.location.city}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400 text-xs">
                No checkpoints have been logged for this shipment yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
