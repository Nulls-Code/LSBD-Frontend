"use client";

import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { PROCESS_STEPS } from "@/data/process-steps";

export function DeliveryProcess() {
  return (
    <section className="w-full py-16 md:py-20 bg-[#e3eaf8] overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-12">

        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#08254a] tracking-tight leading-tight"
          >
            From your door to theirs, &amp; <br />theirs to yours
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[15px] sm:text-base md:text-[18px] text-[#59606b] max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed"
          >
            A consistent process for every shipment, wherever in the world it starts or ends.
          </motion.p>
        </div>

        {/* Desktop Timeline Section (Large screens) */}
        <div className="hidden lg:block relative w-full pb-10 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="min-w-[1100px] relative pt-4">

            {/* The Track Line & Plane */}
            <div className="absolute top-12 left-0 w-full h-3.5 bg-transparent rounded-full">

              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 3, ease: "easeInOut" }}
                className="absolute top-0 left-0 h-full bg-[#133775] rounded-full z-0"
              >
                {/* Thin inner white line */}
                <div className="absolute top-1.5 left-0 w-full h-px bg-white/40" />

                {/* Animated Plane attached to the leading edge of the track line */}
                <motion.div
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 3, duration: 0.4 }}
                  className="absolute -top-3 -right-[20px] z-50 pointer-events-none"
                >
                  <div className="relative">
                    <Plane className="w-10 h-10 text-white fill-white rotate-45 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    {/* Trail effect */}
                    <div className="absolute top-1/2 -left-16 w-16 h-[2px] bg-gradient-to-r from-transparent to-white -translate-y-1/2" />
                  </div>
                </motion.div>
              </motion.div>

            </div>

            {/* Steps Container */}
            <div className="relative flex justify-between items-start gap-4 px-4 w-full z-10">
              {PROCESS_STEPS.map((st, i) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.4 }}
                  className="flex flex-col w-35 shrink-0 group"
                >
                  {/* Marker */}
                  <div className="relative h-27.5 flex justify-center mb-2">
                    <div className="absolute top-0 w-11.25 h-18.75 bg-[#08254a] rounded-t-full rounded-b-full border-4 border-[#e3eaf8] shadow-md flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                      <span className="text-white font-bold text-lg">{st.id}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <b className="block font-extrabold text-[16px] md:text-[18px] leading-tight text-[#08254a] mb-3 min-h-11">
                      {st.title}
                    </b>
                    <p className="text-[13px] md:text-[14px] leading-relaxed font-semibold text-[#575f6c]">
                      {st.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

        {/* Mobile & Tablet Timeline Section */}
        <div className="block lg:hidden w-full max-w-lg mx-auto">
          <div className="relative">
            {/* Continuous vertical connecting line running behind the badges */}
            <div className="absolute top-0 bottom-0 left-[21px] w-[2px] bg-white -translate-x-1/2" />

            {/* Steps list */}
            <div className="space-y-3.5 sm:space-y-4">
              {PROCESS_STEPS.map((st, i) => (
                <motion.div
                  key={st.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="relative flex items-center gap-3.5 sm:gap-4 group"
                >
                  {/* Circular Badge */}
                  <div className="relative z-10 w-[42px] h-[42px] rounded-full bg-[#08254a] flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-[15px] tracking-tight">
                      {st.id}
                    </span>
                  </div>

                  {/* Step Card */}
                  <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(8,37,74,0.03)] border border-white/80 transition-shadow duration-300 group-hover:shadow-md">
                    <h3 className="font-bold text-[16px] sm:text-[17px] text-[#08254a] mb-1 leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-[13px] sm:text-[14px] text-[#556070] leading-relaxed font-normal">
                      {st.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
