"use client";

import { useEffect, useRef } from "react";

export function SpectraBg({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = Math.floor(canvas.offsetWidth);
      const h = Math.floor(canvas.offsetHeight);
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const t = frame * 0.008;

      ctx.clearRect(0, 0, w, h);

      const g1 = ctx.createRadialGradient(
        w * (0.3 + Math.sin(t * 0.7) * 0.15),
        h * (0.4 + Math.cos(t * 0.5) * 0.1),
        0,
        w * 0.5,
        h * 0.5,
        w * 0.8,
      );
      g1.addColorStop(0, "rgba(0,194,255,0.12)");
      g1.addColorStop(0.4, "rgba(0,194,255,0.06)");
      g1.addColorStop(1, "rgba(5,5,12,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 22;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);

      ctx.strokeStyle = "rgba(255,255,255,0.018)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full ${className ?? ""}`} />;
}
