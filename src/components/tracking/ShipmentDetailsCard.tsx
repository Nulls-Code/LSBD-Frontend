import { Truck } from "lucide-react";
import type { TrackingData } from "@/types/tracking";

interface ShipmentDetailsCardProps {
  trackingData: TrackingData | null;
}

export function ShipmentDetailsCard({ trackingData }: ShipmentDetailsCardProps) {
  if (!trackingData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h3 className="text-xl font-bold text-[#08254a] mb-6">
          Shipment Details
        </h3>
        <p className="text-gray-500 text-sm">No details available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <h3 className="text-xl font-bold text-[#08254a] mb-6">
        Shipment Details
      </h3>

      <div className="flex flex-col gap-6">
        {/* Row 1 */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
            Waybill Number
          </p>
          <p className="text-[#08254a] font-bold text-lg">{trackingData.trackingNumber}</p>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
              Origin
            </p>
            <p className="text-[#08254a] font-bold">
              {trackingData.origin.city}, {trackingData.origin.country}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
              Destination
            </p>
            <p className="text-[#08254a] font-bold">
              {trackingData.destination.city}, {trackingData.destination.country}
            </p>
          </div>
        </div>

        {/* Row 3 */}
        <div>
          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2">
            Service Type
          </p>
          <div className="flex items-center gap-2 text-[#08254a] font-medium">
            <Truck className="w-5 h-5 text-[#079447]" />
            Standard (N/A)
          </div>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
              Weight
            </p>
            <p className="text-gray-800 font-medium">N/A</p>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-1">
              Pieces
            </p>
            <p className="text-gray-800 font-medium">N/A</p>
          </div>
        </div>
      </div>
    </div>
  );
}
