"use client";

import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { IconTrendUp, IconTrendDown, IconWrench } from "./icons";

export default function PannesCard({ stats }: { stats: DashboardData["pannesStats"] }) {
  const { fmt } = useMoney();
  const diff = stats.count - stats.prevCount;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label !mb-0">Analyse des pannes (mois)</h3>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f97316]/15 text-[#f97316]">
          <IconWrench width={16} height={16} />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre</p>
          <p className="font-display mt-1 text-lg font-bold text-white">{stats.count}</p>
          <p className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${diff > 0 ? "text-[#f97316]" : "text-[#22c55e]"}`}>
            {diff > 0 ? <IconTrendUp width={11} height={11} /> : <IconTrendDown width={11} height={11} />}
            {diff > 0 ? "+" : ""}
            {diff} vs mois préc.
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coût total</p>
          <p className="font-display mt-1 text-lg font-bold text-[#f97316]">{fmt(stats.cost)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coût moyen</p>
          <p className="font-display mt-1 text-lg font-bold text-white">{fmt(stats.avg)}</p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Panne la + chère</p>
          <p className="font-display mt-1 text-lg font-bold text-white">{fmt(stats.maxAmount)}</p>
        </div>
      </div>

      {stats.maxLabel && (
        <p className="mt-3 truncate rounded-lg border border-[#f97316]/20 bg-[#f97316]/5 px-3 py-2 text-xs text-slate-300">
          <span className="font-semibold text-[#f97316]">Dernière panne majeure :</span> {stats.maxLabel}
        </p>
      )}
    </div>
  );
}
