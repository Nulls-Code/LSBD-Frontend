import { Headset } from "lucide-react";

export function TrackingAssistanceCard() {
  return (
    <div className="bg-[#1a365d] rounded-xl shadow-sm p-6 sm:p-8 text-white">
      <h3 className="text-2xl font-bold mb-4">Need Assistance?</h3>
      <p className="text-blue-100 mb-8 leading-relaxed">
        Our global support team is available 24/7 to help with your shipment
        inquiries.
      </p>

      <button className="w-full sm:w-auto border border-white hover:bg-white hover:text-[#1a365d] transition-colors py-3 px-6 rounded-md font-bold text-sm tracking-wide flex items-center justify-center gap-3 uppercase">
        <Headset size={18} />
        Contact Support
      </button>
    </div>
  );
}
