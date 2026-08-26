"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { useMoney } from "@/lib/currency";

function Tip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b111d]/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-400">{label}</p>
      <p className={`font-semibold ${v >= 0 ? "text-[#22c55e]" : "text-[#f97316]"}`}>{fmt(v)}</p>
    </div>
  );
}

export default function NetResultChart({ data }: { data: { label: string; net: number }[] }) {
  const { fmt, fmtAxis } = useMoney();
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label !mb-0">Résultat net mensuel</h3>
        <span className="text-[11px] text-slate-500">bénéfice net après charges</span>
      </div>
      <div className="h-[248px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <YAxis
              tickFormatter={(v: number) => fmtAxis(v)}
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="net" radius={[5, 5, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.net >= 0 ? "#22c55e" : "#f97316"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
