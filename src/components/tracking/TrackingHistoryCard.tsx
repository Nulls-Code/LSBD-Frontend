import { History } from "lucide-react";
import type { TrackingData } from "@/types/tracking";

interface TrackingHistoryCardProps {
  trackingData: TrackingData | null;
}

export function TrackingHistoryCard({ trackingData }: TrackingHistoryCardProps) {
  if (!trackingData || !trackingData.history || trackingData.history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-6 h-6 text-[#08254a]" />
          <h3 className="text-xl font-bold text-[#08254a]">Tracking History</h3>
        </div>
        <p className="text-gray-500 text-sm">No history events available.</p>
      </div>
    );
  }

  // Assuming the backend returns history in descending order (newest first).
  // If we want newest at top visually, that's already handled by rendering the array as-is.
  const historyEvents = trackingData.history;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-6 h-6 text-[#08254a]" />
        <h3 className="text-xl font-bold text-[#08254a]">Tracking History</h3>
      </div>

      <div className="relative">
        {historyEvents.map((event, index) => {
          const isLast = index === historyEvents.length - 1;
          // We can consider the first item (newest) as 'completed' in terms of UI dots, or all of them.
          // Since it's history, all these events happened, so we can style them all as completed or just the first few.
          const isCompleted = true; 
          
          const eventDate = new Date(event.timestamp);
          const formattedDate = eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const formattedTime = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

          return (
            <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
              {/* Timeline Graphic Column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white z-10
                    ${isCompleted ? "border-[#079447]" : "border-gray-300"}
                  `}
                >
                  {isCompleted && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#079447]"></div>
                  )}
                </div>

                {/* Line to next item */}
                {!isLast && (
                  <div
                    className={`w-0.5 h-full absolute top-4 bg-[#079447]`}
                  ></div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 flex flex-col sm:flex-row sm:justify-between items-start gap-2 -mt-1">
                <div>
                  <h4 className="text-[15px] font-bold text-[#08254a] capitalize">
                    {event.status.toLowerCase().replace(/_/g, ' ')}
                  </h4>
                  <p className="text-sm text-gray-700 mt-0.5">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">{event.location || "System"}</p>
                </div>
                <div className="bg-[#f0f6fc] text-gray-500 text-xs px-3 py-1.5 rounded-md font-medium whitespace-nowrap">
                  {formattedDate} - {formattedTime}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
