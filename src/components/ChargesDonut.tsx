"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";

const COLORS = { op: "#2f6bff", prelev: "#22c55e", pannes: "#f97316" };

export default function ChargesDonut({
  charges,
  ratePct,
}: {
  charges: DashboardData["charges"];
  ratePct: number;
}) {
  const { fmt } = useMoney();
  const total = charges.op + charges.prelev + charges.pannes;
  const rateLabel = ratePct.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const data = [
    { name: "Dépenses opérationnelles", value: charges.op, color: COLORS.op },
    { name: `Prélèvement ${rateLabel}%`, value: charges.prelev, color: COLORS.prelev },
    { name: "Pannes", value: charges.pannes, color: COLORS.pannes },
  ];
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <div className="card p-5">
      <h3 className="section-label">Répartition des charges (mois)</h3>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={86}
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => fmt(Number(v))}
              contentStyle={{
                background: "#0b111d",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
                color: "#e2e8f0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-bold text-white">{fmt(total)}</span>
          <span className="text-[11px] text-slate-500">Total</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="text-slate-200">
              <span className="font-semibold text-white">{fmt(d.value)}</span>{" "}
              <span className="text-slate-500">({pct(d.value)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
