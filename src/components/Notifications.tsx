"use client";

import { useState } from "react";
import type { AppAlert } from "@/lib/alerts";
import { IconBell, IconX } from "./icons";

const LEVEL_COLOR: Record<AppAlert["level"], string> = {
  warn: "#f97316",
  info: "#4d82ff",
  success: "#22c55e",
};

export default function Notifications({ alerts }: { alerts: AppAlert[] }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const unread = read ? 0 : alerts.filter((a) => a.level === "warn").length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="control-pill group"
        aria-label="Notifications"
      >
        <span className="control-icon bg-[#f97316]/12 text-[#fb923c]">
          <IconBell width={16} height={16} />
        </span>
        <span className="min-w-0 text-left leading-none">
          <span className="control-kicker">Alertes</span>
          <span className="control-value">{unread > 0 ? `${unread} à vérifier` : "Tout est à jour"}</span>
        </span>
        <span className={`ml-1 h-2 w-2 rounded-full ${unread > 0 ? "animate-pulse bg-[#f97316]" : "bg-[#22c55e]"}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-white/10 bg-[#0b111d] p-2 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => setRead(true)}
                  className="text-[11px] font-semibold text-[#4d82ff] hover:text-[#7aa2ff]"
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
              {alerts.map((a) => (
                <li key={a.id} className="flex gap-2.5 px-2 py-2.5">
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: LEVEL_COLOR[a.level] }}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-white">{a.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{a.message}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-end px-2 pt-1.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-white"
              >
                <IconX width={12} height={12} /> Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
