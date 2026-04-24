"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

function OperationsCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const statuses = ["NOMINAL", "NOMINAL", "SYNCING", "NOMINAL"];
  const status = statuses[tick % statuses.length];
  const isSyncing = status === "SYNCING";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group relative rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-7 transition-colors duration-300 hover:border-white/12"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-medium tracking-tight text-white/80">Unified Operations</h3>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isSyncing ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isSyncing ? "bg-[#00C2FF]" : "bg-emerald-400"}`}
            />
          </span>
          <motion.span
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`font-mono text-[10px] tracking-widest ${isSyncing ? "text-[#00C2FF]/70" : "text-emerald-400/60"}`}
          >
            {status}
          </motion.span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/38">
        One command surface for yard, route, and fleet - with real-time state continuity across every node in the network.
      </p>

      <div className="mt-7 flex items-center gap-0">
        {["Gate", "Dock", "Bay 3", "ERP"].map((label, i, arr) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-white/20 ring-1 ring-white/10" />
              <span className="text-[9px] tracking-widest text-white/20">{label}</span>
            </div>
            {i < arr.length - 1 && <div className="mx-1.5 mb-3.5 h-px w-8 bg-linear-to-r from-white/15 to-white/5" />}
          </div>
        ))}
        <div className="mb-3.5 ml-1.5 h-px flex-1 overflow-hidden bg-white/5">
          <motion.div
            className="h-px bg-linear-to-r from-[#00C2FF] to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

const BAR_COUNT = 12;
const INITIAL_BARS = [0.34, 0.61, 0.33, 0.66, 0.92, 0.97, 0.68, 0.42, 0.6, 0.5, 0.56, 0.48];
function IntelligenceCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [bars, setBars] = useState(INITIAL_BARS);

  useEffect(() => {
    const id = setInterval(() => {
      setBars((prev) =>
        prev.map((b) => {
          const next = b + (Math.random() - 0.5) * 0.3;
          return Math.max(0.1, Math.min(1, next));
        }),
      );
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group relative rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-7 transition-colors duration-300 hover:border-white/12"
    >
      <h3 className="text-base font-medium tracking-tight text-white/80">Predictive Intelligence</h3>

      <div className="mt-5 flex h-10 items-end gap-[3px]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            animate={{ height: `${h * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              background:
                h > 0.75
                  ? "rgba(0,194,255,0.7)"
                  : h > 0.45
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.07)",
            }}
          />
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[9px] tracking-widest text-white/20">LIVE - DELAY RISK INDEX</p>

      <p className="mt-5 text-sm leading-relaxed text-white/38">
        Surfaces delay risk, congestion hotspots, and route efficiency opportunities before they cost you - not after.
      </p>
    </motion.div>
  );
}

const TRUST_MARKS = [
  { label: "SOC 2 Type II", sub: "Audited annually" },
  { label: "ISO 27001", sub: "Certified" },
  { label: "99.9% SLA", sub: "Contractual uptime" },
];

function EnterpriseCard({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group relative rounded-2xl border border-white/[0.07] bg-[#0C0C0F] p-7 transition-colors duration-300 hover:border-white/12"
    >
      <h3 className="text-base font-medium tracking-tight text-white/80">Enterprise Deployment</h3>

      <p className="mt-4 text-sm leading-relaxed text-white/38">
        Secure cloud architecture with auditable workflows and infrastructure that scales from a single depot to a national
        fleet.
      </p>

      <div className="mt-6 space-y-2.5">
        {TRUST_MARKS.map(({ label, sub }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/55">{label}</span>
            <span className="font-mono text-[10px] text-white/22">{sub}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 h-px bg-white/5" />
    </motion.div>
  );
}

export { OperationsCard, IntelligenceCard, EnterpriseCard };
