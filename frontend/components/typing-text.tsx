"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const PHRASES = [
  "supply chain intelligence.",
  "yard-to-dock visibility.",
  "NEOM-grade logistics.",
  "predictive dwell alerts.",
  "fleet-wide ETA accuracy.",
];

export function TypingText() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const current = PHRASES[phraseIdx];
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 42);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 22);
    } else if (deleting && displayed.length === 0) {
      timeout = setTimeout(() => {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
      }, 0);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isInView, displayed, deleting, phraseIdx]);

  return (
    <div ref={ref} className="flex items-baseline gap-0">
      <span className="text-white/85">{displayed}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        className="ml-0.5 inline-block h-[1em] w-[2px] bg-[#00C2FF] align-middle"
      />
    </div>
  );
}
