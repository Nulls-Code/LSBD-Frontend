"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { MOCK_SHIPMENTS, createFallbackShipment } from "@/data/mock-shipments";
import type { TrackingStatus, TrackingStep as TrackingStepType } from "@/lib/types";

// ──────────────────────────────────────────────
// Sub-component: Individual tracking timeline step
// ──────────────────────────────────────────────

function TrackingTimelineStep({ step }: { step: TrackingStepType }) {
  return (
    <div className="relative flex items-start gap-4">
      <div
        className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center border ${
          step.completed
            ? "bg-[#079447] border-[#079447] text-white"
            : "bg-slate-100 border-slate-300 text-slate-400"
        }`}
      >
        {step.completed ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <div className="size-1.5 rounded-full bg-slate-400" />
        )}
      </div>

      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="flex justify-between items-center">
          <span
            className={`text-sm font-bold ${
              step.current ? "text-[#079447]" : "text-[#08254a]"
            }`}
          >
            {step.title}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {step.timestamp}
          </span>
        </div>
        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
          <MapPin className="size-3 text-slate-400" /> {step.location}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function TrackingWidget() {
  const [trackingId, setTrackingId] = useState("");
  const [result, setResult] = useState<TrackingStatus | null>(null);

  const handleTrack = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();
    if (!cleanId) return;

    setResult(MOCK_SHIPMENTS[cleanId] ?? createFallbackShipment(cleanId));
  };

  const handleSampleClick = () => {
    setTrackingId("LSBD1234567");
    setResult(MOCK_SHIPMENTS["LSBD1234567"]);
  };

  return (
    <div id="tracking" className="w-full max-w-2xl mx-auto space-y-4">
      {/* Tracking Bar */}
      <div className="w-full max-w-[672px] mx-auto space-y-2">
        <form
          onSubmit={handleTrack}
          className="w-full bg-white rounded-lg p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 flex items-center justify-between font-sans overflow-hidden"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 size-5 text-[#7d838e] pointer-events-none" />
            <input
              type="text"
              placeholder="Enter Tracking Number (e.g. LSBD1234567)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-transparent text-[#08254a] placeholder:text-[#7d838e] placeholder:font-medium text-sm border-none outline-none font-sans"
              aria-label="Tracking number"
            />
          </div>

          <button
            type="submit"
            className="h-9 px-6 bg-[#079447] hover:bg-[#067a3a] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>Track Now</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-300 justify-center">
          <span className="font-semibold">Sample Tracking Number:</span>
          <button
            type="button"
            onClick={handleSampleClick}
            className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold hover:bg-white/20 transition-colors"
          >
            LSBD1234567
          </button>
        </div>
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#079447]/40 shadow-2xl space-y-6 text-[#08254a]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#079447]/10 text-[#079447]">
                  {result.id}
                </span>
                <h4 className="text-lg font-bold text-[#08254a] mt-2">
                  {result.origin} → {result.destination}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Status</span>
                <span className="text-sm font-bold text-[#079447]">{result.status}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Shipment History
              </h5>
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {result.steps.map((step) => (
                  <TrackingTimelineStep key={step.title} step={step} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
