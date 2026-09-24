"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TrackingHero } from "@/components/tracking/TrackingHero";
import { TrackingStatusCard } from "@/components/tracking/TrackingStatusCard";
import { TrackingHistoryCard } from "@/components/tracking/TrackingHistoryCard";
import { ShipmentDetailsCard } from "@/components/tracking/ShipmentDetailsCard";
import { TrackingAssistanceCard } from "@/components/tracking/TrackingAssistanceCard";
import type { TrackingData } from "@/types/tracking";

// Fallback demo data from Backend Specification Section 7.6.1 for offline/unseeded environments
const DEMO_TRACKING: Record<string, TrackingData> = {
  "LSBD-202609-00001": {
    trackingNumber: "LSBD-202609-00001",
    currentStatus: "ARRIVED_AT_HUB",
    origin: { city: "Dhaka", country: "Bangladesh" },
    destination: { city: "New York", country: "United States" },
    currentLocation: { city: "Dubai", country: "United Arab Emirates" },
    estimatedDeliveryDate: "2026-09-22T00:00:00.000Z",
    lastUpdated: "2026-09-17T08:31:00.000Z",
    history: [
      {
        timestamp: "2026-09-17T08:30:00.000Z",
        status: "ARRIVED_AT_HUB",
        description: "Arrived at Dubai Cargo Village Transit Hub. Undergoing sorting.",
        location: "Dubai, United Arab Emirates",
      },
      {
        timestamp: "2026-09-17T02:15:00.000Z",
        status: "IN_TRANSIT",
        description: "Departed Dhaka on flight EK583",
        location: "Dhaka, Bangladesh",
      },
      {
        timestamp: "2026-09-16T19:05:00.000Z",
        status: "PROCESSING",
        description: "Shipment registered and pending initial dispatch",
        location: "Dhaka, Bangladesh",
      },
    ],
  },
  "LSBD1234567": {
    trackingNumber: "LSBD1234567",
    currentStatus: "IN_TRANSIT",
    origin: { city: "Dhaka", country: "Bangladesh" },
    destination: { city: "London", country: "United Kingdom" },
    currentLocation: { city: "London Heathrow", country: "United Kingdom" },
    estimatedDeliveryDate: "2026-09-20T18:00:00.000Z",
    lastUpdated: "2026-09-18T10:15:00.000Z",
    history: [
      {
        timestamp: "2026-09-18T10:15:00.000Z",
        status: "IN_TRANSIT",
        description: "Air cargo flight departed en route to destination",
        location: "London, United Kingdom",
      },
      {
        timestamp: "2026-09-17T16:30:00.000Z",
        status: "PROCESSING",
        description: "Export customs cleared at Hazrat Shahjalal International Airport",
        location: "Dhaka, Bangladesh",
      },
      {
        timestamp: "2026-09-16T11:00:00.000Z",
        status: "PROCESSING",
        description: "Shipment registered and booking confirmed at Dhaka Hub",
        location: "Dhaka, Bangladesh",
      },
    ],
  },
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("trackingNumber") || searchParams.get("number") || searchParams.get("id") || "";

  const [activeNumber, setActiveNumber] = useState(queryParam);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (trackingNumber: string) => {
    const cleanNum = trackingNumber.trim().toUpperCase();
    if (!cleanNum) return;

    setActiveNumber(cleanNum);
    setIsLoading(true);
    setError(null);

    // Keep URL updated for bookmarking and sharing
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("trackingNumber", cleanNum);
      window.history.replaceState(null, "", url.toString());
    }

    try {
      const response = await fetch(`/api/v1/tracking/${encodeURIComponent(cleanNum)}`);
      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setTrackingData(result.data);
      } else {
        // Fallback for mock demo numbers if unseeded in database
        if (DEMO_TRACKING[cleanNum]) {
          setTrackingData(DEMO_TRACKING[cleanNum]);
        } else {
          setError(result.error?.message || `No shipment found for tracking number "${cleanNum}". Please verify and try again.`);
          setTrackingData(null);
        }
      }
    } catch (err) {
      console.error(err);
      if (DEMO_TRACKING[cleanNum]) {
        setTrackingData(DEMO_TRACKING[cleanNum]);
      } else {
        setError("Network error. Could not reach the server.");
        setTrackingData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      handleTrack(queryParam);
    }
  }, [queryParam]);

  return (
    <div className="min-h-screen bg-[#f0f6fc] text-[#08254a] flex flex-col font-sans selection:bg-[#079447] selection:text-white">
      {/* Upper Navigation Bar */}
      <Navbar />

      <main className="flex-1 pb-20">
        {/* Top Hero Section */}
        <TrackingHero 
          onTrack={handleTrack} 
          isLoading={isLoading} 
          initialTrackingNumber={activeNumber}
        />

        {/* Tracking Details Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 shadow-sm flex items-center justify-between">
              <span>{error}</span>
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

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f0f6fc] flex items-center justify-center text-sm font-semibold text-slate-500">
          Loading shipment tracking...
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
