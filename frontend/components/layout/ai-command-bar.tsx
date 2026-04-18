"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiQueryResponse } from "@/types/api";

type AiCommandBarProps = {
  locale: string;
  labels: {
    trigger: string;
    title: string;
    subtitle: string;
    placeholder: string;
    hint: string;
    submit: string;
    loading: string;
    empty: string;
    error: string;
    examples: string[];
    shortcut: string;
  };
};

type GenericRow = Record<string, unknown>;

function formatValue(value: unknown): string {
  if (typeof value === "number") return Number.isInteger(value) ? `${value}` : value.toFixed(2);
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "-";
  return String(value);
}

function toRows(data: unknown): GenericRow[] {
  return Array.isArray(data) ? (data.filter((row) => typeof row === "object" && row !== null) as GenericRow[]) : [];
}

function DataPreview({ response }: { response: AiQueryResponse }) {
  const rows = toRows(response.data);
  if (!rows.length) {
    return null;
  }

  if (response.intent === "route_summaries") {
    return (
      <div className="grid gap-2 md:grid-cols-2">
        {rows.slice(0, 8).map((row, index) => (
          <div key={`${String(row.routeCode ?? index)}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-medium text-slate-500">{formatValue(row.routeCode)}</p>
            <p className="mt-1 text-sm text-slate-800">
              {formatValue(row.originCity)} <span className="text-slate-400">→</span> {formatValue(row.destinationCity)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Active: {formatValue(row.activeShipments)} | Delayed: {formatValue(row.delayedShipments)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const columns = Object.keys(rows[0] ?? {}).slice(0, 5);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="max-h-56 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-100 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 10).map((row, index) => (
              <tr key={index} className="border-t border-slate-100 text-slate-700">
                {columns.map((column) => (
                  <td key={column} className="px-3 py-2 align-top">
                    {formatValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AiCommandBar({ locale, labels }: AiCommandBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AiQueryResponse | null>(null);

  const isRtl = useMemo(() => locale === "ar", [locale]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcutPressed = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (shortcutPressed) {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query.trim(),
          conversationId: "dashboard-command-bar",
        }),
      });

      if (!result.ok) {
        const text = await result.text();
        throw new Error(text || labels.error);
      }

      const json = (await result.json()) as AiQueryResponse;
      setResponse(json);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : labels.error);
    } finally {
      setIsLoading(false);
    }
  }

  function applyExample(example: string) {
    setQuery(example);
    setResponse(null);
    setError(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="group relative h-9 min-w-56 justify-between rounded-full border-slate-300 bg-linear-to-r from-slate-100 to-slate-50 px-3 text-slate-700 shadow-sm transition-all hover:shadow-md"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-sky-600" />
          <span className="text-sm">{labels.trigger}</span>
        </span>
        <span className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">{labels.shortcut}</span>
      </Button>

      <div
        className={`fixed inset-0 z-50 flex items-start justify-center p-4 md:p-12 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/30 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        <section
          dir={isRtl ? "rtl" : "ltr"}
          className={`relative w-full max-w-3xl rounded-2xl border border-white/40 bg-white/85 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-6 ${
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{labels.title}</h2>
            <p className="text-sm text-slate-500">{labels.subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-inner transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={labels.placeholder}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {labels.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => applyExample(example)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{labels.hint}</p>
              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {labels.loading}
                  </span>
                ) : (
                  labels.submit
                )}
              </Button>
            </div>
          </form>

          <div className="mt-4 min-h-24 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            {error ? (
              <p className="text-sm text-rose-600">{error}</p>
            ) : response ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-md bg-white px-2 py-1">{response.intent}</span>
                  {response.fromCache ? <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">cache</span> : null}
                </div>
                <p className="text-sm text-slate-800">{response.answer}</p>
                <DataPreview response={response} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">{labels.empty}</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
