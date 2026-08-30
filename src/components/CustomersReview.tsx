"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { REVIEWS } from "@/data/reviews";

export function CustomersReview() {
  return (
    <section className="w-full py-20 bg-[#e3eaf8]">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">

          <h2 className="text-3xl sm:text-4xl font-black text-[#08254a]">
            Customers Review
          </h2>
          <p className="text-[#59606b] text-base">Verified customer feedback.</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev, i) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="size-8 text-[#079447]" />
                  <div className="flex items-center gap-1 text-amber-400" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="size-4 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[#08254a] text-sm font-medium leading-relaxed italic">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#08254a] font-bold text-sm flex items-center justify-center">
                  {rev.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#08254a]">{rev.name}</div>
                  <div className="text-xs text-[#64748b]">{rev.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
