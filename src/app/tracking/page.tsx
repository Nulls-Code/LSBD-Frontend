"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingHero } from "@/components/tracking/TrackingHero";
import { TrackingStatusCard } from "@/components/tracking/TrackingStatusCard";
import { TrackingHistoryCard } from "@/components/tracking/TrackingHistoryCard";
import { ShipmentDetailsCard } from "@/components/tracking/ShipmentDetailsCard";
import { TrackingAssistanceCard } from "@/components/tracking/TrackingAssistanceCard";
import type { TrackingData } from "@/types/tracking";

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (trackingNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/tracking/${trackingNumber}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setTrackingData(result.data);
      } else {
        setError(result.error?.message || "Failed to fetch tracking data. Please try again.");
        setTrackingData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Could not reach the server.");
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-[#08254a] flex flex-col font-sans selection:bg-[#079447] selection:text-white">
      {/* Upper Navigation Bar */}
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Top Hero Section */}
        <TrackingHero onTrack={handleTrack} isLoading={isLoading} />

        {/* Tracking Details Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] relative z-10">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 shadow-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Status & History) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <TrackingStatusCard trackingData={trackingData} />
              <TrackingHistoryCard trackingData={trackingData} />
            </div>

            {/* Right Column (Details & Assistance) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <ShipmentDetailsCard trackingData={trackingData} />
              <TrackingAssistanceCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
