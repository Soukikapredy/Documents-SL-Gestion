"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { IconTrendUp, IconTrendDown } from "./icons";

type Kpi = DashboardData["kpi"];
type Spark = DashboardData["spark"];

function Delta({ value, goodWhenUp }: { value: number | null; goodWhenUp: boolean }) {
  if (value === null) return <span className="text-[11px] text-slate-500">—</span>;
  const up = value >= 0;
  const good = goodWhenUp ? up : !up;
  const color = good ? "#22c55e" : "#f97316";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
      {up ? <IconTrendUp width={12} height={12} /> : <IconTrendDown width={12} height={12} />}
      {up ? "+" : ""}
      {value.toFixed(1).replace(".", ",")}%
      <span className="font-normal text-slate-500">vs période préc.</span>
    </span>
  );
}

function SparkArea({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  const id = `sg-${color.replace("#", "")}`;
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={{ r: 1.6, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MiniRing({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <div className="relative h-[72px] w-[72px]">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{label}</span>
    </div>
  );
}

export default function KpiCards({
  kpi,
  spark,
  prelevShare,
  ratePct,
}: {
  kpi: Kpi;
  spark: Spark;
  prelevShare: number;
  ratePct: number;
}) {
  const rateLabel = ratePct.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const { fmt } = useMoney();

  return (
    <div>
      <h2 className="section-label mb-4">Indicateurs clés</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-4">
          <p className="kpi-label">CA Hebdomadaire</p>
          <p className="kpi-value">{fmt(kpi.caWeek)}</p>
          <Delta value={kpi.caWeekDelta} goodWhenUp />
          <div className="mt-3">
            <SparkArea data={spark.ca} color="#22c55e" />
          </div>
        </div>

        <div className="card p-4">
          <p className="kpi-label">Versements (mois)</p>
          <p className="kpi-value">{fmt(kpi.versMonth)}</p>
          <Delta value={kpi.versMonthDelta} goodWhenUp />
          <div className="mt-3">
            <SparkArea data={spark.vers} color="#2f6bff" />
          </div>
        </div>

        <div className="card flex flex-col p-4">
          <p className="kpi-label">Prélèvement {rateLabel}%</p>
          <p className="kpi-value">{fmt(kpi.prelevMonth)}</p>
          <p className="text-[11px] text-slate-500">{rateLabel}% des recettes</p>
          <div className="mt-2 flex justify-center">
            <MiniRing pct={prelevShare} color="#22c55e" label={`${rateLabel}%`} />
          </div>
        </div>

        <div className="card p-4">
          <p className="kpi-label">Dépenses (mois)</p>
          <p className="kpi-value">{fmt(kpi.depMonth)}</p>
          <Delta value={kpi.depMonthDelta} goodWhenUp={false} />
          <div className="mt-3">
            <SparkLine data={spark.dep} color="#4d82ff" />
          </div>
        </div>

        <div className="card p-4">
          <p className="kpi-label">Pannes (mois)</p>
          <p className="kpi-value">{kpi.pannesMonth}</p>
          <Delta value={kpi.pannesMonthDelta} goodWhenUp={false} />
          <div className="mt-3">
            <SparkLine data={spark.pannes} color="#f97316" />
          </div>
        </div>
      </div>
    </div>
  );
}
