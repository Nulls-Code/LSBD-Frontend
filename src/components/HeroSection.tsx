"use client";

import { motion } from "framer-motion";
import { HeroBG } from "@/components/HeroBG";
import { TrackingWidget } from "@/components/TrackingWidget";

export function HeroSection() {
  return (
    <section className="relative bg-[#08254a] text-white min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image & Gradient Component */}
      <HeroBG />

      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#079447]/10 rounded-full blur-3xl pointer-events-none z-1" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#355da5]/20 rounded-full blur-3xl pointer-events-none z-1" />

      <div className="w-full space-y-12 z-10 relative">
        {/* Main Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[1.1]">
            Delivering <span className="text-[#079447]">Beyond</span> Borders.
          </h1>

          <p className="text-slate-200 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Fast, Reliable &amp; Secure International Courier Solutions by Air
          </p>
        </motion.div>

        {/* Tracking Bar Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <TrackingWidget />
        </motion.div>
      </div>
    </section>
  );
}
