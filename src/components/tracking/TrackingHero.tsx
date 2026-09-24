import { useState, useEffect } from "react";
import { Package, ArrowRight, Loader2 } from "lucide-react";

interface TrackingHeroProps {
  onTrack: (trackingNumber: string) => void;
  isLoading: boolean;
  initialTrackingNumber?: string;
}

export function TrackingHero({ onTrack, isLoading, initialTrackingNumber = "" }: TrackingHeroProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialTrackingNumber) {
      setTrackingNumber(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const trimmed = trackingNumber.trim().toUpperCase();
    if (!trimmed) return;

    const regex = /^(LSBD-\d{6}-\d{5,}|LSBD\d{6,})$/i;
    if (!regex.test(trimmed)) {
      setError("Invalid format. Example: LSBD-202609-00001");
      return;
    }

    onTrack(trimmed);
  };

  return (
    <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-[#08254a] mb-4">
        Global Shipment Tracking
      </h1>
      <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
        Enter your Air Waybill (AWB) or Reference Number for real-time visibility into your cargo&apos;s journey.
      </p>

      <form 
        onSubmit={handleSubmit}
        className={`bg-white rounded-lg p-2 shadow-sm border flex items-center max-w-3xl mx-auto transition-all ${
          error 
            ? "border-red-400 focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent" 
            : "border-gray-100 focus-within:ring-2 focus-within:ring-[#079447] focus-within:border-transparent"
        }`}
      >
        <div className="pl-4 pr-2 text-gray-400">
          <Package size={20} />
        </div>
        <input
          type="text"
          placeholder="Enter Tracking Number (e.g. LSBD-202609-00001)"
          className="flex-1 py-3 px-2 outline-none text-gray-800 placeholder:text-gray-400 bg-transparent w-full"
          value={trackingNumber}
          onChange={(e) => {
            setTrackingNumber(e.target.value);
            if (error) setError("");
          }}
          disabled={isLoading}
        />
        <button 
          type="submit"
          disabled={isLoading || !trackingNumber.trim()}
          className="bg-[#079447] hover:bg-[#06833f] disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              Tracking <Loader2 size={18} className="animate-spin" />
            </>
          ) : (
            <>
              Track Now <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm mt-3 font-medium max-w-3xl mx-auto text-left pl-4">
          {error}
        </p>
      )}
    </div>
  );
}
