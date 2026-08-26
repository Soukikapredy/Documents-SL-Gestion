"use client";

import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { IconTrendUp, IconTrendDown } from "./icons";

type Mom = DashboardData["mom"];

function DeltaChip({ cur, prev, goodWhenUp }: { cur: number; prev: number; goodWhenUp: boolean }) {
  if (prev <= 0) return <span className="text-[11px] text-slate-500">—</span>;
  const pct = ((cur - prev) / prev) * 100;
  const up = pct >= 0;
  const good = goodWhenUp ? up : !up;
  const color = good ? "#22c55e" : "#f97316";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color }}>
      {up ? <IconTrendUp width={12} height={12} /> : <IconTrendDown width={12} height={12} />}
      {up ? "+" : ""}
      {pct.toFixed(1).replace(".", ",")}%
    </span>
  );
}

export default function MoMCard({ mom }: { mom: Mom }) {
  const { fmt } = useMoney();
  const rows: { label: string; cur: number; prev: number; good: boolean }[] = [
    { label: "Versements", cur: mom.vers.cur, prev: mom.vers.prev, good: true },
    { label: "Chiffre d'affaires", cur: mom.ca.cur, prev: mom.ca.prev, good: true },
    { label: "Dépenses", cur: mom.dep.cur, prev: mom.dep.prev, good: false },
    { label: "Résultat net", cur: mom.net.cur, prev: mom.net.prev, good: true },
  ];

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="section-label !mb-0">Mois vs mois précédent</h3>
        <span className="text-[11px] text-slate-500">comparaison automatique</span>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li
            key={r.label}
            className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2.5 text-[13px]"
          >
            <span className="font-semibold text-slate-200">{r.label}</span>
            <span className="text-right text-slate-500" title="Mois précédent">
              {fmt(r.prev)}
            </span>
            <span className={`text-right font-semibold ${r.label === "Résultat net" && r.cur >= 0 ? "text-[#22c55e]" : "text-white"}`}>
              {fmt(r.cur)}
            </span>
            <span className="text-right">
              <DeltaChip cur={r.cur} prev={r.prev} goodWhenUp={r.good} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-500">
        Colonne gauche : mois précédent · colonne droite : mois en cours
      </p>
    </div>
  );
}
