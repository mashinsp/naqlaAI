"use client";

import { useEffect, useRef } from "react";

export function NavCursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = glowRef.current?.parentElement;
    if (!nav) return;

    const onMove = (e: MouseEvent) => {
      const rect = nav.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowRef.current?.style.setProperty("--gx", `${x}px`);
      glowRef.current?.style.setProperty("--gy", `${y}px`);
    };

    nav.addEventListener("mousemove", onMove);
    return () => nav.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        background: "radial-gradient(120px circle at var(--gx, 50%) var(--gy, 50%), rgba(0,194,255,0.12), transparent 80%)",
      }}
    />
  );
}
