"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Building2, Loader2, ShieldAlert } from "lucide-react";
import { Location } from "@/lib/types";
import { updateLocationStatus } from "@/lib/api";

interface DeactivateHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;
}

export function DeactivateHubModal({
  isOpen,
  onClose,
  onSuccess,
  location,
}: DeactivateHubModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !location) return null;

  const isCurrentlyActive = location.isActive !== false;
  const currentShipments = location._count?.currentShipments || 0;
  const isBlocked = isCurrentlyActive && currentShipments > 0;

  const handleToggleStatus = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await updateLocationStatus(location.id, !isCurrentlyActive);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update hub status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0f1b3b] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isBlocked ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : isCurrentlyActive ? (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <h2 className="text-base font-bold">
              {isCurrentlyActive ? "Deactivate Transit Hub" : "Reactivate Transit Hub"}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Hub Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f1b3b] text-white flex items-center justify-center font-bold text-xs">
                <Building2 className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0B132B]">{location.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{location.code} • {location.city}, {location.country}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Workload</span>
              <span className="text-sm font-bold text-slate-800">{currentShipments} active</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {isBlocked ? (
            /* Blocked Alert according to PDF Screen 9 directive */
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Deactivation Prohibited</span>
              </div>
              <p className="leading-relaxed">
                Cannot deactivate this location. There are currently <strong className="font-semibold text-amber-950">{currentShipments} active shipment(s)</strong> stationed at this hub.
              </p>
              <p className="text-amber-800/90 text-[11px] leading-relaxed">
                In accordance with LSBD operational policy, all stationed parcels must be cleared, transferred, or marked as delivered before this hub can be taken offline.
              </p>
            </div>
          ) : isCurrentlyActive ? (
            /* Confirmation to Deactivate */
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Are you sure you want to deactivate <strong className="text-slate-800">{location.name}</strong>?
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once deactivated, this hub will no longer appear as an available selection for new courier requests or route checkpoints.
              </p>
            </div>
          ) : (
            /* Confirmation to Reactivate */
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Are you sure you want to reactivate <strong className="text-slate-800">{location.name}</strong>?
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                This hub will immediately become active and available for intake routing, transit operations, and shipment checkpoints.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              {isBlocked ? "Understood" : "Cancel"}
            </button>

            {!isBlocked && (
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isSubmitting}
                className={`px-4 py-2 text-white text-sm font-semibold rounded-md shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isCurrentlyActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : isCurrentlyActive ? (
                  "Deactivate Hub"
                ) : (
                  "Reactivate Hub"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
