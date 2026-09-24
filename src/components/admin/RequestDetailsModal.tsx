"use client";

import React, { useState } from "react";
import { 
  X, Copy, Check, Clock, MapPin, Building2, Package, CheckCircle2, 
  XCircle, Slash, ArrowRight, User, ExternalLink, ShieldCheck 
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { CourierRequest } from "@/lib/types";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CourierRequest | null;
  onOpenReview?: (request: CourierRequest) => void;
  onOpenCancel?: (request: CourierRequest) => void;
  userRole?: string;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-300 text-emerald-700 bg-[#D1FAE5]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-amber-300 text-amber-700 bg-[#FEF3C7]">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Awaiting Review
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-rose-300 text-rose-700 bg-[#FEE2E2]">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 bg-[#F1F5F9]">
          <Slash className="w-3.5 h-3.5 text-slate-600" />
          Cancelled
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

export function RequestDetailsModal({
  isOpen,
  onClose,
  request,
  onOpenReview,
  onOpenCancel,
  userRole,
}: RequestDetailsModalProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen || !request) return null;

  const isEmployee = userRole?.toUpperCase() === "EMPLOYEE";

  const handleCopyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not recorded";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#0B132B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Courier Request Overview</h2>
                <button
                  onClick={() => handleCopyId(request.id)}
                  title="Copy full Request UUID"
                  className="flex items-center gap-1 text-[11px] font-mono bg-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded transition-colors"
                >
                  <span>{request.id.slice(0, 8).toUpperCase()}</span>
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">Created {formatDate(request.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Active Shipment Banner (Visual Indication per PDF Section 4.5) */}
          {request.shipment ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Active Shipment Generated
                    </span>
                    <span className="text-[11px] bg-emerald-200/60 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      {request.shipment.currentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-mono font-bold text-emerald-950">
                      {request.shipment.trackingNumber}
                    </span>
                    <button
                      onClick={() => handleCopyTracking(request.shipment!.trackingNumber)}
                      className="text-emerald-700 hover:text-emerald-900 transition-colors"
                      title="Copy tracking number"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/shipments?search=${encodeURIComponent(request.shipment.trackingNumber)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0"
              >
                <span>View Shipment</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : request.status === "PENDING" ? (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This request is awaiting review. No active shipment exists yet.</span>
              </div>
              {!isEmployee && onOpenReview && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReview(request);
                  }}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors shrink-0"
                >
                  Review Now
                </button>
              )}
            </div>
          ) : null}

          {/* Route Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Transit Route</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Origin Transit Hub</span>
                <p className="text-sm font-bold text-slate-800">{request.originLocation?.city || "Unknown"}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{request.originLocation?.code} · {request.originLocation?.country}</p>
              </div>

              <div className="flex flex-col items-center px-2">
                <span className="text-[10px] text-slate-400 font-medium mb-1">Direct Flight/Transit</span>
                <div className="w-12 h-0.5 bg-slate-300 relative">
                  <ArrowRight className="w-4 h-4 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 translate-x-2" />
                </div>
              </div>

              <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination Hub</span>
                <p className="text-sm font-bold text-slate-800">{request.destinationLocation?.city || "Unknown"}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{request.destinationLocation?.code} · {request.destinationLocation?.country}</p>
              </div>
            </div>
          </div>

          {/* Sender & Recipient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sender */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Sender Information
              </h4>
              <div>
                <p className="text-xs font-bold text-slate-800">{request.senderName}</p>
                {request.senderCompany && (
                  <p className="text-[11px] text-slate-500 font-medium">{request.senderCompany}</p>
                )}
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <p><span className="text-slate-400">Phone:</span> {request.senderPhone}</p>
                <p><span className="text-slate-400">Email:</span> {request.senderEmail}</p>
                {request.senderAddress && (
                  <p><span className="text-slate-400">Address:</span> {request.senderAddress}</p>
                )}
              </div>
            </div>

            {/* Recipient */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Recipient Information
              </h4>
              <div>
                <p className="text-xs font-bold text-slate-800">{request.recipientName}</p>
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <p><span className="text-slate-400">Phone:</span> {request.recipientPhone || "Not provided"}</p>
                <p><span className="text-slate-400">Email:</span> {request.recipientEmail || "Not provided"}</p>
                {request.recipientAddress && (
                  <p><span className="text-slate-400">Address:</span> {request.recipientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Package Specifications
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Declared Description</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.packageDescription}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Gross Weight</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.packageWeight} {request.weightUnit}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Package Count</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{request.packageCount} item(s)</span>
              </div>
            </div>
            {request.requestNotes && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">Customer Handling Instructions:</span>
                <p className="text-slate-700 bg-slate-50 p-2 rounded mt-1 italic border border-slate-100">
                  "{request.requestNotes}"
                </p>
              </div>
            )}
          </div>

          {/* Review Audit Trail Section (if reviewed) */}
          {(request.reviewedBy || request.reviewNotes || request.reviewedAt) && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Review Decision Record
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-slate-400">Reviewed By:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {request.reviewedBy ? `${request.reviewedBy.firstName} ${request.reviewedBy.lastName} (${request.reviewedBy.role})` : "Authorized Staff"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Reviewed On:</span>{" "}
                  <span className="font-semibold text-slate-800">{formatDate(request.reviewedAt)}</span>
                </div>
              </div>
              {request.reviewNotes && (
                <div className="text-xs">
                  <span className="text-slate-400">Review Notes:</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200 mt-1">
                    {request.reviewNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            Current Status: <strong className="text-slate-800">{request.status}</strong>
          </div>
          <div className="flex items-center gap-3">
            {request.status === "PENDING" && !isEmployee && (
              <>
                {onOpenCancel && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCancel(request);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-rose-200 transition-colors"
                  >
                    Cancel Request
                  </button>
                )}
                {onOpenReview && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReview(request);
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
                  >
                    Review Decision
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
