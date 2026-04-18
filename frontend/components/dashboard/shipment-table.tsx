"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShipments } from "@/hooks/use-dashboard-data";

const statuses = ["", "PENDING", "IN_TRANSIT", "DELAYED", "DELIVERED"];

export function ShipmentTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const { data, isLoading, error } = useShipments(query);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.set("page", "0");
    router.replace(`${pathname}?${next.toString()}`);
  }

  function changePage(offset: number) {
    const current = Number(searchParams.get("page") || "0");
    const next = Math.max(0, current + offset);
    updateParam("page", String(next));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Search tracking or reference"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onBlur={(event) => updateParam("search", event.target.value)}
        />
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateParam("status", event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {statuses.map((status) => (
            <option key={status || "ALL"} value={status}>
              {status || "All Statuses"}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading shipments...</p> : null}
      {error ? <p className="text-sm text-red-600">Failed to load shipments.</p> : null}

      {data ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pe-4">Tracking</th>
                  <th className="py-2 pe-4">Status</th>
                  <th className="py-2 pe-4">City</th>
                  <th className="py-2 pe-4">Driver</th>
                  <th className="py-2 pe-4">ETA</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-slate-100">
                    <td className="py-2 pe-4 font-medium">{shipment.trackingNumber}</td>
                    <td className="py-2 pe-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          shipment.status === "DELAYED"
                            ? "bg-red-100 text-red-700"
                            : shipment.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-2 pe-4">{shipment.currentCity}</td>
                    <td className="py-2 pe-4">{shipment.driverName ?? "-"}</td>
                    <td className="py-2 pe-4">{new Date(shipment.etaAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Total: {data.total} • Page: {data.page + 1}
            </p>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1 text-xs" onClick={() => changePage(-1)}>
                Prev
              </button>
              <button className="rounded border px-3 py-1 text-xs" onClick={() => changePage(1)}>
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
