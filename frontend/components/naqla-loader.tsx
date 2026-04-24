"use client";

import { motion } from "framer-motion";

const CHARS = "NAQLAAI".split("");

type NaqlaLoaderProps = {
  loaderCount: number;
};

export function NaqlaLoader({ loaderCount }: NaqlaLoaderProps) {
  return (
    <motion.div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-[#050505]"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{
        clipPath: "inset(0% 0% 100% 0%)",
        transition: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <svg width="900" height="900" viewBox="0 0 900 900" fill="none" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx="450" cy="450" r={i * 80} stroke="#00C2FF" strokeWidth="0.6" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <line
                key={i}
                x1="450"
                y1="450"
                x2={450 + Math.cos(angle) * 400}
                y2={450 + Math.sin(angle) * 400}
                stroke="#00C2FF"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      >
        <div
          className="absolute"
          style={{
            width: 2,
            height: 400,
            top: "50%",
            left: "50%",
            transformOrigin: "top center",
            background: "linear-gradient(to bottom, rgba(0,194,255,0.4), transparent)",
          }}
        />
      </motion.div>

      <div className="absolute top-8 right-10 font-mono text-xs tracking-[0.22em] text-white/30">
        {String(loaderCount).padStart(3, "0")}
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mb-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00C2FF]/40 bg-white/5">
            <span className="text-sm font-bold text-[#00C2FF]">N</span>
          </div>
        </motion.div>

        <div className="flex items-end gap-[2px]" aria-label="NaqlaAI">
          {CHARS.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3 + i * 0.055,
              }}
              className="font-semibold tracking-[0.14em] text-white/90"
              style={{
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                fontFamily: "'Geist', 'SF Pro Display', system-ui, sans-serif",
                letterSpacing: "0.14em",
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.45, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="text-sm tracking-widest text-white/45"
          dir="rtl"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          ذكاء اللوجستيات
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 w-64 sm:w-80"
        >
          <div className="relative h-px w-full overflow-hidden bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#00C2FF]"
              animate={{ width: `${Math.max(2, loaderCount)}%` }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-y-0 w-16 bg-linear-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-100%", "450%"] }}
              transition={{ duration: 1.4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2 }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="font-mono text-[10px] tracking-[0.22em] text-white/25 uppercase">Initializing</span>
            <span className="font-mono text-[10px] tracking-[0.18em] text-white/25">{loaderCount}%</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 text-[10px] tracking-[0.3em] text-white/30 uppercase"
      >
        Logistics Intelligence - Saudi Arabia
      </motion.div>
    </motion.div>
  );
}
