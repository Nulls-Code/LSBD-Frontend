"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FEATURES } from "@/data/features";

export function WhyChooseUs() {
  return (
    <section id="about" className="w-full py-20 bg-[#f9f9ff]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Visual Illustration */}
        <div className="lg:col-span-5 relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-sm">
          <Image
            src="/airplane_in_sky.png"
            alt="Airplane in sky"
            fill
            className="object-cover"
          />
        </div>

        {/* Right Content List */}
        <div className="lg:col-span-7 space-y-8 lg:pl-4">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-[44px] leading-[1.15] font-black text-[#08254a] tracking-tight">
              Why Choose <br className="hidden sm:block" />
              Logistic Star BD?
            </h2>
            <p className="text-[#59606b] text-base sm:text-lg">
              A consistent process for every shipment, wherever in the world it starts or ends.
            </p>
          </div>

          <div className="space-y-5">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-3.5"
              >
                <div className="shrink-0 mt-0.5">
                  <svg className="size-[22px] text-[#009b4d]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-[#1a2b49] text-[15px] sm:text-base leading-relaxed font-medium">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
