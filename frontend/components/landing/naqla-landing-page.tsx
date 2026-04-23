"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Button } from "@/components/ui/button";

type Beat = {
  align: "left" | "center" | "right";
  badge: string;
  title: string;
  body: string[];
};

const FRAME_COUNT = 192;
const BEATS: Beat[] = [
  {
    align: "center",
    badge: "NaqlaAI",
    title: "Every shipment, visible.",
    body: [
      "AI-native logistics tracking, built for the speed of Saudi Arabia's ambition.",
      "A cinematic command layer for modern supply chain operations.",
    ],
  },
  {
    align: "left",
    badge: "Into The Yard",
    title: "Total yard visibility. Zero blind spots.",
    body: [
      "NaqlaAI tracks every truck, every bay, every movement from gate to dock.",
      "Automated check-in, live slot intelligence, and ETA predictions in one platform.",
    ],
  },
  {
    align: "right",
    badge: "Blueprint Mode",
    title: "AI sees what humans miss.",
    body: [
      "Sensor fusion maps assets in real time with wireframe-level precision.",
      "Predictive dwell alerts prevent congestion before it starts.",
    ],
  },
  {
    align: "left",
    badge: "Kingdom Network",
    title: "Connected across the Kingdom.",
    body: [
      "From NEOM to Riyadh, Jeddah to Dammam, every node is synchronized.",
      "NaqlaAI turns national logistics movement into actionable intelligence.",
    ],
  },
  {
    align: "center",
    badge: "Data Core",
    title: "Data is the new infrastructure.",
    body: ["Every movement generates intelligence. Every insight accelerates the next shipment."],
  },
  {
    align: "center",
    badge: "Final Approach",
    title: "Move faster. See further. Lose nothing.",
    body: [
      "NaqlaAI. Intelligent logistics for the world's most ambitious supply chains.",
      "Trusted by logistics operators across Saudi Arabia and the GCC.",
    ],
  },
];

function isInRange(progress: number, start: number, end: number) {
  return progress >= start && progress <= end;
}

const NAV_ITEMS = [
  { href: "#overview", label: "Overview" },
  { href: "#platform", label: "Platform" },
  { href: "#ai-engine", label: "AI Engine" },
];

function framePath(index: number) {
  return `/video_frames/frame_${String(index).padStart(6, "0")}.jpg`;
}

type NaqlaLandingPageProps = {
  isAuthenticated?: boolean;
};

