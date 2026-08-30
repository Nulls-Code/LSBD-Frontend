import type { TrackingStatus } from "@/lib/types";

export const MOCK_SHIPMENTS: Record<string, TrackingStatus> = {
  LSBD1234567: {
    id: "LSBD1234567",
    sender: "Dhaka Commercial Hub",
    recipient: "London International Cargo Terminal",
    origin: "Dhaka (DAC)",
    destination: "London Heathrow (LHR)",
    status: "Air Transit in Progress",
    estimatedDelivery: "Tomorrow, 04:00 PM",
    steps: [
      { title: "Booking & Rate Confirmed", location: "Dhaka Hub", timestamp: "Yesterday 10:00 AM", completed: true },
      { title: "Pickup & Inspection", location: "Tejgaon Cargo Center", timestamp: "Yesterday 04:30 PM", completed: true },
      { title: "Export Customs Cleared", location: "Hazrat Shahjalal Int'l Airport", timestamp: "Today 02:15 AM", completed: true },
      { title: "Air Cargo Flight Departed", location: "Flight BG-201 (En Route)", timestamp: "Today 08:30 AM", completed: true, current: true },
      { title: "Import Customs Clearance", location: "London LHR Terminal", timestamp: "Expected 02:00 PM", completed: false },
      { title: "Final Doorstep Delivery", location: "Recipient Destination", timestamp: "Expected 04:00 PM", completed: false },
    ],
  },
};

/**
 * Creates a fallback tracking status for shipment IDs not found in MOCK_SHIPMENTS.
 * Used to demonstrate the tracking UI for any arbitrary tracking number.
 */
export function createFallbackShipment(cleanId: string): TrackingStatus {
  return {
    id: cleanId,
    sender: "Origin Air Facility",
    recipient: "Destination Address",
    origin: "Dhaka (DAC)",
    destination: "International Airport",
    status: "Shipment Processing",
    estimatedDelivery: "In 2 Business Days",
    steps: [
      { title: "Shipment Registered", location: "LSBD Central Air Hub", timestamp: "Today 09:00 AM", completed: true, current: true },
      { title: "Customs Documentation Filed", location: "Export Clearance Center", timestamp: "Processing", completed: false },
      { title: "Air Flight Dispatch", location: "Cargo Runway", timestamp: "Pending", completed: false },
      { title: "Destination Arrival & Clearance", location: "Customs Terminal", timestamp: "Pending", completed: false },
      { title: "Final Doorstep Delivery", location: "Recipient Address", timestamp: "Pending", completed: false },
    ],
  };
}
