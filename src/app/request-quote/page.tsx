"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, ShieldCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { RequestFormData } from "@/lib/types";

interface Location {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
}

export default function RequestQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    defaultValues: {
      weightUnit: "KG",
      packageCount: "1",
    },
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/locations/public")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLocations(json.data);
        } else {
          setLocationsError("Failed to load locations.");
        }
      })
      .catch(() => setLocationsError("Could not connect to the server."))
      .finally(() => setLocationsLoading(false));
  }, []);

  // After locations load and React renders the real <option> elements into the DOM,
  // set the form values so react-hook-form reads the correct IDs on submit.
  useEffect(() => {
    if (locations.length > 0) {
      setValue("originLocationId", locations[0].id);
      setValue("destinationLocationId", locations[locations.length - 1].id);
    }
  }, [locations, setValue]);

  const onSubmit = async (data: RequestFormData) => {
    setApiError("");
    try {
      // Map frontend specific fields to match backend schema perfectly
      const payload = {
        ...data,
        recipientEmail: data.recipientEmail || undefined,
        senderCompany: data.senderCompany || undefined,
        requestNotes: data.requestNotes || undefined,
        packageWeight: data.packageWeight ? parseFloat(data.packageWeight) : undefined,
        weightUnit: data.weightUnit,
        packageCount: data.packageCount ? parseInt(data.packageCount, 10) || 1 : 1,
      };

      const response = await fetch("http://localhost:5000/api/v1/courier-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend Error Data:", errorData);
        const details = errorData.error?.errors ? JSON.stringify(errorData.error.errors) : (errorData.error?.details ? JSON.stringify(errorData.error.details) : "");
        throw new Error(`${errorData.error?.message || "Failed to submit request"} ${details}`.trim());
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Courier Request Error:", err);
      if (err instanceof Error) {
        setApiError(err.message || "An unexpected error occurred.");
      } else {
        setApiError("An unexpected error occurred.");
      }
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f0f5fa] py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#0f294d]">Quote Request Received!</h2>
          <p className="text-[#5c6b7f]">
            Our operations team will review your route and specifications and reply with a rate within 2 hours.
          </p>
          <div className="pt-4 flex flex-col space-y-3">
            <Button
              onClick={() => {
                setSubmitted(false);
                reset();
              }}
              className="bg-[#0f294d] hover:bg-[#0a1c36] text-white w-full"
            >
              Send Another Request
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full text-slate-700">
                Return to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // UI styling based on image
  const inputClassName = "w-full bg-[#fcfcfd] border-slate-200/80 text-[#0f294d] shadow-none h-[42px] rounded-lg focus-visible:ring-1 focus-visible:ring-[#0f294d] placeholder:text-slate-400 font-medium text-[13px]";
  const labelClassName = "text-[12px] text-slate-500 mb-1.5 block font-medium flex items-center gap-1";
  const requiredAsterisk = <span className="text-red-500">*</span>;
  
  return (
    <main className="min-h-screen bg-[#f0f5fa] py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[850px] mx-auto space-y-12 mt-4">
        
        {/* Header */}
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0f294d] tracking-tight">Arrange your international shipment</h1>
          <p className="text-slate-500 text-[15px] leading-relaxed">Tell us about the sender, recipient, route, and package. Our operations team will review your request before a shipment is created.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          
          {apiError && (
             <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-200">
               {apiError}
             </div>
          )}

          {/* Section 01 */}
          <div className="bg-white rounded-[16px] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-[30px] h-[30px] rounded-full bg-[#0f294d] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">01</div>
               <div>
                 <h2 className="text-[16px] font-bold text-[#0f294d]">Contact Information</h2>
                 <p className="text-[13px] text-slate-400 mt-0.5">Who is sending and receiving this parcel?</p>
               </div>
            </div>
            
            <div className="h-px bg-slate-100 w-full mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
               {/* Sender */}
               <div className="space-y-6">
                  <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Sender Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>Fullname {requiredAsterisk}</label>
                      <Input placeholder="Sender name" {...register("senderName", { required: "Required" })} className={inputClassName} />
                      {errors.senderName && <span className="text-[10px] text-red-500 mt-1 block">{errors.senderName.message}</span>}
                    </div>
                    <div>
                      <label className={labelClassName}>Phone {requiredAsterisk}</label>
                      <Input placeholder="+880" {...register("senderPhone", { required: "Required" })} className={inputClassName} />
                      {errors.senderPhone && <span className="text-[10px] text-red-500 mt-1 block">{errors.senderPhone.message}</span>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>Email {requiredAsterisk}</label>
                      <Input type="email" placeholder="name@company.com" {...register("senderEmail", { required: "Required" })} className={inputClassName} />
                      {errors.senderEmail && <span className="text-[10px] text-red-500 mt-1 block">{errors.senderEmail.message}</span>}
                    </div>
                    <div>
                      <label className={labelClassName}>Company</label>
                      <Input placeholder="Company name (optional)" {...register("senderCompany")} className={inputClassName} />
                    </div>
                  </div>

                  <div>
                     <label className={labelClassName}>Pickup address {requiredAsterisk}</label>
                     <Input placeholder="Full street address" {...register("senderAddress", { required: "Required" })} className={inputClassName} />
                     {errors.senderAddress && <span className="text-[10px] text-red-500 mt-1 block">{errors.senderAddress.message}</span>}
                  </div>
               </div>

               {/* Recipient */}
               <div className="space-y-6">
                  <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Recipient Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClassName}>Fullname {requiredAsterisk}</label>
                      <Input placeholder="Recipient name" {...register("recipientName", { required: "Required" })} className={inputClassName} />
                      {errors.recipientName && <span className="text-[10px] text-red-500 mt-1 block">{errors.recipientName.message}</span>}
                    </div>
                    <div>
                      <label className={labelClassName}>Phone {requiredAsterisk}</label>
                      <Input placeholder="+1" {...register("recipientPhone", { required: "Required" })} className={inputClassName} />
                      {errors.recipientPhone && <span className="text-[10px] text-red-500 mt-1 block">{errors.recipientPhone.message}</span>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className={labelClassName}>Email {requiredAsterisk}</label>
                      <Input type="email" placeholder="name@company.com" {...register("recipientEmail", { required: "Required" })} className={inputClassName} />
                      {errors.recipientEmail && <span className="text-[10px] text-red-500 mt-1 block">{errors.recipientEmail.message}</span>}
                    </div>
                  </div>

                  <div>
                     <label className={labelClassName}>Delivery address {requiredAsterisk}</label>
                     <Input placeholder="Full street address" {...register("recipientAddress", { required: "Required" })} className={inputClassName} />
                     {errors.recipientAddress && <span className="text-[10px] text-red-500 mt-1 block">{errors.recipientAddress.message}</span>}
                  </div>
               </div>
            </div>
          </div>

          {/* Section 02 */}
          <div className="bg-white rounded-[16px] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-[30px] h-[30px] rounded-full bg-[#0f294d] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">02</div>
               <div>
                 <h2 className="text-[16px] font-bold text-[#0f294d]">Route</h2>
                 <p className="text-[13px] text-slate-400 mt-0.5">Select active LSBD hubs for this request.</p>
               </div>
            </div>
            
            <div className="h-px bg-slate-100 w-full mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {locationsError && (
                 <div className="col-span-2 text-[12px] text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{locationsError}</div>
               )}
               <div className="relative">
                 <label className={labelClassName}>Origin hub {requiredAsterisk}</label>
                 {locationsLoading ? (
                   <div className={`${inputClassName} px-3 bg-slate-100 animate-pulse rounded-lg`}>&nbsp;</div>
                 ) : (
                   <select
                     {...register("originLocationId", { required: "Required" })}
                     className={`appearance-none ${inputClassName} px-3 bg-white outline-none`}
                   >
                     {locations.map(loc => (
                       <option key={loc.id} value={loc.id}>{loc.code} – {loc.name}</option>
                     ))}
                   </select>
                 )}
                 {!locationsLoading && <ChevronDown className="absolute right-3 top-[32px] w-4 h-4 text-slate-400 pointer-events-none" />}
                 {errors.originLocationId && <span className="text-[10px] text-red-500 mt-1 block">{errors.originLocationId.message}</span>}
               </div>
               <div className="relative">
                 <label className={labelClassName}>Destination hub {requiredAsterisk}</label>
                 {locationsLoading ? (
                   <div className={`${inputClassName} px-3 bg-slate-100 animate-pulse rounded-lg`}>&nbsp;</div>
                 ) : (
                   <select
                     {...register("destinationLocationId", { required: "Required" })}
                     className={`appearance-none ${inputClassName} px-3 bg-white outline-none`}
                   >
                     {locations.map(loc => (
                       <option key={loc.id} value={loc.id}>{loc.code} – {loc.name}</option>
                     ))}
                   </select>
                 )}
                 {!locationsLoading && <ChevronDown className="absolute right-3 top-[32px] w-4 h-4 text-slate-400 pointer-events-none" />}
                 {errors.destinationLocationId && <span className="text-[10px] text-red-500 mt-1 block">{errors.destinationLocationId.message}</span>}
               </div>
            </div>
          </div>

          {/* Section 03 */}
          <div className="bg-white rounded-[16px] p-6 md:p-10 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-[30px] h-[30px] rounded-full bg-[#0f294d] text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">03</div>
               <div>
                 <h2 className="text-[16px] font-bold text-[#0f294d]">Package specification</h2>
                 <p className="text-[13px] text-slate-400 mt-0.5">Provide accurate details for operations review.</p>
               </div>
            </div>
            
            <div className="h-px bg-slate-100 w-full mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
               <div className="md:col-span-2">
                 <label className={labelClassName}>Package description {requiredAsterisk}</label>
                 <Input placeholder="e.g. Textile samples" {...register("packageDescription", { required: "Required" })} className={inputClassName} />
                 {errors.packageDescription && <span className="text-[10px] text-red-500 mt-1 block">{errors.packageDescription.message}</span>}
               </div>
               
               <div>
                   <label className={labelClassName}>Weight {requiredAsterisk}</label>
                   <Input type="number" step="0.01" placeholder="0.00" {...register("packageWeight", { required: "Required" })} className={inputClassName} />
                   {errors.packageWeight && <span className="text-[10px] text-red-500 mt-1 block">{errors.packageWeight.message}</span>}
               </div>
               
               <div className="relative">
                   <label className={labelClassName}>Unit {requiredAsterisk}</label>
                   <select {...register("weightUnit")} className={`appearance-none ${inputClassName} px-3 bg-white outline-none`}>
                      <option value="KG">KG</option>
                      <option value="LB">LBS</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-[32px] w-4 h-4 text-slate-400 pointer-events-none" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
               <div className="md:col-span-2">
                 <label className={labelClassName}>Package count {requiredAsterisk}</label>
                 <Input type="number" placeholder="1" {...register("packageCount", { required: "Required" })} className={inputClassName} />
                 {errors.packageCount && <span className="text-[10px] text-red-500 mt-1 block">{errors.packageCount.message}</span>}
               </div>
            </div>

            <div>
               <label className={labelClassName}>Request notes</label>
               <textarea 
                 rows={3} 
                 placeholder="Handling instructions or other useful details" 
                 {...register("requestNotes")} 
                 className={`w-full bg-[#fcfcfd] border border-slate-200/80 text-[#0f294d] rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-[#0f294d] focus:border-transparent placeholder:text-slate-400 text-[13px] font-medium resize-y`} 
               />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 pb-20 gap-6">
            <div className="flex items-center gap-2 text-slate-500 text-[12px] ml-1">
               <ShieldCheck className="w-4 h-4" />
               <span>Your information will be used to review and operate this courier request.</span>
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0f294d] hover:bg-[#0a1c36] text-white px-8 py-5 h-auto rounded-[8px] text-[13px] font-semibold transition-all flex items-center gap-2 w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit request"}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

        </form>
      </div>
    </main>
  );
}
