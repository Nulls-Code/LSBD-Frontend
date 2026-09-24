"use client";

import React, { useState } from "react";
import { X, Building2, MapPin, Globe, Hash, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { createLocation } from "@/lib/api";

interface CreateHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateHubModal({ isOpen, onClose, onSuccess }: CreateHubModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically convert to uppercase and sanitize allowed characters: alphanumeric, - and _
    const val = e.target.value.toUpperCase();
    setCode(val);
    if (fieldErrors.code) {
      setFieldErrors((prev) => ({ ...prev, code: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: Record<string, string[]> = {};

    // Client-side validations (PDF section 5.2)
    if (!name.trim()) {
      errors.name = ["Hub name is required (1-100 characters)."];
    } else if (name.trim().length > 100) {
      errors.name = ["Hub name must not exceed 100 characters."];
    }

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      errors.code = ["Hub code is required (2-20 characters)."];
    } else if (cleanCode.length < 2 || cleanCode.length > 20) {
      errors.code = ["Hub code must be between 2 and 20 characters."];
    } else if (!/^[A-Z0-9_-]+$/.test(cleanCode)) {
      errors.code = ["Hub code must contain only letters, numbers, hyphens (-), and underscores (_)."];
    }

    if (!city.trim()) {
      errors.city = ["City is required (1-100 characters)."];
    } else if (city.trim().length > 100) {
      errors.city = ["City must not exceed 100 characters."];
    }

    if (!country.trim()) {
      errors.country = ["Country is required (1-100 characters)."];
    } else if (country.trim().length > 100) {
      errors.country = ["Country must not exceed 100 characters."];
    }

    if (address.trim().length > 255) {
      errors.address = ["Address must not exceed 255 characters."];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      await createLocation({
        name: name.trim(),
        code: cleanCode,
        city: city.trim(),
        country: country.trim(),
        address: address.trim() || undefined,
      });

      // Reset fields
      setName("");
      setCode("");
      setCity("");
      setCountry("");
      setAddress("");
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setGlobalError(err.message || "Failed to create location.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0f1b3b] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Create Transit Hub</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Register a new physical sorting hub, customs depot, or airport station.
            </p>
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

          {/* Name & Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hub Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hub Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dhaka Gateway Hub"
                  className={clsx(
                    "w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                    fieldErrors.name ? "border-red-500 bg-red-50/40" : "border-slate-300"
                  )}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Hub Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unique Hub Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="e.g. DAC-HUB"
                  maxLength={20}
                  className={clsx(
                    "w-full pl-9 pr-3 py-2 border rounded-md text-sm font-mono uppercase text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                    fieldErrors.code ? "border-red-500 bg-red-50/40" : "border-slate-300"
                  )}
                />
              </div>
              {fieldErrors.code ? (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.code[0]}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">2-20 characters, uppercase</p>
              )}
            </div>
          </div>

          {/* City & Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dhaka"
                  className={clsx(
                    "w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                    fieldErrors.city ? "border-red-500 bg-red-50/40" : "border-slate-300"
                  )}
                />
              </div>
              {fieldErrors.city && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.city[0]}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Country <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Bangladesh"
                  className={clsx(
                    "w-full pl-9 pr-3 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors",
                    fieldErrors.country ? "border-red-500 bg-red-50/40" : "border-slate-300"
                  )}
                />
              </div>
              {fieldErrors.country && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.country[0]}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Address / Cargo Terminal Zone <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Hazrat Shahjalal International Airport, Cargo Terminal Zone"
              className={clsx(
                "w-full p-2.5 border rounded-md text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-colors",
                fieldErrors.address ? "border-red-500 bg-red-50/40" : "border-slate-300"
              )}
            />
            {fieldErrors.address && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.address[0]}</p>
            )}
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
              className="px-5 py-2 bg-[#0f1b3b] hover:bg-[#1e293b] text-white text-sm font-semibold rounded-md shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Hub"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
