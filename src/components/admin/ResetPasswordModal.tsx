"use client";

import React, { useState } from "react";
import { 
  X, KeyRound, Lock, Eye, EyeOff, 
  Loader2, AlertCircle, CheckCircle2, ShieldCheck 
} from "lucide-react";
import clsx from "clsx";
import { resetUserPassword } from "@/lib/api";
import { StaffUser } from "@/lib/types";

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: StaffUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResetPasswordModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isOpen || !user) return null;

  const isMinLength = newPassword.length >= 8 && newPassword.length <= 128;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string[]> = {};

    if (!newPassword) {
      errors.newPassword = ["Password is required."];
    } else if (!isMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      errors.newPassword = [
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
      ];
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = ["Passwords do not match."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});

      await resetUserPassword(user.id, newPassword);

      setNewPassword("");
      setConfirmPassword("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { message?: string; errors?: Record<string, string[]> };
      if (errObj.errors) {
        setFieldErrors(errObj.errors);
      } else {
        setGlobalError(errObj.message || "Failed to reset password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B132B] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Reset Staff Password</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Issue temporary credentials for {user.firstName} {user.lastName}
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Temporary Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (fieldErrors.newPassword) setFieldErrors(prev => ({ ...prev, newPassword: [] }));
                }}
                placeholder="Enter new secure password"
                className={clsx(
                  "w-full pl-9 pr-10 py-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.newPassword ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.newPassword[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: [] }));
                }}
                placeholder="Re-enter password"
                className={clsx(
                  "w-full pl-9 pr-3 py-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.confirmPassword ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                )}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          {/* Helper checklist */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2.5 rounded-md border border-slate-200 text-[11px] text-slate-600">
            <span className={clsx("flex items-center gap-1", isMinLength ? "text-emerald-600 font-medium" : "text-slate-500")}>
              <CheckCircle2 className="w-3 h-3" /> 8-128 characters
            </span>
            <span className={clsx("flex items-center gap-1", hasUpper ? "text-emerald-600 font-medium" : "text-slate-500")}>
              <CheckCircle2 className="w-3 h-3" /> 1 uppercase (A-Z)
            </span>
            <span className={clsx("flex items-center gap-1", hasLower ? "text-emerald-600 font-medium" : "text-slate-500")}>
              <CheckCircle2 className="w-3 h-3" /> 1 lowercase (a-z)
            </span>
            <span className={clsx("flex items-center gap-1", hasNumber && hasSpecial ? "text-emerald-600 font-medium" : "text-slate-500")}>
              <CheckCircle2 className="w-3 h-3" /> 1 number & symbol
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              This will immediately invalidate the user&apos;s current active refresh tokens and require re-login.
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
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
