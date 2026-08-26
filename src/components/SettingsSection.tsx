"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMoney, CURRENCY_LABELS, type Currency } from "@/lib/currency";
import { updateSettings, resetData } from "@/app/actions";
import { IconGear, IconCheck, IconTrash } from "./icons";

export default function SettingsSection({
  settings,
  objective,
}: {
  settings: { currency: string; ratePct: number; staffTotal: number };
  objective: number;
}) {
  const { rate, symbol } = useMoney();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [armedReset, setArmedReset] = useState(false);
  const [resetMsg, setResetMsg] = useState("");
  const [pendingReset, startReset] = useTransition();

  const doReset = () => {
    setArmedReset(false);
    startReset(async () => {
      await resetData();
      router.refresh();
      setResetMsg("Données de démonstration rechargées.");
      setTimeout(() => setResetMsg(""), 3000);
    });
  };

  const [state, formAction, pending] = useActionState(
    async (_s: { ok: boolean; error?: string } | null, fd: FormData) => {
      const raw = String(fd.get("objective") ?? "");
      const n = Number(raw.replace(/\s/g, "").replace(",", "."));
      if (Number.isFinite(n) && n > 0) fd.set("objective", String(Math.round(n / rate)));
      return updateSettings(fd);
    },
    null
  );

  useEffect(() => {
    if (state?.ok) {
      setSaved(true);
      router.refresh();
      const t = setTimeout(() => setSaved(false), 2600);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <section id="parametres" className="mx-auto max-w-7xl scroll-mt-24 px-4 print:hidden sm:px-6">
      <div className="card mt-8 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4d82ff]/15 text-[#4d82ff]">
              <IconGear width={18} height={18} />
            </span>
            <div>
              <h2 className="section-label !mb-0">Paramètres</h2>
              <p className="text-xs text-slate-500">Configuration globale du tableau de bord</p>
            </div>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22c55e]/15 px-3 py-1 text-xs font-semibold text-[#22c55e]">
              <IconCheck width={13} height={13} /> Paramètres enregistrés
            </span>
          )}
        </div>

        <form action={formAction} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-400">Devise par défaut</span>
            <select name="currency" defaultValue={settings.currency} className="input">
              {(Object.keys(CURRENCY_LABELS) as Currency[]).map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_LABELS[c]}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-slate-600">Appliquée au chargement</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-400">Taux de prélèvement (%)</span>
            <input name="rate" type="number" min={0} max={100} step={0.1} defaultValue={settings.ratePct} className="input" />
            <span className="mt-1 block text-[11px] text-slate-600">Appliqué sur les recettes</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-400">Effectif de référence</span>
            <input name="staffTotal" type="number" min={1} max={500} defaultValue={settings.staffTotal} className="input" />
            <span className="mt-1 block text-[11px] text-slate-600">Valeur par défaut du pointage</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-400">Objectif CA annuel ({symbol})</span>
            <input name="objective" type="number" min={0} step={1000} defaultValue={Math.round(objective * rate)} className="input" />
            <span className="mt-1 block text-[11px] text-slate-600">Objectif de fin d'année</span>
          </label>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2f6bff] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f5af0] disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
            </button>
            {state && !state.ok && <span className="text-xs text-[#fca5a5]">{state.error}</span>}
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
          <div>
            <p className="text-sm font-semibold text-white">Données de démonstration</p>
            <p className="text-xs text-slate-500">
              Efface toutes les saisies et recharge le jeu de données de démonstration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {resetMsg && <span className="text-xs font-semibold text-[#22c55e]">{resetMsg}</span>}
            {armedReset ? (
              <button
                type="button"
                disabled={pendingReset}
                onClick={doReset}
                className="inline-flex items-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#dc2626] disabled:opacity-60"
              >
                <IconTrash width={14} height={14} />
                {pendingReset ? "Réinitialisation…" : "Confirmer la réinitialisation"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setArmedReset(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-2 text-sm font-semibold text-[#fca5a5] transition hover:bg-[#ef4444]/20"
              >
                <IconTrash width={14} height={14} />
                Réinitialiser les données
              </button>
            )}
            {armedReset && (
              <button
                type="button"
                onClick={() => setArmedReset(false)}
                className="text-xs font-medium text-slate-500 hover:text-white"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
