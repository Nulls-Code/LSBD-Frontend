"use client";

import React, { useState } from "react";
import { X, AlertTriangle, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { updateUserStatus } from "@/lib/api";
import { StaffUser } from "@/lib/types";

interface DeactivateStaffModalProps {
  isOpen: boolean;
  user: StaffUser | null;
  onClose: () => void;
  onSuccess: (updatedUser: StaffUser) => void;
}

export function DeactivateStaffModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: DeactivateStaffModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isCurrentlyActive = user.isActive !== false;
  const targetActive = !isCurrentlyActive;

  const handleConfirm = async () => {
    setError(null);
    try {
      setIsSubmitting(true);
      const res = await updateUserStatus(user.id, targetActive);
      const updated: StaffUser = res.data || {
        ...user,
        isActive: targetActive,
      };
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setError(errObj.message || "Failed to update staff account status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full shrink-0 ${
                  isCurrentlyActive
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                {isCurrentlyActive ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isCurrentlyActive
                    ? "Deactivate Staff Account"
                    : "Reactivate Staff Account"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user.firstName} {user.lastName} ({user.email})
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed">
            {isCurrentlyActive ? (
              <>
                Are you sure you want to deactivate{" "}
                <span className="font-semibold text-slate-800">
                  {user.firstName} {user.lastName}
                </span>
                ? This staff member will immediately lose access to internal dashboards,
                shipment management, and checkpoint recording.
              </>
            ) : (
              <>
                Are you sure you want to restore access for{" "}
                <span className="font-semibold text-slate-800">
                  {user.firstName} {user.lastName}
                </span>
                ? They will regain operational authority associated with their{" "}
                <span className="font-semibold text-slate-800">{user.role}</span> role.
              </>
            )}
          </p>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
            Account role: <span className="font-bold text-slate-700">{user.role}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className={`px-5 py-2 text-white text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
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
              "Confirm Deactivation"
            ) : (
              "Reactivate Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
