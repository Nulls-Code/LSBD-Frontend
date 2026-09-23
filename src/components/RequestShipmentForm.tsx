"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Link from "next/link";

export function RequestShipmentForm() {
  return (
    <section id="request-quote" className="w-full py-20 bg-[#f9f9ff]">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Copy */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-[#08254a] tracking-tight leading-tight">
              Ready to send or receive something by air?
            </h2>
            <p className="text-[#59606b] text-base leading-relaxed max-w-lg">
              Tell us the origin, destination and weight, we&apos;ll come back with a rate and a realistic transit time. Click the button below to fill out our detailed quote request form.
            </p>
            <div className="p-6 rounded-2xl bg-[#08254a] text-white space-y-2 mt-6 max-w-md">
              <div className="text-sm font-bold">Need Immediate Freight Assistance?</div>
              <div className="text-xs text-slate-300">
                Call our express helpline: <strong className="text-white">+880 9612-LSBD-00</strong>
              </div>
            </div>
          </div>

          {/* Right CTA */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center justify-center space-y-6 text-center h-full min-h-[300px]">
            <h3 className="text-2xl font-bold text-[#08254a]">
              Request a Quote
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Provide us with detailed information about your shipment to get the most accurate rate possible.
            </p>
            <Link href="/request-quote" className="w-full max-w-xs">
              <Button
                className="w-full bg-[#079447] hover:bg-[#067a3a] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#079447]/20 flex items-center justify-center gap-2 text-base"
              >
                Go to Quote Form
                <Send className="size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
