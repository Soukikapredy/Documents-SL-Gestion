"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";

type Point = DashboardData["caSeries"][number];

function ChartTooltip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b111d]/95 px-3 py-2 shadow-xl">
      <p className="mb-1 text-[11px] font-semibold text-slate-400">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-xs text-slate-200">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.dataKey === "ca" ? "CA Journalier" : "Moyenne 7 jours"} :{" "}
          <span className="font-semibold text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function CaChart({ series }: { series: Point[] }) {
  const [range, setRange] = useState<7 | 30>(7);
  const { fmt, fmtAxis } = useMoney();
  const data = series.slice(-range);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-label !mb-0">Évolution du CA</h3>
        <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                range === r ? "bg-[#2f6bff] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {r} derniers jours
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-5 text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded bg-[#2f6bff]" /> CA Journalier
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-0.5 w-4 rounded bg-[#22c55e]" /> Moyenne 7 jours
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => fmtAxis(v)}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <Tooltip content={<ChartTooltip fmt={fmt} />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
            <Line
              type="monotone"
              dataKey="avg7"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 2, fill: "#22c55e", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="ca"
              stroke="#2f6bff"
              strokeWidth={2.4}
              dot={{ r: 2.6, fill: "#2f6bff", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
