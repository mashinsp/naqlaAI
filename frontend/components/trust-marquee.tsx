"use client";

import { motion } from "framer-motion";

const ITEMS = [
  "NEOM Logistics",
  "Vision 2030",
  "Saudi Aramco Supply Chain",
  "SABIC Distribution",
  "Red Sea Gateway Terminal",
  "Riyadh Dry Port",
  "GCC Fleet Management",
  "Saudi Post",
];

export function TrustMarquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden border-y border-white/6 bg-[#050505] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#050505] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#050505] to-transparent" />

      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      >
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-white/25">
            <span className="h-1 w-1 rounded-full bg-[#00C2FF]/60" />
            {item.toUpperCase()}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
