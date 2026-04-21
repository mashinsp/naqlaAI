"use client";

import { useEffect, useMemo, useState } from "react";
import { useRecentEvents } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import type { LiveEvent } from "@/types/api";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws/events";

export function LiveEventsPanel() {
  const { data, isLoading, error } = useRecentEvents(10);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(wsUrl);
    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as LiveEvent[];
        if (parsed.length > 0) {
          setLiveEvents(parsed);
          setToast(`Live update: ${parsed[0].trackingNumber} ${parsed[0].severity}`);
          setTimeout(() => setToast(null), 2500);
        }
      } catch {
        // no-op
      }
    };
    return () => socket.close();
  }, []);

  const entries = useMemo(() => (liveEvents.length > 0 ? liveEvents : data ?? []), [liveEvents, data]);

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <article key={idx} className="rounded-md border border-slate-100 p-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <article className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load live events.
      </article>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Real-time Event Feed</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          {entries.length} items
        </span>
      </div>
      {toast ? <p className="mb-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">{toast}</p> : null}
      <div className="max-h-104 space-y-2 overflow-y-auto pe-1">
        {entries.length === 0 ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
            No live events yet.
          </p>
        ) : null}
        {entries.map((event, index) => (
          <article key={`${event.trackingNumber}-${index}`} className="rounded-md border border-slate-100 bg-slate-50/50 p-3">
            <p className="text-sm font-medium text-slate-800">
              {event.eventType} • {event.trackingNumber}
            </p>
            <p className="text-sm text-slate-700">{event.message}</p>
            <p className="text-xs text-slate-500">
              {event.severity} • {new Date(event.timestamp).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
