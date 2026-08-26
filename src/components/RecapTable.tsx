"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { deleteDay } from "@/app/actions";
import { IconDots, IconTrash, IconDownload } from "./icons";

type Tab = "jour" | "semaine" | "mois";

interface Row {
  key: string;
  label: string;
  versements: number;
  ca: number;
  prelevement: number;
  depenses: number;
  pannes: number;
  present: number;
  total: number;
}

export default function RecapTable({
  daily,
  weekly,
  monthly,
  ratePct,
}: {
  daily: DashboardData["daily"];
  weekly: DashboardData["weekly"];
  monthly: DashboardData["monthly"];
  ratePct: number;
}) {
  const rateLabel = ratePct.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  const [tab, setTab] = useState<Tab>("jour");
  const { fmt } = useMoney();
  const router = useRouter();
  const [menu, setMenu] = useState<string | null>(null);
  const [pendingKey, startTransition] = useTransition();

  const rows: Row[] =
    tab === "jour"
      ? daily.map((d) => ({ key: d.date, label: d.label, versements: d.versements, ca: d.ca, prelevement: d.prelevement, depenses: d.depenses, pannes: d.pannes, present: d.present, total: d.total }))
      : tab === "semaine"
        ? weekly.map((w) => ({ key: w.key, label: w.label, versements: w.versements, ca: w.ca, prelevement: w.prelevement, depenses: w.depenses, pannes: w.pannes, present: w.present, total: w.total }))
        : monthly.map((m) => ({ key: m.key, label: m.label, versements: m.versements, ca: m.ca, prelevement: m.prelevement, depenses: m.depenses, pannes: m.pannes, present: m.present, total: m.total }));

  const exportCsv = () => {
    const header = ["Période", "Versements", "CA", `Prélèvement ${rateLabel}%`, "Dépenses", "Pannes", "Présents", "Effectif"];
    const lines = rows.map((r) =>
      [r.label, Math.round(r.versements), Math.round(r.ca), Math.round(r.prelevement), Math.round(r.depenses), r.pannes, r.present, r.total].join(";")
    );
    const blob = new Blob(["\uFEFF" + [header.join(";"), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spl-recap-${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doDelete = (key: string) => {
    setMenu(null);
    startTransition(async () => {
      await deleteDay(key);
      router.refresh();
    });
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "jour", label: "Jour" },
    { id: "semaine", label: "Semaine" },
    { id: "mois", label: "Mois" },
  ];

  return (
    <div className="card mt-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 pt-4">
        <div>
          <h2 className="section-label !mb-0">Récapitulatifs</h2>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-white/25 hover:text-white"
        >
          <IconDownload width={14} height={14} />
          Exporter CSV
        </button>
      </div>

      <div className="flex gap-1 border-b border-white/5 px-5 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              tab === t.id ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
            {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-[#2f6bff]" />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3 font-semibold">{tab === "mois" ? "Mois" : tab === "semaine" ? "Semaine" : "Date"}</th>
              <th className="px-4 py-3 font-semibold">Versements</th>
              <th className="px-4 py-3 font-semibold">CA</th>
              <th className="px-4 py-3 font-semibold">Prélèvement {rateLabel}%</th>
              <th className="px-4 py-3 font-semibold">Dépenses</th>
              <th className="px-4 py-3 font-semibold">Pannes</th>
              <th className="px-4 py-3 font-semibold">Pointage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                <td className="px-5 py-3.5 font-medium text-slate-200">{r.label}</td>
                <td className="px-4 py-3.5 text-slate-300">{fmt(r.versements)}</td>
                <td className="px-4 py-3.5 text-slate-300">{fmt(r.ca)}</td>
                <td className="px-4 py-3.5 text-slate-400">{fmt(r.prelevement)}</td>
                <td className="px-4 py-3.5 text-slate-300">{fmt(r.depenses)}</td>
                <td className="px-4 py-3.5">
                  <span className={r.pannes > 0 ? "font-semibold text-[#f97316]" : "text-slate-500"}>{r.pannes}</span>
                </td>
                <td className="px-4 py-3.5 text-slate-300">
                  {r.total > 0 ? (
                    <span>
                      {r.present} / {r.total}
                    </span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="relative px-4 py-3.5 text-right">
                  {tab === "jour" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenu(menu === r.key ? null : r.key)}
                        className="rounded p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                        aria-label="Actions"
                      >
                        <IconDots width={16} height={16} />
                      </button>
                      {menu === r.key && (
                        <div className="absolute right-4 top-10 z-10 w-48 rounded-lg border border-white/10 bg-[#0b111d] p-1 shadow-2xl">
                          <button
                            type="button"
                            disabled={pendingKey}
                            onClick={() => doDelete(r.key)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#fca5a5] transition hover:bg-[#ef4444]/10"
                          >
                            <IconTrash width={14} height={14} />
                            {pendingKey ? "Suppression…" : "Supprimer la journée"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 text-center">
        <span className="text-xs text-slate-500">
          {tab === "jour" ? "7 derniers jours" : tab === "semaine" ? "8 dernières semaines" : "6 derniers mois"} · montants en devise de base convertis
        </span>
      </div>
    </div>
  );
}
