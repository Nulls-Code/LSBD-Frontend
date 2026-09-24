"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";

export function TrackingWidget() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = trackingId.trim().toUpperCase();
    if (!cleanId) return;

    setIsLoading(true);
    router.push(`/tracking?trackingNumber=${encodeURIComponent(cleanId)}`);
  };

  const handleSampleClick = (sampleId = "LSBD-202609-00001") => {
    setTrackingId(sampleId);
    setIsLoading(true);
    router.push(`/tracking?trackingNumber=${encodeURIComponent(sampleId)}`);
  };

  return (
    <div id="tracking" className="w-full max-w-2xl mx-auto space-y-4">
      {/* Tracking Bar */}
      <div className="w-full max-w-[672px] mx-auto space-y-2">
        <form
          onSubmit={handleTrack}
          className="w-full bg-white rounded-lg p-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/80 flex items-center justify-between font-sans overflow-hidden focus-within:ring-2 focus-within:ring-[#079447] focus-within:border-transparent transition-all"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 size-5 text-[#7d838e] pointer-events-none" />
            <input
              type="text"
              placeholder="Enter Tracking Number (e.g. LSBD-202609-00001)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-transparent text-[#08254a] placeholder:text-[#7d838e] placeholder:font-medium text-sm border-none outline-none font-sans"
              aria-label="Tracking number"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !trackingId.trim()}
            className="h-9 px-6 bg-[#079447] hover:bg-[#067a3a] disabled:opacity-70 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span>{isLoading ? "Tracking..." : "Track Now"}</span>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-300 justify-center">
          <span className="font-semibold">Sample Tracking Number:</span>
          <button
            type="button"
            onClick={() => handleSampleClick("LSBD-202609-00001")}
            className="px-2 py-0.5 rounded bg-white/10 text-white font-mono font-bold hover:bg-white/20 transition-colors cursor-pointer"
            title="Click to track sample package"
          >
            LSBD-202609-00001
          </button>
        </div>
      </div>
    </div>
  );
}
