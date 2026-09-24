"use client";

import React, { useState, useEffect } from "react";
import {
  X, Building2, User, Phone, Mail, Calendar,
  Package, Truck, Clock, CheckCircle2, AlertCircle,
  Loader2, Edit3, ArrowRight, ShieldCheck, ShieldAlert
} from "lucide-react";
import clsx from "clsx";
import { CustomerDetail, CustomerListItem, CustomerRequestHistoryItem } from "@/lib/types";
import { fetchCustomerById, updateCustomer } from "@/lib/api";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  userRole?: string;
  onCustomerUpdated?: () => void;
}

function RequestStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#047857] border border-emerald-300">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309] border border-amber-300">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#B91C1C] border border-rose-300">
          <AlertCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] border border-slate-300">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          {status}
        </span>
      );
  }
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customerId,
  userRole = "ADMIN",
  onCustomerUpdated,
}: CustomerDetailsModalProps) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"history" | "edit">("history");

  // Form state
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";

  useEffect(() => {
    if (!isOpen || !customerId) {
      setCustomer(null);
      setError(null);
      setFormSuccess(null);
      setFormError(null);
      setActiveTab("history");
      return;
    }

    const loadCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchCustomerById(customerId);
        if (res.success && res.data) {
          setCustomer(res.data);
          setEditName(res.data.name || "");
          setEditCompany(res.data.company || "");
          setEditPhone(res.data.phone || "");
          setEditEmail(res.data.email || "");
        } else {
          setError(res.message || "Failed to load customer profile");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to backend server");
      } finally {
        setLoading(false);
      }
    };

    loadCustomer();
  }, [isOpen, customerId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !canEdit) return;

    try {
      setSubmitting(true);
      setFormError(null);
      setFormSuccess(null);

      const res = await updateCustomer(customer.id, {
        name: editName.trim() || undefined,
        company: editCompany.trim() || null,
        phone: editPhone.trim() || undefined,
        email: editEmail.trim() || undefined,
      });

      if (res.success) {
        setFormSuccess("Customer details updated successfully");
        if (onCustomerUpdated) {
          onCustomerUpdated();
        }
        // Refresh local customer state
        setCustomer((prev) =>
          prev
            ? {
                ...prev,
                name: editName.trim(),
                company: editCompany.trim() || null,
                phone: editPhone.trim(),
                email: editEmail.trim() || null,
              }
            : null
        );
      } else {
        setFormError(res.message || "Failed to update customer");
      }
    } catch (err: any) {
      setFormError(err.message || "Error updating customer");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
        {/* Modal Top Header */}
        <div className="bg-[#0B132B] px-6 py-5 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {customer?.company || customer?.name || "Customer Details"}
                {canEdit ? (
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Read / Edit Access
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                    Read-Only
                  </span>
                )}
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {customer?.company ? `Contact: ${customer.name}` : "Customer Profile & Shipment Relationships"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Customer Info Cards Strip */}
        {customer && !loading && (
          <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Contact</span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{customer.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Phone</span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{customer.phone}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Email</span>
              <span className="text-xs font-bold text-slate-800 truncate block mt-0.5" title={customer.email || "—"}>
                {customer.email || "—"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Shipments</span>
              <span className="text-xs font-extrabold text-[#0B132B] block mt-0.5">
                {customer.courierRequests?.length ?? customer._count?.courierRequests ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
          <button
            onClick={() => setActiveTab("history")}
            className={clsx(
              "py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors",
              activeTab === "history"
                ? "border-[#0B132B] text-[#0B132B]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Package className="w-4 h-4" />
            Shipment History ({customer?.courierRequests?.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={clsx(
              "py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors",
              activeTab === "edit"
                ? "border-[#0B132B] text-[#0B132B]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Edit3 className="w-4 h-4" />
            {canEdit ? "Edit Profile" : "Profile Details"}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0B132B]" />
              <p className="text-xs font-semibold text-slate-500">Loading customer profile & history...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : activeTab === "history" ? (
            <div>
              {customer?.courierRequests && customer.courierRequests.length > 0 ? (
                <div className="space-y-3">
                  {customer.courierRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <RequestStatusBadge status={req.status} />
                          {req.shipment?.trackingNumber && (
                            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                              {req.shipment.trackingNumber}
                            </span>
                          )}
                          <span className="text-slate-400 text-xs flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {req.packageCount} {req.packageCount > 1 ? "packages" : "package"} • {req.packageWeight}{" "}
                          {req.weightUnit || "KG"}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 mb-2">
                        {req.packageDescription}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-800">
                          {req.originLocation?.name || req.originLocation?.code || "Origin Hub"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {req.destinationLocation?.name || req.destinationLocation?.code || "Destination Hub"}
                        </span>
                        {req.shipment?.currentStatus && (
                          <span className="ml-auto text-[11px] font-medium text-slate-500">
                            Current Status: <span className="font-bold text-slate-700">{req.shipment.currentStatus}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">No courier requests yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    This customer has not placed any courier requests or physical shipments yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}
              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {!canEdit && (
                <div className="mb-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>Only Staff with ADMIN or MANAGER privileges can modify customer records.</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    disabled={!canEdit || submitting}
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    placeholder="e.g. Rahman Textiles Ltd."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canEdit || submitting}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Fahim Rahman"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!canEdit || submitting}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +880 17 0000 0000"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled={!canEdit || submitting}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="e.g. logistics@customer.demo"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 text-xs font-bold text-white bg-[#0B132B] hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Profile Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
