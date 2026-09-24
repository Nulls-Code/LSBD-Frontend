"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Plus, Package, User, MapPin, AlertCircle, Loader2, CheckCircle2, ChevronDown 
} from "lucide-react";
import clsx from "clsx";
import { createCourierRequest, fetchLocations } from "@/lib/api";
import { Location, CourierRequest } from "@/lib/types";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest?: CourierRequest) => void;
  availableLocations?: Location[];
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
  availableLocations = [],
}: CreateRequestModalProps) {
  // Form fields
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [senderAddress, setSenderAddress] = useState("");

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  const [originLocationId, setOriginLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");

  const [packageDescription, setPackageDescription] = useState("");
  const [packageWeight, setPackageWeight] = useState("1.0");
  const [weightUnit, setWeightUnit] = useState<"KG" | "LB">("KG");
  const [packageCount, setPackageCount] = useState("1");
  const [requestNotes, setRequestNotes] = useState("");

  const [locations, setLocations] = useState<Location[]>(availableLocations);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [createdSuccess, setCreatedSuccess] = useState<CourierRequest | null>(null);

  // Sync locations if passed or fetch if empty
  useEffect(() => {
    if (availableLocations.length > 0) {
      setLocations(availableLocations.filter((l) => l.isActive !== false));
      if (!originLocationId && availableLocations[0]) {
        setOriginLocationId(availableLocations[0].id);
      }
      if (!destinationLocationId && availableLocations[1]) {
        setDestinationLocationId(availableLocations[1].id);
      }
    } else if (isOpen) {
      fetchLocations(1, 100, undefined, "true")
        .then((res) => {
          if (res.success && res.data) {
            setLocations(res.data);
            if (res.data[0]) setOriginLocationId(res.data[0].id);
            if (res.data[1]) setDestinationLocationId(res.data[1].id);
          }
        })
        .catch(console.error);
    }
  }, [availableLocations, isOpen]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setCreatedSuccess(null);
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: Record<string, string[]> = {};

    if (!senderName.trim()) errors.senderName = ["Sender name is required"];
    if (!senderPhone.trim()) errors.senderPhone = ["Sender phone is required"];
    if (!senderEmail.trim()) {
      errors.senderEmail = ["Sender email is required"];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      errors.senderEmail = ["Invalid email address format"];
    }
    if (!senderAddress.trim()) errors.senderAddress = ["Sender address is required"];

    if (!recipientName.trim()) errors.recipientName = ["Recipient name is required"];
    if (!recipientPhone.trim()) errors.recipientPhone = ["Recipient phone is required"];
    if (!recipientAddress.trim()) errors.recipientAddress = ["Recipient address is required"];
    if (recipientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      errors.recipientEmail = ["Invalid email address format"];
    }

    if (!originLocationId) errors.originLocationId = ["Origin hub is required"];
    if (!destinationLocationId) errors.destinationLocationId = ["Destination hub is required"];
    if (originLocationId && destinationLocationId && originLocationId === destinationLocationId) {
      errors.destinationLocationId = ["Origin and destination locations must be different"];
    }

    if (!packageDescription.trim()) errors.packageDescription = ["Package description is required"];
    const weightNum = parseFloat(packageWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      errors.packageWeight = ["Weight must be a positive number greater than 0"];
    }

    const countNum = parseInt(packageCount, 10);
    if (isNaN(countNum) || countNum < 1) {
      errors.packageCount = ["Package count must be at least 1"];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      setFieldErrors({});

      const payload = {
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim(),
        senderAddress: senderAddress.trim(),
        senderCompany: senderCompany.trim() || undefined,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        recipientEmail: recipientEmail.trim() || undefined,
        recipientAddress: recipientAddress.trim(),
        originLocationId,
        destinationLocationId,
        packageDescription: packageDescription.trim(),
        packageWeight: parseFloat(packageWeight),
        weightUnit,
        packageCount: parseInt(packageCount, 10),
        requestNotes: requestNotes.trim() || undefined,
      };

      const res = await createCourierRequest(payload);

      if (res.success && res.data) {
        setCreatedSuccess(res.data);
        onSuccess(res.data);
      } else {
        setErrorMessage(res.message || "Failed to create courier request.");
      }
    } catch (err: any) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setErrorMessage(err.message || "An unexpected error occurred while creating request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSenderName("");
    setSenderPhone("");
    setSenderEmail("");
    setSenderCompany("");
    setSenderAddress("");
    setRecipientName("");
    setRecipientPhone("");
    setRecipientEmail("");
    setRecipientAddress("");
    setPackageDescription("");
    setPackageWeight("1.0");
    setPackageCount("1");
    setRequestNotes("");
    setCreatedSuccess(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#0B132B] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Courier Request</h2>
              <p className="text-xs text-slate-400">Back-office intake registration and customer upsert (PDF Section 7.3.1)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {createdSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Courier Request Created Successfully</h3>
              <p className="text-xs text-slate-500 mt-1">
                The intake request is now in <strong className="text-amber-600">PENDING</strong> status, awaiting manager review.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
              <div><span className="text-slate-400">Request ID:</span> <strong className="text-slate-900">{createdSuccess.id}</strong></div>
              <div><span className="text-slate-400">Sender:</span> <span className="text-slate-800">{createdSuccess.senderName}</span></div>
              <div><span className="text-slate-400">Recipient:</span> <span className="text-slate-800">{createdSuccess.recipientName}</span></div>
              <div>
                <span className="text-slate-400">Route:</span>{" "}
                <span className="text-slate-800 font-semibold">{createdSuccess.originLocation?.code} → {createdSuccess.destinationLocation?.code}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Create Another Request
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                Done & Return to Requests
              </button>
            </div>
          </div>
        ) : (
          /* Intake Form */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 2-Column: Sender vs Recipient (PDF Section 4.2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Details */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Sender Information</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sender Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Rahim Enterprise Ltd"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.senderName ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  {fieldErrors.senderName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.senderName[0]}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+8801711223344"
                      className={clsx(
                        "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                        fieldErrors.senderPhone ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      )}
                    />
                    {fieldErrors.senderPhone && (
                      <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.senderPhone[0]}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="rahim@enterprise.com"
                      className={clsx(
                        "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                        fieldErrors.senderEmail ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      )}
                    />
                    {fieldErrors.senderEmail && (
                      <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.senderEmail[0]}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={senderCompany}
                    onChange={(e) => setSenderCompany(e.target.value)}
                    placeholder="e.g. Rahim Enterprise Ltd"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    placeholder="e.g. House 12, Road 5, Dhanmondi, Dhaka"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.senderAddress ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  {fieldErrors.senderAddress && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.senderAddress[0]}</span>
                  )}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Recipient Information</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.recipientName ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  {fieldErrors.recipientName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.recipientName[0]}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+12125551234"
                      className={clsx(
                        "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                        fieldErrors.recipientPhone ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      )}
                    />
                    {fieldErrors.recipientPhone && (
                      <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.recipientPhone[0]}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Email <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="johndoe@example.com"
                      className={clsx(
                        "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                        fieldErrors.recipientEmail ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      )}
                    />
                    {fieldErrors.recipientEmail && (
                      <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.recipientEmail[0]}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="e.g. 450 7th Ave, New York, NY 10123"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.recipientAddress ? "border-rose-500 ring-rose-500" : "border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    )}
                  />
                  {fieldErrors.recipientAddress && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.recipientAddress[0]}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Route & Hub Selection (PDF Section 5.2: Origin != Destination) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Transit Route Hubs</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Origin Transit Hub <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={originLocationId}
                      onChange={(e) => setOriginLocationId(e.target.value)}
                      className={clsx(
                        "appearance-none w-full text-xs px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-1 bg-white cursor-pointer",
                        fieldErrors.originLocationId ? "border-rose-500" : "border-slate-300 focus:border-blue-500"
                      )}
                    >
                      <option value="">Select origin hub</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city} ({loc.code}) - {loc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {fieldErrors.originLocationId && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.originLocationId[0]}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Transit Hub <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={destinationLocationId}
                      onChange={(e) => setDestinationLocationId(e.target.value)}
                      className={clsx(
                        "appearance-none w-full text-xs px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-1 bg-white cursor-pointer",
                        fieldErrors.destinationLocationId ? "border-rose-500" : "border-slate-300 focus:border-blue-500"
                      )}
                    >
                      <option value="">Select destination hub</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.city} ({loc.code}) - {loc.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {fieldErrors.destinationLocationId && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.destinationLocationId[0]}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Package Specifications */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Package className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Package Details</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Package Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="e.g. Export Garment Samples (Cotton Fabric)"
                  className={clsx(
                    "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                    fieldErrors.packageDescription ? "border-rose-500" : "border-slate-300 focus:border-blue-500"
                  )}
                />
                {fieldErrors.packageDescription && (
                  <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.packageDescription[0]}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Weight */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Weight <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(e.target.value)}
                    placeholder="5.5"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.packageWeight ? "border-rose-500" : "border-slate-300 focus:border-blue-500"
                    )}
                  />
                  {fieldErrors.packageWeight && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.packageWeight[0]}</span>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weight Unit
                  </label>
                  <div className="flex rounded-md border border-slate-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setWeightUnit("KG")}
                      className={clsx(
                        "flex-1 py-2 text-xs font-semibold transition-colors",
                        weightUnit === "KG" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit("LB")}
                      className={clsx(
                        "flex-1 py-2 text-xs font-semibold transition-colors",
                        weightUnit === "LB" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      LB
                    </button>
                  </div>
                </div>

                {/* Package Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Package Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={packageCount}
                    onChange={(e) => setPackageCount(e.target.value)}
                    placeholder="1"
                    className={clsx(
                      "w-full text-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-1 bg-white",
                      fieldErrors.packageCount ? "border-rose-500" : "border-slate-300 focus:border-blue-500"
                    )}
                  />
                  {fieldErrors.packageCount && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{fieldErrors.packageCount[0]}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer / Handling Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Fragile samples, handle with care, temperature sensitive"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Footer Buttons */}
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
                disabled={loading}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Courier Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
