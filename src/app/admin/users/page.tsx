"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Shield, Plus, MoreHorizontal, UserCog, KeyRound, 
  UserX, UserCheck, CheckCircle2, RefreshCw, Loader2, AlertCircle
} from "lucide-react";
import { fetchUsers } from "@/lib/api";
import { StaffUser } from "@/lib/types";
import { RegisterStaffModal } from "@/components/admin/RegisterStaffModal";
import { EditStaffModal } from "@/components/admin/EditStaffModal";
import { DeactivateStaffModal } from "@/components/admin/DeactivateStaffModal";
import { ResetPasswordModal } from "@/components/admin/ResetPasswordModal";

export default function AdministrationManagementPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("aminul@lsbd.demo");
  const [currentUserId, setCurrentUserId] = useState("usr-admin-01");

  // Notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dropdown state
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<StaffUser | null>(null);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState<StaffUser | null>(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState<StaffUser | null>(null);

  // Fetch current user profile to identify "You"
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/v1/auth/profile", { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          const user = json?.data?.user || json?.data;
          if (user?.email) setCurrentUserEmail(user.email);
          if (user?.id) setCurrentUserId(user.id);
        }
      } catch {
        // Dev fallback
      }
    };
    fetchProfile();
  }, []);

  // Fetch staff users from backend
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchUsers(1, 100);
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.message || "Failed to load staff accounts.");
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setError(errObj.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function initUsers() {
      try {
        setError(null);
        const res = await fetchUsers(1, 100);
        if (!ignore) {
          if (res.success && res.data) {
            setUsers(res.data);
          } else {
            setError(res.message || "Failed to load staff accounts.");
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          const errObj = err as { message?: string };
          setError(errObj.message || "Failed to connect to backend server.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    initUsers();
    return () => {
      ignore = true;
    };
  }, []);

  // Click outside listener for action dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date as "04 Jan 2025"
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to get initials
  const getInitials = (firstName: string, lastName?: string) => {
    const first = firstName ? firstName[0] : "";
    const second = lastName ? lastName[0] : "";
    return (first + second).toUpperCase() || "U";
  };

  // Toast auto-clear
  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Modal success handlers
  const handleRegisterSuccess = (newUser?: StaffUser) => {
    if (newUser) {
      setUsers((prev) => [newUser, ...prev]);
    } else {
      loadUsers();
    }
    showToast("New staff member registered successfully.");
  };

  const handleEditSuccess = (updatedUser: StaffUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    showToast(`Updated profile for ${updatedUser.firstName} ${updatedUser.lastName}.`);
  };

  const handleStatusChangeSuccess = (updatedUser: StaffUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    const actionWord = updatedUser.isActive ? "reactivated" : "deactivated";
    showToast(`Staff account ${actionWord} successfully.`);
  };

  const handleResetPasswordSuccess = () => {
    showToast("Temporary password generated and updated successfully.");
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto min-h-screen bg-[#F8FAFC]">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0B132B] text-white rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B132B] tracking-tight">
            Administration Management
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Security-sensitive staff access, roles, and account status.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-[#0B132B] hover:bg-[#1E293B] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register New Staff
        </button>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-[#0B1A30] border border-slate-800 rounded-xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-xs">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-white text-sm font-semibold leading-tight">
            Role changes affect operational authority.
          </h4>
          <p className="text-slate-400 text-xs mt-1 leading-normal">
            All staff administration actions should be confirmed and auditable.
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#EAF5FF] border border-[#A5B4C2] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#082A46]">
              <tr className="text-[11px] font-bold text-[#8FA5B8] tracking-wider uppercase">
                <th className="py-4 px-6 font-semibold">NAME</th>
                <th className="py-4 px-6 font-semibold">EMAIL</th>
                <th className="py-4 px-6 font-semibold">ROLE</th>
                <th className="py-4 px-6 font-semibold">ACTIVE STATUS</th>
                <th className="py-4 px-6 font-semibold">CREATED</th>
                <th className="py-4 px-6 text-right font-semibold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A5B4C2]/70 bg-[#EAF5FF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[#52637A]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#082A46]" />
                      <p className="text-xs font-medium text-[#52637A]">Loading staff accounts...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-rose-600">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <AlertCircle className="w-7 h-7 text-rose-500" />
                      <p className="text-xs font-semibold text-rose-700">{error}</p>
                      <button
                        onClick={loadUsers}
                        className="mt-2 px-3 py-1.5 text-xs bg-white border border-rose-300 text-rose-700 rounded-md hover:bg-rose-50 font-medium transition-colors cursor-pointer shadow-2xs"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#52637A]">
                    <p className="font-semibold text-slate-700 text-sm">No staff accounts found</p>
                    <p className="text-xs text-[#64748B] mt-1">There are currently no staff accounts registered.</p>
                  </td>
                </tr>
              ) : (
                users.map((staff) => {
                const isSelf =
                  staff.email === currentUserEmail ||
                  staff.id === currentUserId ||
                  (staff.email === "aminul@lsbd.demo" && currentUserEmail.includes("aminul"));

                const fullName = `${staff.firstName} ${staff.lastName}`.trim();
                const initials = getInitials(staff.firstName, staff.lastName);
                const isActive = staff.isActive !== false;

                return (
                  <tr
                    key={staff.id}
                    className="hover:bg-[#DFEEFC] transition-colors group"
                  >
                    {/* Name with Avatar */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#182330] text-[#D3D5D8] text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="flex items-center">
                          <span className="text-[#334155] text-sm font-semibold">
                            {fullName}
                          </span>
                          {isSelf && (
                            <span className="text-[#64748B] text-xs font-normal ml-1.5">
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-6 text-[#52637A] text-sm">
                      {staff.email}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-6">
                      {staff.role === "ADMIN" && (
                        <span className="inline-flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#785897] text-white shadow-2xs">
                          ADMIN
                        </span>
                      )}
                      {staff.role === "MANAGER" && (
                        <span className="inline-flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#306386] text-white shadow-2xs">
                          MANAGER
                        </span>
                      )}
                      {staff.role === "EMPLOYEE" && (
                        <span className="inline-flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#346652] text-white shadow-2xs">
                          EMPLOYEE
                        </span>
                      )}
                      {staff.role !== "ADMIN" &&
                        staff.role !== "MANAGER" &&
                        staff.role !== "EMPLOYEE" && (
                          <span className="inline-flex items-center justify-center min-w-[76px] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-slate-600 text-white">
                            {staff.role}
                          </span>
                        )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-6">
                      {isActive ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#16A34A]">
                          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#7F6B60]">
                          <span className="w-2 h-2 rounded-full bg-[#7F6B60] shrink-0" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-6 text-[#52637A] text-sm">
                      {formatDate(staff.createdAt)}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-6 text-right relative">
                      <div className="inline-block text-left">
                        <button
                          onClick={() => {
                            setActiveDropdownId(
                              activeDropdownId === staff.id ? null : staff.id
                            );
                          }}
                          className="text-[#64748B] hover:text-[#082A46] p-1.5 rounded-md hover:bg-white/60 transition-colors cursor-pointer"
                          aria-label="Staff actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Popup */}
                        {activeDropdownId === staff.id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-6 mt-1.5 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left"
                          >
                            {/* Edit Role & Name */}
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                setSelectedUserForEdit(staff);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <UserCog className="w-3.5 h-3.5 text-blue-600" />
                              Edit Profile / Role
                            </button>

                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setActiveDropdownId(null);
                                setSelectedUserForReset(staff);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              Reset Password
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            {/* Deactivate / Reactivate (Guarded against self) */}
                            {isSelf ? (
                              <div
                                title="You cannot deactivate your own administrative account"
                                className="w-full px-3.5 py-2 text-xs text-slate-400 flex items-center gap-2.5 cursor-not-allowed opacity-60"
                              >
                                <UserX className="w-3.5 h-3.5 text-slate-400" />
                                Deactivate Account
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveDropdownId(null);
                                  setSelectedUserForDeactivate(staff);
                                }}
                                className={`w-full px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                                  isActive
                                    ? "text-rose-600 hover:bg-rose-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5 text-rose-500" />
                                    Deactivate Account
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    Reactivate Account
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Refresh footer */}
        <div className="p-3 px-6 bg-[#E0EDFA] border-t border-[#A5B4C2] flex items-center justify-between text-xs text-[#52637A]">
          <span>Total Authorized Staff: {loading ? "—" : users.length}</span>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1.5 hover:text-[#082A46] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Sync with server
          </button>
        </div>
      </div>

      {/* Modals */}
      <RegisterStaffModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegisterSuccess}
      />

      <EditStaffModal
        key={selectedUserForEdit?.id || "new"}
        isOpen={Boolean(selectedUserForEdit)}
        user={selectedUserForEdit}
        isSelf={
          selectedUserForEdit?.email === currentUserEmail ||
          selectedUserForEdit?.id === currentUserId ||
          (selectedUserForEdit?.email === "aminul@lsbd.demo" && currentUserEmail.includes("aminul"))
        }
        onClose={() => setSelectedUserForEdit(null)}
        onSuccess={handleEditSuccess}
      />

      <DeactivateStaffModal
        isOpen={Boolean(selectedUserForDeactivate)}
        user={selectedUserForDeactivate}
        onClose={() => setSelectedUserForDeactivate(null)}
        onSuccess={handleStatusChangeSuccess}
      />

      <ResetPasswordModal
        isOpen={Boolean(selectedUserForReset)}
        user={selectedUserForReset}
        onClose={() => setSelectedUserForReset(null)}
        onSuccess={handleResetPasswordSuccess}
      />
    </div>
  );
}
