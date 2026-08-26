"use client";

import { useEffect, useRef, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMoney } from "@/lib/currency";
import type { JournalEntry } from "@/lib/aggregate";
import { saveEntry, removeEntry } from "@/app/actions";
import { IconDots, IconPencil, IconTrash, IconX, IconCheck } from "./icons";

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

function chipOf(e: JournalEntry): { label: string; color: string } {
  if (e.kind === "versement") return { label: "Versement", color: "#22c55e" };
  if (e.kind === "ca") return { label: "CA brut", color: "#4d82ff" };
  if (e.kind === "pointage") return { label: "Pointage", color: "#8b96ab" };
  const c = e.category ?? "divers";
  return { label: CAT_LABELS[c] ?? "Dépense", color: CAT_COLORS[c] ?? "#8b96ab" };
}

type KindFilter = "all" | "versement" | "ca" | "depense" | "pointage";

export default function Journal({ entries }: { entries: JournalEntry[] }) {
  const { fmt } = useMoney();
  const [menu, setMenu] = useState<number | null>(null);
  const [armed, setArmed] = useState<number | null>(null);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [q, setQ] = useState("");
  const [fk, setFk] = useState<KindFilter>("all");
  const router = useRouter();
  const [pendingDel, startDel] = useTransition();

  const filtered = entries.filter(
    (e) =>
      (fk === "all" || e.kind === fk) &&
      (q.trim() === "" || e.designation.toLowerCase().includes(q.trim().toLowerCase()))
  );

  const doDelete = (e: JournalEntry) => {
    setMenu(null);
    setArmed(null);
    startDel(async () => {
      const fd = new FormData();
      fd.set("kind", e.kind);
      fd.set("id", String(e.id));
      await removeEntry(fd);
      router.refresh();
    });
  };

  return (
    <div className="card mt-4 overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <h3 className="section-label !mb-0">Journal des écritures</h3>
        <span className="text-[11px] text-slate-500">20 plus récentes · modifiables</span>
      </div>
      <p className="px-5 pt-1 text-xs text-slate-500">
        Chaque mise à jour (versement, CA, dépense, pointage) peut être modifiée ou supprimée.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 px-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher une désignation…"
          className="input h-8 max-w-xs text-xs"
        />
        <select
          value={fk}
          onChange={(e) => setFk(e.target.value as KindFilter)}
          className="input h-8 w-auto text-xs"
        >
          <option value="all">Tous les types</option>
          <option value="versement">Versements</option>
          <option value="ca">CA brut</option>
          <option value="depense">Dépenses</option>
          <option value="pointage">Pointages</option>
        </select>
        <span className="ml-auto text-[11px] text-slate-500">
          {filtered.length} / {entries.length} écritures
        </span>
      </div>

      <ul className="mt-3 divide-y divide-white/5">
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-slate-500">
            Aucune écriture ne correspond à votre recherche.
          </li>
        )}
        {filtered.map((e) => {
          const chip = chipOf(e);
          return (
            <li key={`${e.kind}-${e.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.03]">
              <span
                className="w-24 shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-wide"
                style={{ color: chip.color, backgroundColor: `${chip.color}1a` }}
              >
                {chip.label}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-200">{e.designation}</p>
                <p className="text-[11px] text-slate-500">{e.date.split("-").reverse().join("/")}</p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-slate-100">
                {e.kind === "pointage" ? `${e.present} / ${e.total}` : fmt(e.amount)}
              </span>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(menu === e.id ? null : e.id);
                    setArmed(null);
                  }}
                  className="rounded p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  aria-label="Actions sur l'écriture"
                >
                  <IconDots width={16} height={16} />
                </button>
                {menu === e.id && (
                  <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-white/10 bg-[#0b111d] p-1 shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(null);
                        setEditing(e);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-white/5"
                    >
                      <IconPencil width={14} height={14} /> Modifier
                    </button>
                    {armed === e.id ? (
                      <button
                        type="button"
                        disabled={pendingDel}
                        onClick={() => doDelete(e)}
                        className="flex w-full items-center gap-2 rounded-md bg-[#ef4444]/15 px-3 py-2 text-left text-xs font-semibold text-[#fca5a5]"
                      >
                        <IconTrash width={14} height={14} />
                        {pendingDel ? "Suppression…" : "Confirmer ?"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setArmed(e.id)}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-[#fca5a5] transition hover:bg-[#ef4444]/10"
                      >
                        <IconTrash width={14} height={14} /> Supprimer
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {editing && <EditModal entry={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditModal({ entry, onClose }: { entry: JournalEntry; onClose: () => void }) {
  const { fmt, rate, symbol } = useMoney();
  const router = useRouter();
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chip = chipOf(entry);

  const [state, formAction, pending] = useActionState(
    async (_s: { ok: boolean; error?: string } | null, fd: FormData) => {
      fd.set("kind", entry.kind);
      fd.set("id", String(entry.id));
      const raw = fd.get("amount");
      if (typeof raw === "string" && raw.trim()) {
        const n = Number(raw.replace(/\s/g, "").replace(",", "."));
        if (Number.isFinite(n)) fd.set("amount", String(Math.round((n / rate) * 100) / 100));
      }
      return saveEntry(fd);
    },
    null
  );

  useEffect(() => {
    if (state?.ok) {
      setDone(true);
      router.refresh();
      timer.current = setTimeout(onClose, 1200);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, router, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const amountInCurrency = Math.round(entry.amount * rate * 100) / 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b111d] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">Modifier l'écriture</h3>
            <p className="mt-0.5 text-xs" style={{ color: chip.color }}>
              {chip.label} · {entry.date.split("-").reverse().join("/")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Fermer"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
              <IconCheck width={24} height={24} />
            </span>
            <p className="text-sm font-semibold text-white">Mise à jour enregistrée</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {entry.kind !== "pointage" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Désignation</span>
                <input name="designation" defaultValue={entry.designation} required className="input" />
              </label>
            )}

            {entry.kind === "depense" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Catégorie</span>
                <select name="category" defaultValue={entry.category ?? "divers"} className="input">
                  <option value="panne">Panne</option>
                  <option value="pieces">Pièces détachées</option>
                  <option value="entretien">Entretien</option>
                  <option value="divers">Divers</option>
                </select>
              </label>
            )}

            {entry.kind !== "pointage" ? (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-400">Montant ({symbol})</span>
                <input
                  name="amount"
                  inputMode="decimal"
                  required
                  defaultValue={amountInCurrency}
                  className="input"
                />
                <span className="mt-1 block text-[11px] text-slate-600">≈ {fmt(entry.amount)} actuellement</span>
              </label>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Présents</span>
                  <input name="present" type="number" min={0} defaultValue={entry.present} required className="input" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-400">Effectif total</span>
                  <input name="total" type="number" min={1} defaultValue={entry.total} required className="input" />
                </label>
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-400">Date</span>
              <input name="date" type="date" defaultValue={entry.date} required className="input" />
            </label>

            {state && !state.ok && (
              <p className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs font-medium text-[#fca5a5]">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2f6bff] py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f5af0] disabled:opacity-60"
            >
              {pending ? "Enregistrement…" : "Enregistrer la mise à jour"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
