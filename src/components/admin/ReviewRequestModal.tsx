"use client";

import React, { useState, useEffect } from "react";
import { 
  X, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight, ShieldAlert, Sparkles 
} from "lucide-react";
import clsx from "clsx";
import { reviewCourierRequest } from "@/lib/api";
import { CourierRequest } from "@/lib/types";

interface ReviewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CourierRequest | null;
  userRole?: string;
  onSuccess: (result?: any) => void;
}

export function ReviewRequestModal({
  isOpen,
  onClose,
  request,
  userRole,
  onSuccess,
}: ReviewRequestModalProps) {
  const [action, setAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check RBAC permissions (PDF Section 2.2)
  const isEmployee = userRole?.toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    if (isOpen) {
      setAction("APPROVE");
      setReviewNotes("All documents verified. Ready for cargo intake.");
      setErrorMessage(null);
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmployee) return;

    if (action === "REJECT" && !reviewNotes.trim()) {
      setErrorMessage("Review notes are required when rejecting a courier request.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await reviewCourierRequest(request.id, {
        action,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMessage(res.message || "Failed to submit review decision.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while reviewing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-[#0B132B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              REQ
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Review Courier Request</h2>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* RBAC Employee Restriction Banner */}
          {isEmployee && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold">Role Permission Restricted:</span> As an Employee, you cannot approve or reject courier requests (PDF Section 2.2). Only a Manager or Admin can authorize decisions.
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Request Overview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="font-semibold text-slate-800">Route & Transit</span>
              <span className="font-mono text-slate-500">{request.originLocation?.code} → {request.destinationLocation?.code}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Sender</p>
                <p className="font-medium text-slate-800 truncate">{request.senderName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Recipient</p>
                <p className="font-medium text-slate-800 truncate">{request.recipientName}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Package</p>
              <p className="font-medium text-slate-800">
                {request.packageDescription} · {request.packageWeight} {request.weightUnit} ({request.packageCount} pkg)
              </p>
            </div>
          </div>

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Review Action Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAction("APPROVE")}
                disabled={isEmployee}
                className={clsx(
                  "p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all",
                  action === "APPROVE"
                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-900"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 opacity-80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </span>
                  {action === "APPROVE" && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Authorizes request and atomically creates physical shipment.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAction("REJECT");
                  if (reviewNotes === "All documents verified. Ready for cargo intake.") {
                    setReviewNotes("");
                  }
                }}
                disabled={isEmployee}
                className={clsx(
                  "p-3 rounded-lg border text-left flex flex-col gap-1.5 transition-all",
                  action === "REJECT"
                    ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 text-rose-900"
                    : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 opacity-80"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-rose-700">
                    <XCircle className="w-4 h-4" />
                    Reject
                  </span>
                  {action === "REJECT" && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Declines request with recorded justification. No shipment created.
                </p>
              </button>
            </div>
          </div>

          {/* Workflow Notice */}
          {action === "APPROVE" ? (
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[12px] text-blue-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-blue-950">Atomic Action:</span> Approving will generate an official tracking number formatted as <span className="font-mono font-semibold">LSBD-YYYYMM-XXXXX</span> and set initial checkpoint to <span className="font-semibold">"Shipment registered and pending initial dispatch"</span>.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[12px] text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-amber-950">Rejection Notice:</span> This request status will transition to <span className="font-bold">REJECTED</span>. The review notes below will be permanently logged.
              </div>
            </div>
          )}

          {/* Review Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Review Notes / Directives {action === "REJECT" && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              disabled={isEmployee || loading}
              placeholder={action === "APPROVE" ? "Optional operational notes or verification memo..." : "State the reason for rejecting this courier request..."}
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isEmployee}
              className={clsx(
                "px-5 py-2 text-xs font-semibold text-white rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50",
                action === "APPROVE" 
                  ? "bg-emerald-600 hover:bg-emerald-700" 
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {action === "APPROVE" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
