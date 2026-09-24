"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { cancelCourierRequest } from "@/lib/api";
import { CourierRequest } from "@/lib/types";

interface CancelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CourierRequest | null;
  userRole?: string;
  onSuccess: (result?: any) => void;
}

export function CancelRequestModal({
  isOpen,
  onClose,
  request,
  userRole,
  onSuccess,
}: CancelRequestModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmployee = userRole?.toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMessage(null);
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (!reason.trim()) {
      setErrorMessage("Please provide a reason for cancelling this courier request.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await cancelCourierRequest(request.id, {
        reason: reason.trim(),
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || "Failed to cancel request.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while cancelling.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cancel Courier Request</h2>
              <p className="text-xs text-slate-400 font-mono">ID: {request.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* RBAC Warning */}
          {isEmployee && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">Permission Restricted:</span> Only Managers and Admins can cancel courier requests (PDF Section 2.2).
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel request <strong className="text-slate-900">#{request.id.slice(0, 8).toUpperCase()}</strong> from <span className="font-medium text-slate-900">{request.senderName}</span>? This status transition will be permanent.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isEmployee || loading}
              placeholder="e.g., Customer requested cancellation prior to cargo pickup."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder-slate-400 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || isEmployee}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
