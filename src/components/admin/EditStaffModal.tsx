"use client";

import React, { useState } from "react";
import { 
  X, UserCog, ShieldAlert, 
  Loader2, AlertCircle, ShieldCheck 
} from "lucide-react";
import clsx from "clsx";
import { updateUser } from "@/lib/api";
import { StaffUser } from "@/lib/types";

interface EditStaffModalProps {
  isOpen: boolean;
  user: StaffUser | null;
  isSelf: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: StaffUser) => void;
}

export function EditStaffModal({ isOpen, user, isSelf, onClose, onSuccess }: EditStaffModalProps) {
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [role, setRole] = useState<string>(user?.role || "EMPLOYEE");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string[]> = {};

    if (!firstName.trim()) {
      errors.firstName = ["First name is required."];
    }
    if (!lastName.trim()) {
      errors.lastName = ["Last name is required."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});

      const updatedPayload: { firstName: string; lastName: string; role?: string } = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      };

      // Only include role if not self-editing (PDF section 2.2 / 7.7.3)
      if (!isSelf) {
        updatedPayload.role = role;
      }

      const res = await updateUser(user.id, updatedPayload);

      const returnedUser: StaffUser = res.data || {
        ...user,
        firstName: updatedPayload.firstName,
        lastName: updatedPayload.lastName,
        role: updatedPayload.role || user.role,
      };

      onSuccess(returnedUser);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { message?: string; errors?: Record<string, string[]> };
      if (errObj.errors) {
        setFieldErrors(errObj.errors);
      } else {
        setGlobalError(errObj.message || "Failed to update staff member.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B132B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Staff Member</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {user.email} {isSelf && "(Your Account)"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {globalError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{globalError}</span>
            </div>
          )}

          {isSelf && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Self-Action Guard:</strong> System administrators cannot alter their own operational role or demote authority.
              </span>
            </div>
          )}

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: [] }));
                }}
                className={clsx(
                  "w-full p-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.firstName ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                )}
              />
              {fieldErrors.firstName && (
                <p className="text-rose-500 text-xs mt-1">{fieldErrors.firstName[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: [] }));
                }}
                className={clsx(
                  "w-full p-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.lastName ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                )}
              />
              {fieldErrors.lastName && (
                <p className="text-rose-500 text-xs mt-1">{fieldErrors.lastName[0]}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSelf}
                onClick={() => setRole("EMPLOYEE")}
                className={clsx(
                  "p-3 rounded-lg border text-left transition-all",
                  role === "EMPLOYEE"
                    ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                    : "border-slate-200 bg-white",
                  isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">EMPLOYEE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Intake & checkpoints logging
                </p>
              </button>

              <button
                type="button"
                disabled={isSelf}
                onClick={() => setRole("MANAGER")}
                className={clsx(
                  "p-3 rounded-lg border text-left transition-all",
                  role === "MANAGER"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                    : "border-slate-200 bg-white",
                  isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">MANAGER</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Review, approvals & overrides
                </p>
              </button>

              <button
                type="button"
                disabled={isSelf}
                onClick={() => setRole("ADMIN")}
                className={clsx(
                  "p-3 rounded-lg border text-left transition-all",
                  role === "ADMIN"
                    ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-600"
                    : "border-slate-200 bg-white",
                  isSelf ? "opacity-90 ring-1 ring-purple-600" : "cursor-pointer hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">ADMIN</span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Full system & user control
                </p>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Role changes take effect immediately across all active sessions and affect operational authorization.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0B132B] hover:bg-[#1E293B] text-white text-sm font-semibold rounded-md shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
