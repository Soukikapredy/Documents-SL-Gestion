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
} from "recharts";
import { useMoney } from "@/lib/currency";

function Tip({ active, payload, label, fmt }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b111d]/95 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-400">{label}</p>
      <p className="font-semibold text-white">{fmt(payload[0].value)}</p>
    </div>
  );
}

const CAT_LABELS: Record<string, string> = {
  panne: "Panne",
  pieces: "Pièces",
  entretien: "Entretien",
  divers: "Divers",
};
const CAT_COLORS: Record<string, string> = {
  panne: "#f97316",
  pieces: "#2f6bff",
  entretien: "#22c55e",
  divers: "#8b96ab",
};

export function RecentExpenses({
  recent,
}: {
  recent: { id: number; designation: string; category: string; amount: number; date: string }[];
}) {
  const { fmt } = useMoney();
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label !mb-0">Dernières dépenses</h3>
        <span className="text-[11px] text-slate-500">pannes, pièces, entretien…</span>
      </div>
      {recent.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Aucune dépense enregistrée.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {recent.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-slate-200">{r.designation}</p>
                <p className="text-[11px] text-slate-500">
                  {r.date.split("-").reverse().slice(0, 2).join("/")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: CAT_COLORS[r.category] ?? "#8b96ab",
                    backgroundColor: `${CAT_COLORS[r.category] ?? "#8b96ab"}1a`,
                  }}
                >
                  {CAT_LABELS[r.category] ?? r.category}
                </span>
                <span className="text-[13px] font-semibold text-slate-100">{fmt(r.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ExpensesHistogram({
  data,
}: {
  data: { label: string; total: number }[];
}) {
  const { fmt, fmtAxis } = useMoney();
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label !mb-0">Dépenses mensuelles</h3>
        <span className="text-[11px] text-slate-500">6 derniers mois</span>
      </div>
      <div className="h-52 w-full">
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
              width={52}
            />
            <Tooltip content={<Tip fmt={fmt} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="total" radius={[5, 5, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.total === max ? "#2f6bff" : "rgba(47,107,255,0.55)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
