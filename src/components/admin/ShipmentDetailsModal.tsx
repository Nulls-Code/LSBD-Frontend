"use client";

import React, { useState } from "react";
import { 
  X, Copy, Check, Clock, MapPin, 
  Building2, Truck, Compass, PauseCircle, CheckCircle2, AlertTriangle, Plus, Package, Calendar, User
} from "lucide-react";
import clsx from "clsx";
import { Shipment, ShipmentStatus } from "@/lib/types";

interface ShipmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onLogCheckpoint: (shipment: Shipment) => void;
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
}: ShipmentDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !shipment) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not specified";
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0f1b3b] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold tracking-tight text-white">
                  {shipment.trackingNumber}
                </span>
                <button
                  onClick={() => handleCopy(shipment.trackingNumber)}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-slate-300 hover:text-white"
                  title="Copy tracking number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Created {formatDate(shipment.createdAt)}
              </p>
            </div>
            <StatusBadge status={shipment.currentStatus} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onLogCheckpoint(shipment);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Checkpoint
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sender Information
              </span>
              <h4 className="font-bold text-slate-900 text-base">{shipment.senderName}</h4>
              {shipment.senderPhone && (
                <p className="text-xs text-slate-600 mt-1">Phone: {shipment.senderPhone}</p>
              )}
              {shipment.senderAddress && (
                <p className="text-xs text-slate-500 mt-1">{shipment.senderAddress}</p>
              )}
            </div>

            {/* Recipient */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recipient Information
              </span>
              <h4 className="font-bold text-slate-900 text-base">{shipment.recipientName}</h4>
              {shipment.recipientPhone && (
                <p className="text-xs text-slate-600 mt-1">Phone: {shipment.recipientPhone}</p>
              )}
              {shipment.recipientAddress && (
                <p className="text-xs text-slate-500 mt-1">{shipment.recipientAddress}</p>
              )}
            </div>
          </div>

          {/* Operational Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
              <div className="text-[10px] font-bold text-blue-900 uppercase">Route</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {shipment.originLocation?.city || "Origin"} → {shipment.destinationLocation?.city || "Destination"}
              </div>
            </div>
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3">
              <div className="text-[10px] font-bold text-purple-900 uppercase">Current Station</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {shipment.currentLocation?.city || shipment.currentLocation?.name || shipment.originLocation?.city || "Transit Hub"}
              </div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-3">
              <div className="text-[10px] font-bold text-amber-900 uppercase">Est. Delivery</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {formatDate(shipment.estimatedDeliveryDate)}
              </div>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
              <div className="text-[10px] font-bold text-emerald-900 uppercase">Assigned Staff</div>
              <div className="text-xs font-semibold text-slate-800 mt-1">
                {shipment.assignedTo ? `${shipment.assignedTo.firstName} ${shipment.assignedTo.lastName}` : "Unassigned"}
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {shipment.internalNotes && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900">
              <span className="font-bold block mb-1">Operational Instructions & Notes:</span>
              <p>{shipment.internalNotes}</p>
            </div>
          )}

          {/* Audit Timeline */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Checkpoint Audit Timeline
            </h4>

            {shipment.trackingUpdates && shipment.trackingUpdates.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 ml-3.5 space-y-6 py-2">
                {shipment.trackingUpdates.map((update, idx) => (
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
                        <span className="text-[11px] text-slate-400">
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
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium rounded-md hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
