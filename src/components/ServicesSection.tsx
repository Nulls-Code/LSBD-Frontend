"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/data/services";

export function ServicesSection() {
  return (
    <section id="services" className="w-full py-20 bg-[#f9f9ff] max-w-7xl mx-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-[#08254a] tracking-tight">
            Our Air-powered Global Logistics Services
          </h2>

          <p className="text-[#59606b] text-base sm:text-lg leading-relaxed">
            Every shipment we handle travels by plane. Around that core we take care of the paperwork, storage and road legs at both ends.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((srv, i) => (
            <motion.div
              key={srv.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-[20px] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all group flex flex-col overflow-hidden"
            >
              {/* Image Section */}
              <div className="relative h-[220px] w-full overflow-hidden bg-slate-100">
                <Image
                  src={srv.image}
                  alt={srv.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-[20px] font-medium text-[#1e2a45] mb-3">
                  {srv.title}
                </h3>

                <p className="text-[#64748b] text-[15px] leading-relaxed mb-6 flex-grow">
                  {srv.desc}
                </p>

                <div className="flex items-center text-[#375a97] font-semibold text-[15px] group-hover:text-[#253f6e] transition-colors cursor-pointer w-fit">
                  Learn More
                  <ArrowRight className="size-4 ml-1.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
