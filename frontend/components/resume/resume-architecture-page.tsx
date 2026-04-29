"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SpectraBg } from "@/components/spectra-bg";
import { MagneticButton } from "@/components/magnetic-button";

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/4 px-4 py-3 transition hover:border-white/20">
      <div className="text-2xl font-semibold tracking-tight text-white/90">{value}</div>
      <div className="mt-1 text-[10px] tracking-widest text-white/45">{label}</div>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-[#00C2FF]/0 via-[#00C2FF]/60 to-[#00C2FF]/0" />
      </div>
    </div>
  );
}

function TagPill({ label, variant }: { label: string; variant: "blue" | "purple" | "green" | "amber" | "neutral" }) {
  const variantClass =
    variant === "blue"
      ? "border-[#00C2FF]/30 bg-[#00C2FF]/10 text-[#9BE6FF]/90"
      : variant === "purple"
        ? "border-[#7F77DD]/30 bg-[#7F77DD]/10 text-[#C7C4FF]/90"
        : variant === "green"
          ? "border-[#00D48A]/30 bg-[#00D48A]/10 text-[#A6F3D1]/90"
          : variant === "amber"
            ? "border-[#EF9F27]/30 bg-[#EF9F27]/10 text-[#FFD89E]/90"
            : "border-white/15 bg-white/4 text-white/70";

  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

function FeatureCard({
  title,
  body,
  meta,
}: {
  title: string;
  body: string;
  meta: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/10 bg-[#0C0C0F]/70 p-6 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/85">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-white/40">{body}</p>
        </div>
        <div className="shrink-0 text-[10px] font-mono tracking-widest text-white/25">{meta}</div>
      </div>
    </motion.div>
  );
}

export function ResumeArchitecturePage() {
  const router = useRouter();
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const heroTags = useMemo(
    () => [
      { label: "Spring Boot 3", variant: "blue" as const },
      { label: "Next.js 14", variant: "blue" as const },
      { label: "LangChain4j", variant: "purple" as const },
      { label: "AWS ECS Fargate", variant: "green" as const },
      { label: "Terraform", variant: "green" as const },
      { label: "GitHub Actions", variant: "amber" as const },
      { label: "PostgreSQL + Flyway", variant: "blue" as const },
      { label: "Redis", variant: "purple" as const },
      { label: "JWT · RBAC", variant: "neutral" as const },
      { label: "Spring Security", variant: "neutral" as const },
      { label: "Trivy", variant: "green" as const },
      { label: "SonarCloud", variant: "amber" as const },
      { label: "Snyk (optional)", variant: "purple" as const },
    ],
    [],
  );

  const heroStats = useMemo(
    () => [
      { label: "AI Agent Services", value: "3" },
      { label: "Languages (EN/AR)", value: "2" },
      { label: "Runtime services", value: "4" },
      { label: "Terraform modules", value: "7+" },
    ],
    [],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <SpectraBg className="opacity-95" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-12">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 p-2">
              <div className="h-full w-full rounded-lg bg-linear-to-br from-[#00C2FF]/70 via-[#00C2FF]/10 to-transparent" />
            </div>
            <div>
              <div className="text-xs tracking-widest text-white/45">NAQLA</div>
              <div className="text-sm font-semibold text-white/85">System Architecture</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/system-design.png"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/55 transition hover:text-white/85"
            >
              Open PNG
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="relative pt-16 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center rounded-full border border-white/10 bg-white/3 px-4 py-2"
          >
            <span className="text-[11px] tracking-[0.18em] text-white/50">Logistics SaaS · Production Deployment</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            NaqlaAI architecture
            <span className="block bg-linear-to-r from-[#00C2FF] via-white to-white bg-clip-text text-transparent">
              built for real logistics scale
            </span>
          </motion.h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
            A full-stack logistics dashboard with AI orchestration and live operations, deployed to{" "}
            <span className="text-white/70">AWS ECS Fargate</span> behind an{" "}
            <span className="text-white/70">Application Load Balancer</span>. Infrastructure is provisioned
            entirely via <span className="text-white/70">Terraform</span>, with quality gates in CI{" "}
            <span className="text-white/70">(Trivy + SonarCloud)</span>.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {heroTags.map((t) => (
              <TagPill key={t.label} label={t.label} variant={t.variant} />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((s) => (
              <StatChip key={s.label} label={s.label} value={s.value} />
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton
              className="rounded-full border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white/92 backdrop-blur-sm"
              onClick={() => router.push("/en")}
            >
              → Open Live Demo
            </MagneticButton>

            <Link
              href="https://github.com/mashinsp/naqlaAI"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-transparent px-6 py-3 text-center text-sm font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/5 hover:text-white/90"
            >
              ⌥ GitHub Repository
            </Link>
          </div>
        </div>

        {/* Highlights */}
        <div className="relative pb-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs tracking-widest text-white/45">KEY CAPABILITIES</div>
              <div className="mt-2 text-xl font-semibold text-white/85">What this system does</div>
            </div>
            <div className="hidden text-xs text-white/35 md:block">
              Designed to be understandable in seconds.
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <FeatureCard
              title="BFF-style routing"
              body="Next.js route handlers proxy secured backend endpoints and attach Bearer tokens from an HttpOnly JWT cookie."
              meta="SECURE"
            />
            <FeatureCard
              title="AI query + action agents"
              body="Natural-language query surfaces predictive insights. Action endpoints support role-restricted operations (when enabled)."
              meta="AI"
            />
            <FeatureCard
              title="Realtime operations"
              body="Live event broadcasting over WebSockets for events like shipment updates and anomaly feeds."
              meta="WS / LIVE"
            />
          </div>
        </div>

        {/* Diagram */}
        <div className="relative pb-16">
          <div className="text-xs tracking-widest text-white/45">ARCHITECTURE DIAGRAM</div>
          <div className="mt-2 text-xl font-semibold text-white/85">At a glance</div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0C0C0F]/60 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full"
              aria-label="Open architecture diagram"
            >
              <div className="relative aspect-16/8 w-full">
                <Image
                  src="/system-design.png"
                  alt="NaqlaAI system architecture diagram"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                  priority
                />
              </div>
            </button>
          </motion.div>
        </div>

        {/* Resume-friendly details */}
        <div className="relative pb-16">
          <div className="text-xs tracking-widest text-white/45">PROJECT DETAILS</div>
          <div className="mt-2 text-xl font-semibold text-white/85">Designed for clarity</div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/10 bg-[#0C0C0F]/70 p-6"
            >
              <div className="text-sm font-medium text-white/85">Security model (high level)</div>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/40">
                <div>
                  HttpOnly JWT cookie (`naqlaai_token`) prevents token access from browser JavaScript.
                </div>
                <div>Spring Security enforces RBAC: `ADMIN`, `MANAGER`, `VIEWER`.</div>
                <div>API endpoints are protected under `/api/v1/**` with stateless authentication.</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/10 bg-[#0C0C0F]/70 p-6"
            >
              <div className="text-sm font-medium text-white/85">Key surfaces</div>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/40">
                <div>REST API: `/api/v1/*` (versioned, documented via Swagger).</div>
                <div>WebSocket: `/ws/events` (live logistics signals).</div>
                <div>AI endpoints: `/api/v1/ai/query` and `/api/v1/ai/action` (role-restricted).</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0C0C0F]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-16/8 w-full">
                <Image
                  src="/system-design.png"
                  alt="NaqlaAI architecture diagram large view"
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3">
                <div className="text-xs text-white/45">Click anywhere outside to close</div>
                <Link
                  href="/system-design.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-white/70 transition hover:text-white/90"
                >
                  Open full image
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

