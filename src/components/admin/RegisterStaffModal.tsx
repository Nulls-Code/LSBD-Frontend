"use client";

import React, { useState } from "react";
import { 
  X, UserPlus, Mail, Lock, ShieldCheck, 
  Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 
} from "lucide-react";
import clsx from "clsx";
import { registerStaff } from "@/lib/api";
import { StaffUser } from "@/lib/types";

interface RegisterStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUser?: StaffUser) => void;
}

export function RegisterStaffModal({ isOpen, onClose, onSuccess }: RegisterStaffModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER" | "EMPLOYEE">("EMPLOYEE");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  // Password validation checks (PDF section 5.2)
  const isMinLength = password.length >= 8 && password.length <= 128;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(password);

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
    if (!email.trim()) {
      errors.email = ["Email is required."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = ["Please enter a valid email address."];
    }

    if (!password) {
      errors.password = ["Password is required."];
    } else if (!isMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      errors.password = [
        "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol."
      ];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});

      const res = await registerStaff({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole("EMPLOYEE");
      onSuccess(res.data);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { message?: string; errors?: Record<string, string[]> };
      if (errObj.errors) {
        setFieldErrors(errObj.errors);
      } else {
        setGlobalError(errObj.message || "Failed to register staff user.");
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
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Register New Staff</h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Security-sensitive staff credentials and operational role assignment.
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
                placeholder="e.g. Tariq"
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
                placeholder="e.g. Ahmed"
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

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: [] }));
                }}
                placeholder="staff.name@lsbd.demo"
                className={clsx(
                  "w-full pl-9 pr-3 py-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.email ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
                )}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Temporary Initial Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: [] }));
                }}
                placeholder="Minimum 8 characters with mix of symbols"
                className={clsx(
                  "w-full pl-9 pr-10 py-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                  fieldErrors.password ? "border-rose-500 bg-rose-50/30" : "border-slate-300"
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
            {fieldErrors.password && (
              <p className="text-rose-500 text-xs mt-1">{fieldErrors.password[0]}</p>
            )}

            {/* Password constraints helper */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 bg-slate-50 p-2.5 rounded-md border border-slate-200 text-[11px] text-slate-600">
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
                <CheckCircle2 className="w-3 h-3" /> 1 number & special char
              </span>
            </div>
          </div>

          {/* Operational Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Operational Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("EMPLOYEE")}
                className={clsx(
                  "p-3 rounded-lg border text-left cursor-pointer transition-all",
                  role === "EMPLOYEE"
                    ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                    : "border-slate-200 hover:border-slate-300 bg-white"
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
                onClick={() => setRole("MANAGER")}
                className={clsx(
                  "p-3 rounded-lg border text-left cursor-pointer transition-all",
                  role === "MANAGER"
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300 bg-white"
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
                onClick={() => setRole("ADMIN")}
                className={clsx(
                  "p-3 rounded-lg border text-left cursor-pointer transition-all",
                  role === "ADMIN"
                    ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-600"
                    : "border-slate-200 hover:border-slate-300 bg-white"
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

          {/* Audit Note */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              All account registration actions are logged with your administrative audit fingerprint.
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
                  Registering...
                </>
              ) : (
                "Register Staff"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
