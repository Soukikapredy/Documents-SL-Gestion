"use client";

import { useState } from "react";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { IconArrowRight, IconDownload } from "./icons";

export default function BilanCard({
  bilans,
  dailyByMonth,
  ratePct,
}: {
  bilans: DashboardData["bilans"];
  dailyByMonth: Record<string, DashboardData["daily"]>;
  ratePct: number;
}) {
  const rateLabel = ratePct.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const { fmt } = useMoney();
  const [key, setKey] = useState(bilans[bilans.length - 1]?.key ?? "");
  const b = bilans.find((x) => x.key === key) ?? bilans[bilans.length - 1];

  const exportMonth = () => {
    const rows = dailyByMonth[key] ?? [];
    const header = ["Date", "Versements", "CA", "Prélèvement", "Dépenses", "Pannes", "Présents", "Effectif"];
    const lines = rows.map((r) =>
      [r.date, Math.round(r.versements), Math.round(r.ca), Math.round(r.prelevement), Math.round(r.depenses), r.pannes, r.present, r.total].join(";")
    );
    const blob = new Blob(["\uFEFF" + [header.join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spl-bilan-${key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!b) return null;

  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="section-label !mb-0">Bilan du mois</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportMonth}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
            title="Exporter le détail du mois en CSV"
          >
            <IconDownload width={13} height={13} /> CSV
          </button>
          <select
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="h-8 cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-white outline-none focus:border-[#2f6bff]"
        >
            {bilans.map((m) => (
              <option key={m.key} value={m.key} className="bg-[#0b111d]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <dl className="space-y-3 text-[13px]">
        <Row label="CA brut" value={fmt(b.ca)} />
        <Row label="Versements (recettes)" value={fmt(b.vers)} />
        <Row label={`Prélèvement ${rateLabel}%`} value={fmt(b.prelev)} />
        <Row label="Dépenses totales" value={fmt(b.dep)} />
        <Row label="Pannes" value={String(b.pannes)} />
      </dl>

      <div className="my-4 border-t border-white/8" />

      <dl className="space-y-3 text-[13px]">
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-white">Résultat net</dt>
          <dd className={`font-display text-base font-bold ${b.net >= 0 ? "text-[#22c55e]" : "text-[#f97316]"}`}>
            {fmt(b.net)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="font-semibold text-white">Marge</dt>
          <dd className={`font-semibold ${b.marge >= 0 ? "text-[#22c55e]" : "text-[#f97316]"}`}>
            {b.marge.toFixed(2).replace(".", ",")}%
          </dd>
        </div>
      </dl>

      <a
        href="#operations"
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d82ff] transition hover:text-[#7aa2ff]"
      >
        Voir le bilan détaillé <IconArrowRight width={13} height={13} />
      </a>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-100">{value}</dd>
    </div>
  );
}
