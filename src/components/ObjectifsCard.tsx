"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMoney } from "@/lib/currency";
import type { DashboardData } from "@/lib/aggregate";
import { updateObjective } from "@/app/actions";
import { IconPencil, IconCheck, IconArrowRight } from "./icons";

export default function ObjectifsCard({ objectifs }: { objectifs: DashboardData["objectifs"] }) {
  const { fmt, rate, symbol } = useMoney();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const pct = objectifs.pct;

  const [state, formAction, pending] = useActionState(
    async (_s: { ok: boolean; error?: string } | null, fd: FormData) => {
      const raw = String(fd.get("objective") ?? "");
      const n = Number(raw.replace(/\s/g, "").replace(",", "."));
      if (!Number.isFinite(n) || n <= 0) return { ok: false, error: "Montant invalide." };
      fd.set("objective", String(Math.round(n / rate)));
      return updateObjective(fd);
    },
    null
  );

  useEffect(() => {
    if (state?.ok) {
      setEditing(false);
      router.refresh();
    }
  }, [state, router]);

  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * c;

  return (
    <div className="card p-5">
      <h3 className="section-label">Objectifs fin d'année</h3>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#22c55e"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${c - filled}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-extrabold text-white">{Math.round(pct)}%</span>
            <span className="text-[10px] text-slate-500">Objectif atteint</span>
          </div>
        </div>

        <dl className="w-full space-y-3 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Objectif CA</dt>
            <dd className="font-semibold text-white">
              {editing ? (
                <form action={formAction} className="flex items-center gap-1.5">
                  <input
                    name="objective"
                    inputMode="numeric"
                    defaultValue={Math.round(objectifs.objective * rate)}
                    className="h-7 w-32 rounded-md border border-white/15 bg-white/5 px-2 text-right text-xs font-semibold text-white outline-none focus:border-[#2f6bff]"
                  />
                  <span className="text-xs text-slate-500">{symbol}</span>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-[#22c55e] text-white transition hover:bg-[#16a34a] disabled:opacity-50"
                    aria-label="Enregistrer l'objectif"
                  >
                    <IconCheck width={14} height={14} />
                  </button>
                </form>
              ) : (
                <span className="inline-flex items-center gap-2">
                  {fmt(objectifs.objective)}
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    className="text-slate-500 transition hover:text-white"
                    aria-label="Modifier l'objectif"
                  >
                    <IconPencil width={13} height={13} />
                  </button>
                </span>
              )}
            </dd>
          </div>
          {state && !state.ok && <p className="text-xs text-[#fca5a5]">{state.error}</p>}
          <div className="flex items-center justify-between">
            <dt className="text-slate-400">CA réalisé</dt>
            <dd className="font-semibold text-[#22c55e]">{fmt(objectifs.realized)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-400">Reste à réaliser</dt>
            <dd className="font-semibold text-slate-100">{fmt(objectifs.remaining)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-[#22c55e]" style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {objectifs.monthsLeft > 0 ? `${objectifs.monthsLeft} mois restants` : "Dernier mois de l'exercice"}
        </p>
      </div>

      <a
        href="#rapports"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4d82ff] transition hover:text-[#7aa2ff]"
      >
        Voir le détail des objectifs <IconArrowRight width={13} height={13} />
      </a>
    </div>
  );
}
