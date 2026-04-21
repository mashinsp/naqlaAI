"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const locale = params.locale;
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setError(t("invalid"));
      setLoading(false);
      return;
    }

    router.replace(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30 lg:grid-cols-[1.25fr_0.85fr]">
          <div className="relative hidden min-h-[560px] bg-slate-100 lg:block">
            <Image
              src="/logistics.jpg"
              alt="Logistics warehouse operations"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-900/25 via-slate-900/15 to-transparent" />
            <div className="absolute left-8 top-8 max-w-md rounded-xl bg-white/80 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                NaqlaAI
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Smart logistics visibility for Saudi operations, with secure role-based workflows and AI-assisted insights.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10">
            <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Welcome back</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t("title")}</h1>
                <p className="text-sm leading-relaxed text-slate-500">{t("subtitle")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t("username")}</label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{t("password")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  autoComplete="current-password"
                />
              </div>

              {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <Button type="submit" disabled={loading} className="h-11 w-full text-sm font-semibold">
                {loading ? t("loading") : t("submit")}
              </Button>

              <p className="text-center text-xs text-slate-400">
                Demo users: <span className="font-medium text-slate-500">admin</span> / admin123
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
