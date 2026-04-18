"use client";

import { useEffect, useMemo, useState } from "react";
import { useRecentEvents } from "@/hooks/use-dashboard-data";
import type { LiveEvent } from "@/types/api";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws/events";

export function LiveEventsPanel() {
  const { data } = useRecentEvents(10);
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-4 text-base font-semibold">Real-time Event Feed</h3>
      {toast ? <p className="mb-2 rounded bg-sky-100 px-3 py-2 text-sm text-sky-700">{toast}</p> : null}
      <div className="space-y-2">
        {entries.map((event, index) => (
          <article key={`${event.trackingNumber}-${index}`} className="rounded-md border border-slate-100 p-3">
            <p className="text-sm font-medium">
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
