"use client";

import React, { useState, useEffect } from "react";
import { 
  X, KeyRound, Lock, Eye, EyeOff, 
  Loader2, AlertCircle, CheckCircle2, ShieldAlert, Clock
} from "lucide-react";
import clsx from "clsx";
import { changePassword } from "@/lib/api";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [lockoutMinutes, setLockoutMinutes] = useState<number | null>(null);

  // Countdown timer for HTTP 429 Lockout (PDF Spec Section 8.2)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutMinutes !== null && lockoutMinutes > 0) {
      interval = setInterval(() => {
        setLockoutMinutes((prev) => (prev && prev > 1 ? prev - 1 : null));
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [lockoutMinutes]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setGlobalError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation rules (PDF Spec Section 5.2)
  const isMinLength = newPassword.length >= 8 && newPassword.length <= 128;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isValidPassword = isMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutMinutes) return;

    setGlobalError(null);
    const errors: Record<string, string[]> = {};

    if (!currentPassword) {
      errors.currentPassword = ["Current password is required."];
    }

    if (!newPassword) {
      errors.newPassword = ["New password is required."];
    } else if (!isValidPassword) {
      errors.newPassword = [
        "Password must be 8-128 characters and contain uppercase, lowercase, number, and special character."
      ];
    }

    if (!confirmPassword) {
      errors.confirmPassword = ["Please confirm your new password."];
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = ["Passwords do not match."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGlobalError(null);

      const res = await changePassword(currentPassword, newPassword);

      if (res.success) {
        onSuccess(res.message || "Password changed successfully.");
        onClose();
      } else {
        setGlobalError(res.message || "Failed to change password.");
      }
    } catch (err: unknown) {
      const errObj = err as { 
        status?: number; 
        code?: string; 
        message?: string; 
        errors?: Record<string, string[]>;
      };

      if (errObj.status === 429) {
        const match = errObj.message?.match(/(\d+)\s+minute/i);
        setLockoutMinutes(match ? parseInt(match[1], 10) : 15);
        setGlobalError(errObj.message || "Too many attempts. Account temporarily locked.");
      } else if (errObj.errors) {
        // Map backend errors (e.g. body.currentPassword or currentPassword)
        const mappedErrors: Record<string, string[]> = {};
        for (const [key, msgs] of Object.entries(errObj.errors)) {
          const cleanKey = key.replace("body.", "");
          mappedErrors[cleanKey] = msgs;
        }
        setFieldErrors(mappedErrors);
      } else {
        setGlobalError(errObj.message || "Failed to change password. Please verify current password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500">Update your account credentials</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lockout Banner */}
          {lockoutMinutes !== null && lockoutMinutes > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800 text-xs">
              <Clock className="w-4 h-4 shrink-0 text-amber-600" />
              <div>
                <span className="font-semibold">Security lockout in effect.</span> Try again in{" "}
                <span className="font-bold">{lockoutMinutes} minute(s)</span>.
              </div>
            </div>
          )}

          {/* Global Error Banner */}
          {globalError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{globalError}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                disabled={isSubmitting || !!lockoutMinutes}
                className={clsx(
                  "w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors",
                  fieldErrors.currentPassword 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" 
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.currentPassword[0]}</p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                disabled={isSubmitting || !!lockoutMinutes}
                className={clsx(
                  "w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors",
                  fieldErrors.newPassword 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" 
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.newPassword[0]}</p>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                disabled={isSubmitting || !!lockoutMinutes}
                className={clsx(
                  "w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-lg focus:outline-none transition-colors",
                  fieldErrors.confirmPassword 
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" 
                    : "border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-rose-600 text-xs mt-1">{fieldErrors.confirmPassword[0]}</p>
            )}
          </div>

          {/* Dynamic Requirements Checklist */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">Password Requirements:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className={clsx("flex items-center gap-1.5", isMinLength ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 8–128 characters
              </span>
              <span className={clsx("flex items-center gap-1.5", hasUpper ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Uppercase letter
              </span>
              <span className={clsx("flex items-center gap-1.5", hasLower ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Lowercase letter
              </span>
              <span className={clsx("flex items-center gap-1.5", hasNumber ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> One number
              </span>
              <span className={clsx("flex items-center gap-1.5", hasSpecial ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Special character
              </span>
              <span className={clsx("flex items-center gap-1.5", passwordsMatch ? "text-emerald-600 font-medium" : "text-slate-400")}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Passwords match
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!lockoutMinutes || !currentPassword || !isValidPassword || !passwordsMatch}
              className={clsx(
                "px-4.5 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-2",
                (isSubmitting || !!lockoutMinutes || !currentPassword || !isValidPassword || !passwordsMatch)
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-[#1E293B] hover:bg-[#0F172A] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
