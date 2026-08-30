"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";
import { SHIPMENT_TYPE_OPTIONS } from "@/lib/constants";
import type { RequestFormData } from "@/lib/types";

export function RequestShipmentForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    defaultValues: {
      shipmentType: "Commercial cargo",
    },
  });

  const onSubmit = async (_data: RequestFormData) => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
  };

  return (
    <section id="request-quote" className="w-full py-20 bg-[#f9f9ff]">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Copy */}
          <div className="lg:col-span-5 space-y-4">

            <h2 className="text-3xl sm:text-5xl font-black text-[#08254a] tracking-tight leading-tight">
              Ready to send or receive something by air?
            </h2>

            <p className="text-[#59606b] text-base leading-relaxed">
              Tell us the origin, destination and weight, we&apos;ll come back with a rate and a realistic transit time.
            </p>

            <div className="p-6 rounded-2xl bg-[#08254a] text-white space-y-2 mt-6">
              <div className="text-sm font-bold">Need Immediate Freight Assistance?</div>
              <div className="text-xs text-slate-300">
                Call our express helpline: <strong className="text-white">+880 9612-LSBD-00</strong>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-xs font-bold text-[#08254a]">Full name</label>
                  <Input
                    id="fullName"
                    placeholder="Your name"
                    {...register("fullName", { required: "Full name is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    aria-invalid={errors.fullName ? "true" : undefined}
                  />
                  {errors.fullName && <p id="fullName-error" className="text-xs text-rose-500" role="alert">{errors.fullName.message}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-[#08254a]">Phone</label>
                  <Input
                    id="phone"
                    placeholder="+880 ..."
                    {...register("phone", { required: "Phone is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    aria-invalid={errors.phone ? "true" : undefined}
                  />
                  {errors.phone && <p id="phone-error" className="text-xs text-rose-500" role="alert">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-[#08254a]">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    {...register("email", { required: "Email is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={errors.email ? "true" : undefined}
                  />
                  {errors.email && <p id="email-error" className="text-xs text-rose-500" role="alert">{errors.email.message}</p>}
                </div>

                {/* Approx weight */}
                <div className="space-y-1.5">
                  <label htmlFor="weight" className="text-xs font-bold text-[#08254a]">Approx. weight (kg)</label>
                  <Input
                    id="weight"
                    placeholder="e.g. 45"
                    {...register("weight", { required: "Weight is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                    aria-describedby={errors.weight ? "weight-error" : undefined}
                    aria-invalid={errors.weight ? "true" : undefined}
                  />
                  {errors.weight && <p id="weight-error" className="text-xs text-rose-500" role="alert">{errors.weight.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin */}
                <div className="space-y-1.5">
                  <label htmlFor="origin" className="text-xs font-bold text-[#08254a]">Origin (city, country)</label>
                  <Input
                    id="origin"
                    placeholder="Pickup location"
                    {...register("origin", { required: "Origin is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                  />
                </div>

                {/* Destination */}
                <div className="space-y-1.5">
                  <label htmlFor="destination" className="text-xs font-bold text-[#08254a]">Destination (city, country)</label>
                  <Input
                    id="destination"
                    placeholder="Delivery location"
                    {...register("destination", { required: "Destination is required" })}
                    className="bg-[#f9fafb] border-slate-200 text-[#08254a]"
                  />
                </div>
              </div>

              {/* Shipment Type */}
              <div className="space-y-1.5">
                <label htmlFor="shipmentType" className="text-xs font-bold text-[#08254a]">Shipment type</label>
                <select
                  id="shipmentType"
                  {...register("shipmentType")}
                  className="w-full bg-[#f9fafb] border border-slate-200 text-[#08254a] text-sm rounded-xl p-2.5 outline-none"
                >
                  {SHIPMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold text-[#08254a]">Message</label>
                <textarea
                  id="message"
                  rows={3}
                  placeholder="Anything else we should know about the shipment?"
                  {...register("message")}
                  className="w-full bg-[#f9fafb] border border-slate-200 text-[#08254a] text-sm rounded-xl p-3 outline-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#079447] hover:bg-[#067a3a] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#079447]/20 flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
                <Send className="size-4" />
              </Button>
            </form>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-emerald-50 border border-[#079447]/30 text-[#08254a] space-y-2"
                  role="status"
                >
                  <div className="flex items-center gap-2 text-[#079447] font-bold text-sm">
                    <CheckCircle2 className="size-5" />
                    <span>Quote Request Received!</span>
                  </div>
                  <p className="text-xs text-[#59606b]">
                    Our air freight coordinator will review your route and weight specifications and reply with a rate within 2 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      reset();
                    }}
                    className="text-xs border-slate-300"
                  >
                    Send Another Request
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
