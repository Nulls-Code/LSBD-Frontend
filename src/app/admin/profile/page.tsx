"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  KeyRound, ShieldCheck, CheckCircle2, AlertCircle, 
  Loader2, Save, ChevronDown, Check, Building2, Globe
} from "lucide-react";
import clsx from "clsx";
import { fetchUserProfile, updateUser, fetchLocations } from "@/lib/api";
import { StaffUser, Location } from "@/lib/types";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";

export default function ProfileAndSettingsPage() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedHubId, setSelectedHubId] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Dhaka (UTC+6)");

  // Status & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [clientSessionInfo, setClientSessionInfo] = useState("This browser · Dhaka, Bangladesh");

  // Load User Profile and Available Locations
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        // Fetch current authenticated user profile (PDF Spec Section 7.1.4)
        const profileRes = await fetchUserProfile().catch(() => null);
        const userData: StaffUser | null = profileRes?.data || null;

        // Fetch active locations for the Local Hub dropdown (PDF Spec Section 7.2.1)
        const locationsRes = await fetchLocations(1, 100, undefined, "true").catch(() => null);
        const activeLocations = locationsRes?.data || [];

        if (isMounted) {
          setLocations(activeLocations);

          if (userData) {
            setUser(userData);
            const name = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email || "";
            setFullName(name);
            setEmail(userData.email || "");

            // Read persisted preferences from localStorage if available
            try {
              const savedPref = localStorage.getItem(`lsbd_user_pref_${userData.id}`);
              if (savedPref) {
                const parsed = JSON.parse(savedPref);
                if (parsed.hubId) setSelectedHubId(parsed.hubId);
                if (parsed.timezone) setSelectedTimezone(parsed.timezone);
              } else if (activeLocations.length > 0) {
                // Default to first hub (e.g. Dhaka Central Air Hub)
                setSelectedHubId(activeLocations[0].id);
              }
            } catch {
              if (activeLocations.length > 0) {
                setSelectedHubId(activeLocations[0].id);
              }
            }
          } else {
            // Fallback default state
            setFullName("Aminul Haque");
            setEmail("aminul@lsbd.demo");
            if (activeLocations.length > 0) {
              setSelectedHubId(activeLocations[0].id);
            }
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load profile data:", err);
        if (isMounted) {
          setErrorMessage("Failed to load profile information. Please refresh the page.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Client session detection
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      let browser = "This browser";
      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
      else if (ua.includes("Edg")) browser = "Edge";
      setClientSessionInfo(`${browser} · Dhaka, Bangladesh`);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setFieldErrors({ fullName: ["Full name is required."] });
      return;
    }

    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setIsSaving(true);

    try {
      if (user?.id) {
        // Save to backend via PATCH /api/v1/users/:id (PDF Spec Section 7.7.3)
        const updateRes = await updateUser(user.id, {
          firstName,
          lastName,
        });

        if (updateRes.success && updateRes.data) {
          setUser(updateRes.data);
        }
      }

      // Persist preferences (hub and timezone) locally for this user
      if (user?.id) {
        localStorage.setItem(
          `lsbd_user_pref_${user.id}`,
          JSON.stringify({
            hubId: selectedHubId,
            timezone: selectedTimezone,
          })
        );
      }

      // Broadcast profile update event so Sidebar and Topbar update in real time
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", {
          detail: {
            id: user?.id,
            firstName,
            lastName,
            fullName: trimmedName,
            role: user?.role || "ADMIN",
            hubId: selectedHubId,
            timezone: selectedTimezone,
          },
        })
      );

      showToast("Profile details saved successfully.");
    } catch (err: unknown) {
      const errObj = err as { message?: string; errors?: Record<string, string[]> };
      if (errObj.errors) {
        setFieldErrors(errObj.errors);
      } else {
        setErrorMessage(errObj.message || "Failed to save profile changes.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const currentHub = locations.find((l) => l.id === selectedHubId);
  const hubDisplayName = currentHub ? `${currentHub.name}` : "Dhaka Gateway Hub";
  const userRole = user?.role || "ADMIN";

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0B132B] text-white rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Personal details and secure account preferences.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ──────────────────────────────────────────────────────── */}
          {/* Left Column: Staff Profile Card                          */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-7">
            <h2 className="text-base font-semibold text-slate-900 mb-5">
              Staff profile
            </h2>

            {/* Profile Header without image as per requirement */}
            <div className="pb-6 mb-6 border-b border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-slate-900">
                  {fullName || "Aminul Haque"}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#2D1B4E] text-[#C084FC] border border-[#581C87]">
                  {userRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {hubDisplayName} · Evening shift
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={clsx(
                      "w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none transition-colors",
                      fieldErrors.fullName
                        ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    )}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-rose-600 text-xs mt-1">{fieldErrors.fullName[0]}</p>
                  )}
                </div>

                {/* Work email input */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    readOnly
                    title="Work email is managed by your administrator"
                    className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200 text-slate-600 rounded-lg cursor-not-allowed select-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Local hub dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Local hub
                  </label>
                  <div className="relative">
                    <select
                      value={selectedHubId}
                      onChange={(e) => setSelectedHubId(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors cursor-pointer"
                    >
                      {locations.length > 0 ? (
                        locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.code} — {loc.name}
                          </option>
                        ))
                      ) : (
                        <option value="DAC-HUB">DAC-HUB — Dhaka Gateway Hub</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Preferred timezone dropdown */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Preferred timezone
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors cursor-pointer"
                    >
                      <option value="Asia/Dhaka (UTC+6)">Asia/Dhaka (UTC+6)</option>
                      <option value="Asia/Dubai (UTC+4)">Asia/Dubai (UTC+4)</option>
                      <option value="Europe/London (UTC+1)">Europe/London (UTC+1)</option>
                      <option value="America/New_York (UTC-5)">America/New_York (UTC-5)</option>
                      <option value="Asia/Singapore (UTC+8)">Asia/Singapore (UTC+8)</option>
                      <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Save profile button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !fullName.trim()}
                  className={clsx(
                    "w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-all shadow-xs flex items-center justify-center gap-2",
                    isSaving || !fullName.trim()
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-[#1E293B] hover:bg-[#0F172A] active:scale-[0.99]"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving profile...
                    </>
                  ) : (
                    "Save profile"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* Right Column: Security Card                              */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
            <h2 className="text-base font-semibold text-slate-900">
              Security
            </h2>

            {/* Change password item */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-800">
                    Change password
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Use 8–128 characters with mixed character types.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-medium rounded-lg transition-colors shrink-0"
              >
                Update
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Active session item */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-800">
                    Active session
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {clientSessionInfo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium shrink-0 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(msg) => showToast(msg || "Password updated successfully.")}
      />
    </div>
  );
}
