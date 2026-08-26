"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  addVersement,
  addCa,
  addDepense,
  addPointage,
} from "@/app/actions";
import { useMoney, CURRENCY_LABELS } from "@/lib/currency";
import {
  IconCoins,
  IconChart,
  IconClipboard,
  IconReceipt,
  IconWrench,
  IconX,
  IconCheck,
} from "./icons";

type Kind = "versement" | "ca" | "pointage" | "depense" | "panne";

const todayIso = () => new Date().toISOString().slice(0, 10);

const CARDS: { kind: Kind; title: string; sub: string; color: string; Icon: typeof IconCoins }[] = [
  { kind: "versement", title: "Versement", sub: "Enregistrer un versement", color: "#22c55e", Icon: IconCoins },
  { kind: "ca", title: "CA Hebdomadaire", sub: "Saisir le CA de la semaine", color: "#4d82ff", Icon: IconChart },
  { kind: "pointage", title: "Pointage", sub: "Saisir le pointage du jour", color: "#4d82ff", Icon: IconClipboard },
  { kind: "depense", title: "Dépense", sub: "Enregistrer une dépense", color: "#4d82ff", Icon: IconReceipt },
  { kind: "panne", title: "Panne", sub: "Déclarer une panne", color: "#f97316", Icon: IconWrench },
];

export default function QuickEntry({ staffTotal = 25 }: { staffTotal?: number }) {
  const [open, setOpen] = useState<Kind | null>(null);

  return (
    <section id="operations" className="mx-auto max-w-7xl scroll-mt-20 px-4 print:hidden sm:px-6">
      <div className="card mt-8 p-5 sm:p-6">
        <h2 className="section-label">Saisie rapide</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map(({ kind, title, sub, color, Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => setOpen(kind)}
              className="group flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ color, backgroundColor: `${color}1a` }}
              >
                <Icon width={18} height={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{title}</span>
                <span className="mt-0.5 block text-xs" style={{ color }}>
                  {sub}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {open && <EntryModal kind={open} staffTotal={staffTotal} onClose={() => setOpen(null)} />}
    </section>
  );
}

function EntryModal({ kind, staffTotal, onClose }: { kind: Kind; staffTotal: number; onClose: () => void }) {
  const meta = CARDS.find((c) => c.kind === kind)!;
  const router = useRouter();
  const { fmt, rate, symbol, currency } = useMoney();
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const actionFor = { versement: addVersement, ca: addCa, pointage: addPointage, depense: addDepense, panne: addDepense };

  const [state, formAction, pending] = useActionState(
    async (_prev: { ok: boolean; error?: string } | null, fd: FormData) => {
      if (kind === "panne") fd.set("category", "panne");
      // conversion devise active -> EUR (devise de base)
      const raw = fd.get("amount");
      if (typeof raw === "string" && raw.trim()) {
        const n = Number(raw.replace(/\s/g, "").replace(",", "."));
        if (Number.isFinite(n)) fd.set("amount", String(Math.round((n / rate) * 100) / 100));
      }
      return actionFor[kind](fd);
    },
    null
  );

  useEffect(() => {
    if (state?.ok) {
      setDone(true);
      router.refresh();
      timer.current = setTimeout(onClose, 1400);
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

  const num = Number(amount.replace(/\s/g, "").replace(",", "."));
  const preview = amount.trim() && Number.isFinite(num) ? fmt(num / rate) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b111d] p-6 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ color: meta.color, backgroundColor: `${meta.color}1a` }}
            >
              <meta.Icon width={19} height={19} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-white">{meta.title}</h3>
              <p className="text-xs text-slate-500">{meta.sub}</p>
            </div>
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
            <p className="text-sm font-semibold text-white">Enregistrement réussi</p>
            <p className="text-xs text-slate-500">Le tableau de bord est à jour.</p>
          </div>
        ) : (
          <form
            action={formAction}
            className="space-y-4"
            onSubmit={(e) => {
              // validation basique côté client
              const fd = new FormData(e.currentTarget);
              if (kind !== "pointage") {
                const raw = String(fd.get("amount") ?? "");
                const n = Number(raw.replace(/\s/g, "").replace(",", "."));
                if (!Number.isFinite(n) || n <= 0) {
                  e.preventDefault();
                  return;
                }
              }
            }}
          >
            {kind !== "pointage" && (
              <Field label="Désignation" required={kind !== "ca"}>
                <input
                  name="designation"
                  required={kind !== "ca"}
                  placeholder={
                    kind === "versement"
                      ? "Ex. Versement agence centrale"
                      : kind === "ca"
                        ? "CA brut hebdomadaire"
                        : kind === "panne"
                          ? "Ex. Panne moteur ligne 4"
                          : "Ex. Achat plaquettes de frein"
                  }
                  className="input"
                />
              </Field>
            )}

            {kind === "depense" && (
              <Field label="Catégorie">
                <select name="category" className="input">
                  <option value="pieces">Pièces détachées</option>
                  <option value="entretien">Entretien</option>
                  <option value="divers">Divers</option>
                </select>
              </Field>
            )}

            {kind !== "pointage" ? (
              <Field label={`Montant (${CURRENCY_LABELS[currency]})`}>
                <div className="relative">
                  <input
                    name="amount"
                    inputMode="decimal"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="input pr-12"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    {symbol}
                  </span>
                </div>
                {preview && <p className="mt-1.5 text-xs text-slate-500">≈ {preview} (devise de base)</p>}
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Présents">
                  <input name="present" type="number" min={0} max={500} defaultValue={Math.max(0, staffTotal - 2)} required className="input" />
                </Field>
                <Field label="Effectif total">
                  <input name="total" type="number" min={1} max={500} defaultValue={staffTotal} required className="input" />
                </Field>
              </div>
            )}

            <Field label="Date">
              <input name="date" type="date" defaultValue={todayIso()} required className="input" />
            </Field>

            {kind === "pointage" && (
              <Field label="Note (optionnel)">
                <input name="note" placeholder="Ex. 2 absences justifiées" className="input" />
              </Field>
            )}

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
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-400">
        {label} {required && <span className="text-[#f97316]">*</span>}
      </span>
      {children}
    </label>
  );
}
