"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface PersonnelData {
  series: { label: string; rate: number; present: number; total: number }[];
  avgRate: number;
  lowDays: number;
  staffTotal: number;
}

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b111d]/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-400">{label}</p>
      <p className="font-semibold text-white">{p.rate.toFixed(0)}% de présence</p>
      <p className="text-slate-500">
        {p.present} / {p.total} présents
      </p>
    </div>
  );
}

export default function PersonnelCard({ data }: { data: PersonnelData }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-label !mb-0">Pointage du personnel</h3>
        <span className="text-[11px] text-slate-500">14 derniers jours</span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Taux moyen</p>
          <p className={`font-display mt-1 text-lg font-bold ${data.avgRate >= 90 ? "text-[#22c55e]" : "text-[#f97316]"}`}>
            {data.avgRate.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Effectif</p>
          <p className="font-display mt-1 text-lg font-bold text-white">{data.staffTotal}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jours &lt; 90%</p>
          <p className={`font-display mt-1 text-lg font-bold ${data.lowDays > 3 ? "text-[#f97316]" : "text-white"}`}>
            {data.lowDays}
          </p>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.series} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: "#64748b", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<Tip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#att)"
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
