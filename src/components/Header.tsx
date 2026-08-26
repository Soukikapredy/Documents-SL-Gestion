"use client";

import { useState } from "react";
import type { AppAlert } from "@/lib/alerts";
import Notifications from "./Notifications";
import ThemePicker from "./ThemePicker";
import CurrencyPicker from "./CurrencyPicker";
import PwaInstaller from "./PwaInstaller";
import { IconGear, IconMenu, IconX, Logo } from "./icons";

const NAV = [
  { href: "#top", label: "Tableau de bord" },
  { href: "#operations", label: "Opérations" },
  { href: "#charges", label: "Charges" },
  { href: "#personnel", label: "Personnel" },
  { href: "#bilan", label: "Bilan" },
  { href: "#objectifs", label: "Objectifs" },
  { href: "#rapports", label: "Rapports" },
];

export default function Header({ alerts }: { alerts: AppAlert[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05070c]/88 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo />
        </a>

        <nav className="hidden items-center rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 lg:flex">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} className={`rounded-lg px-3 py-2 text-[12px] font-semibold transition-all ${i === 0 ? "bg-[#2f6bff]/12 text-white shadow-sm ring-1 ring-[#2f6bff]/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="max-w-[180px] text-right leading-tight">
              <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.1em] text-white">SL GESTION DE SUIVIE</p>
              <p className="mt-0.5 truncate text-[10px] font-medium text-[#22c55e]">● Accès direct</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b75ff] to-[#1d4ed8] text-[11px] font-extrabold text-white shadow-lg shadow-[#2f6bff]/20 ring-1 ring-white/15">SL</div>
          </div>

          <button type="button" onClick={() => setOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden" aria-label="Menu">
            {open ? <IconX width={18} height={18} /> : <IconMenu width={18} height={18} />}
          </button>
        </div>
      </div>

      <div className="border-t border-white/[0.05] bg-black/10">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6">
          <div className="hidden shrink-0 items-center gap-2 pr-1 xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4d82ff] shadow-[0_0_8px_#4d82ff]" />
            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Centre de commandes</span>
          </div>
          <div className="flex min-w-max flex-1 items-center gap-2 xl:justify-end">
            <PwaInstaller />
            <ThemePicker />
            <CurrencyPicker />
            <a href="#parametres" className="control-pill group" title="Ouvrir les paramètres">
              <span className="control-icon bg-[#64748b]/12 text-slate-400 transition group-hover:rotate-45 group-hover:text-white"><IconGear width={16} height={16} /></span>
              <span className="min-w-0 leading-none"><span className="control-kicker">Configuration</span><span className="control-value">Paramètres</span></span>
            </a>
            <Notifications alerts={alerts} />
          </div>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/5 bg-[#070a12] px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white">{n.label}</a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
