import { Plane, Check } from "lucide-react";
import type { TrackingData } from "@/types/tracking";

interface TrackingStatusCardProps {
  trackingData: TrackingData | null;
}

const getSteps = (currentStatus: string) => {
  const baseSteps = [
    { id: "PENDING", label: "Pending" },
    { id: "PROCESSING", label: "Processed" },
    { id: "IN_TRANSIT", label: "In Transit" },
    { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { id: "DELIVERED", label: "Delivered" },
  ];

  // Map backend status to our steps if needed, for now we assume they match reasonably
  const normalizedStatus = currentStatus.toUpperCase().replace(/\s+/g, '_');
  
  let currentIdx = baseSteps.findIndex(s => s.id === normalizedStatus);
  if (currentIdx === -1) {
    if (normalizedStatus.includes("DELIVERED")) currentIdx = 4;
    else if (normalizedStatus.includes("OUT_FOR")) currentIdx = 3;
    else if (
      normalizedStatus.includes("TRANSIT") || 
      normalizedStatus.includes("ARRIVED") || 
      normalizedStatus.includes("HUB") ||
      normalizedStatus.includes("DEPARTED") ||
      normalizedStatus.includes("CUSTOMS")
    ) {
      currentIdx = 2; // Map various transit sub-statuses to 'In Transit'
    }
    else if (normalizedStatus.includes("PROCESS") || normalizedStatus.includes("REGISTERED")) currentIdx = 1;
    else currentIdx = 0;
  }

  return baseSteps.map((step, index) => {
    let status = "pending";
    if (index < currentIdx) status = "completed";
    else if (index === currentIdx) status = "current";
    return { ...step, status };
  });
};

export function TrackingStatusCard({ trackingData }: TrackingStatusCardProps) {
  if (!trackingData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Plane className="w-12 h-12 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-400">No Tracking Data</h2>
        <p className="text-gray-500 text-sm mt-2 text-center max-w-sm">
          Please enter your tracking number above to see the real-time status of your shipment.
        </p>
      </div>
    );
  }

  const steps = getSteps(trackingData.currentStatus);
  const currentStepIndex = steps.findIndex(s => s.status === "current" || s.status === "completed") === -1 
    ? 0 
    : steps.findLastIndex(s => s.status === "completed" || s.status === "current");
  
  const progressPercentage = Math.max(0, (currentStepIndex / (steps.length - 1)) * 100);

  const formattedDelivery = trackingData.estimatedDeliveryDate 
    ? new Date(trackingData.estimatedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Not Available";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
      {/* Top right decoration */}
      <div className="absolute top-0 right-0 bg-[#eef8f2] rounded-bl-[60px] px-8 pt-6 pb-8 text-right">
        <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-1">
          Estimated Delivery
        </p>
        <p className="text-xl font-bold text-[#08254a]">{formattedDelivery}</p>
      </div>

      <div className="mb-10 mt-14 sm:mt-0">
        <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
          Status
        </p>
        <div className="flex items-center gap-3 text-[#079447]">
          <Plane className="w-8 h-8" />
          <h2 className="text-3xl font-bold capitalize">{trackingData.currentStatus.toLowerCase().replace(/_/g, ' ')}</h2>
        </div>
      </div>

      <div className="relative mt-12 mb-4 px-4 sm:px-8">
        {/* Progress Line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200">
          <div 
            className="absolute top-0 left-0 h-full bg-[#079447] transition-all duration-1000 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 bg-white border-2 transition-colors duration-500
                  ${
                    step.status === "completed"
                      ? "border-[#079447] bg-[#079447]"
                      : step.status === "current"
                      ? "border-[#079447]"
                      : "border-gray-200"
                  }
                `}
              >
                {step.status === "completed" && (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                )}
                {step.status === "current" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#079447] animate-pulse"></div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center hidden sm:block">
                <p
                  className={`text-sm font-bold ${
                    step.status === "current" ? "text-[#079447]" : "text-gray-700"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
