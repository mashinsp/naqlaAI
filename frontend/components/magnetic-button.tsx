"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

type MagneticButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function MagneticButton({ children, onClick, className }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.35, y: y * 0.35 });
  };

  const onLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={
        className ??
        "cursor-pointer rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/85 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
      }
    >
      {children}
    </motion.button>
  );
}