export function NaqlaLandingPage({ isAuthenticated = false }: NaqlaLandingPageProps) {
  const storyRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const fallbackImageRef = useRef<HTMLImageElement | null>(null);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const [hasSequence, setHasSequence] = useState(false);

  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = Math.max(0, Math.min(1, v));
    setProgress(progressRef.current);
    setNavSolid(progressRef.current > 0.025);
  });

  const currentBeatIndex = useMemo(() => {
    const clamped = Math.max(0, Math.min(0.9999, progress));
    return Math.floor(clamped * BEATS.length);
  }, [progress]);
  const activeBeat = currentBeatIndex >= 0 ? BEATS[currentBeatIndex] : BEATS[0];

  useEffect(() => {
    const fallback = new Image();
    fallback.src = "/logistics.jpg";
    fallbackImageRef.current = fallback;

    const probe = new Image();
    probe.onload = () => {
      const allFrames = Array.from({ length: FRAME_COUNT }, (_, i) => {
        const img = new Image();
        img.src = framePath(i + 1);
        return img;
      });
      imagesRef.current = allFrames;
      setHasSequence(true);
    };
    probe.onerror = () => {
      setHasSequence(false);
    };
    probe.src = framePath(1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawCoverImage = (image: HTMLImageElement) => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const iw = image.width || cw;
      const ih = image.height || ch;
      const scale = Math.max(cw / iw, ch / ih);
      const w = iw * scale;
      const h = ih * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      ctx.drawImage(image, x, y, w, h);
    };

    const drawOverlay = (p: number) => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      const amber = ctx.createRadialGradient(cw * 0.5, ch * 0.65, 0, cw * 0.5, ch * 0.65, ch * 0.7);
      amber.addColorStop(0, "rgba(232,160,32,0.22)");
      amber.addColorStop(1, "rgba(5,5,5,0)");
      ctx.fillStyle = amber;
      ctx.fillRect(0, 0, cw, ch);

      const inBlueprint = isInRange(p, 0.4, 0.65);
      const inNetwork = isInRange(p, 0.65, 0.85);
      const inAbstract = isInRange(p, 0.85, 0.95);

      if (inBlueprint || inNetwork) {
        ctx.strokeStyle = inBlueprint ? "rgba(232,160,32,0.14)" : "rgba(0,194,255,0.16)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 20; i++) {
          const y = (ch / 20) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cw, y);
          ctx.stroke();
        }
      }

      if (inAbstract) {
        ctx.strokeStyle = "rgba(0,194,255,0.25)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) {
          const offset = i * 24;
          ctx.beginPath();
          ctx.moveTo(cw * 0.2, ch * 0.2 + offset);
          ctx.bezierCurveTo(cw * 0.4, ch * 0.35 + offset, cw * 0.6, ch * 0.15 + offset, cw * 0.8, ch * 0.35 + offset);
          ctx.stroke();
        }
      }

      if (isInRange(p, 0.95, 1)) {
        const endGlow = ctx.createRadialGradient(cw * 0.5, ch * 0.7, 0, cw * 0.5, ch * 0.7, ch * 0.75);
        endGlow.addColorStop(0, "rgba(232,160,32,0.34)");
        endGlow.addColorStop(1, "rgba(5,5,5,0)");
        ctx.fillStyle = endGlow;
        ctx.fillRect(0, 0, cw, ch);
      }
    };

    const draw = () => {
      const p = progressRef.current;
      const fallback = fallbackImageRef.current;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (hasSequence && imagesRef.current.length === FRAME_COUNT) {
        const frame = Math.min(FRAME_COUNT - 1, Math.floor(p * (FRAME_COUNT - 1)));
        const img = imagesRef.current[frame];
        if (img && img.complete) {
          drawCoverImage(img);
        } else if (fallback && fallback.complete) {
          drawCoverImage(fallback);
        }
      } else if (fallback && fallback.complete) {
        const scale = 1.01 + Math.sin(p * Math.PI) * 0.015;
        const dx = Math.sin(p * Math.PI * 0.8) * 10;
        const dy = -p * 18;
        ctx.save();
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(scale, scale);
        ctx.translate(-window.innerWidth / 2 + dx, -window.innerHeight / 2 + dy);
        ctx.filter = isInRange(p, 0.4, 0.85) ? "saturate(0.72) contrast(1.06) brightness(0.76)" : "brightness(0.9)";
        drawCoverImage(fallback);
        ctx.restore();
        ctx.filter = "none";
      } else {
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      }

      drawOverlay(p);
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    const raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [hasSequence]);

  return (
    <div className="bg-[#050505] text-white">
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{
          backgroundColor: navSolid ? "rgba(5,5,5,0.28)" : "rgba(5,5,5,0)",
          borderBottomColor: navSolid ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)",
          backdropFilter: navSolid ? "blur(8px)" : "blur(0px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white/40 p-1.5 backdrop-blur-md transition hover:border-white/45 hover:bg-white/30"
          >
            <NextImage src="/naqla-logo-b.png" alt="NaqlaAI" width={40} height={40} className="h-10 w-10 object-contain" />
          </Link>
          <nav className="hidden rounded-full border border-white/14 bg-white/6 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl md:flex md:items-center md:gap-1">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = idx === Math.min(currentBeatIndex, NAV_ITEMS.length - 1);
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    isActive ? "bg-white/85 text-black" : "text-white/82 hover:bg-white/14"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="#contact"
              className="rounded-full bg-black/75 px-5 py-2 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-black/90"
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={isAuthenticated ? "/en/dashboard" : "/en/login"}
              className="rounded-full border border-white/14 px-3 py-1.5 text-sm text-white/85 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        <section id="overview" ref={storyRef} className="relative h-[500vh]">
          <div className="sticky top-0 h-screen overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-[#050505]" />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40" />

            <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeBeat.title}
                  initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`flex max-w-2xl flex-col gap-4 ${
                    activeBeat.align === "left"
                      ? "items-start text-left"
                      : activeBeat.align === "right"
                        ? "ms-auto items-end text-right"
                        : "mx-auto items-center text-center"
                  }`}
                >
                  <span className="rounded-full border border-white/18 bg-black/35 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-white/75">
                    {activeBeat.badge}
                  </span>
                  <h1 className="text-balance text-4xl font-semibold tracking-tight text-white/92 sm:text-5xl lg:text-6xl">
                    {activeBeat.title}
                  </h1>
                  <div className="space-y-2">
                    {activeBeat.body.map((line) => (
                      <p key={line} className="max-w-xl text-balance text-base leading-relaxed text-white/62 sm:text-lg">
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.18em] text-white/45">
              SCROLL TO REVEAL
            </div>
          </div>
        </section>

        <section id="platform" className="border-t border-white/10 bg-[#0A0A0C] py-24">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {[
              {
                title: "Unified Operations Layer",
                text: "One command surface for yard, route, and fleet decisions with real-time state continuity.",
              },
              {
                title: "Predictive Logistics Intelligence",
                text: "AI-native orchestration that surfaces delay risk, congestion hotspots, and route efficiency opportunities early.",
              },
              {
                title: "Enterprise-Grade Deployment",
                text: "Secure cloud architecture with auditable workflows, resilient service runtime, and scalable infrastructure.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-[#0F1013]/80 p-6 shadow-xl shadow-black/25 backdrop-blur"
              >
                <h3 className="text-xl font-semibold tracking-tight text-white/90">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="ai-engine" className="bg-[#050505] py-24">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-medium tracking-[0.24em] text-[#00C2FF]">AI ENGINE</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white/90 sm:text-5xl">
              Built for Saudi-scale logistics precision
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/60 sm:text-lg">
              NaqlaAI combines real-time telemetry, predictive intelligence, and operator workflows into a single logistics
              intelligence layer for Vision 2030-grade operations.
            </p>
          </div>
        </section>

        <section id="pricing" className="bg-[#0A0A0C] py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-8">
              <h3 className="text-2xl font-semibold tracking-tight text-white/90">Enterprise plans tailored to fleet scale</h3>
              <p className="mt-2 text-white/60">From regional operators to national logistics networks.</p>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-[#050505] py-28">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-semibold tracking-tight text-white/90 sm:text-5xl">
              Ready to transform your logistics control tower?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              Request a guided NaqlaAI walkthrough for your operations team and see how quickly intelligence can compound.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href={isAuthenticated ? "/en/dashboard" : "/en/login"}>
                <Button variant="outline" className="h-11 border-white/20 bg-transparent px-6 text-sm text-white hover:bg-white/5">
                  {isAuthenticated ? "Open Dashboard" : "Login"}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

