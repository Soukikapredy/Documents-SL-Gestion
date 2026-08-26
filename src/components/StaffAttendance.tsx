"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AttendanceStatus, StaffDashboardData, StaffMember } from "@/lib/staff";
import { addEmployee, setEmployeeAttendance, setEmployeePerformance } from "@/app/actions";
import { useMoney } from "@/lib/currency";
import { IconCalendar, IconCheck, IconClipboard } from "./icons";

const STATUS: Record<AttendanceStatus | "non-pointe", { label: string; color: string; bg: string; short: string }> = {
  present: { label: "Présent", color: "#16a34a", bg: "#22c55e18", short: "P" },
  retard: { label: "En retard", color: "#d97706", bg: "#f59e0b18", short: "R" },
  absent: { label: "Absent", color: "#dc2626", bg: "#ef444418", short: "A" },
  conge: { label: "En congé", color: "#2563eb", bg: "#3b82f618", short: "C" },
  "non-pointe": { label: "Non pointé", color: "#64748b", bg: "#64748b18", short: "—" },
};

const DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];

export default function StaffAttendance({ data }: { data: StaffDashboardData }) {
  const { fmt } = useMoney();
  const [selectedId, setSelectedId] = useState(data.members[0]?.id ?? 0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | AttendanceStatus | "non-pointe">("all");
  const selected = data.members.find((m) => m.id === selectedId) ?? data.members[0];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.members.filter(
      (m) =>
        (filter === "all" || m.today === filter) &&
        (!needle || `${m.name} ${m.matricule} ${m.position} ${m.department}`.toLowerCase().includes(needle))
    );
  }, [data.members, query, filter]);

  if (!selected) {
    return (
      <section id="personnel" className="mx-auto max-w-7xl scroll-mt-32 px-4 sm:px-6">
        <div className="card mt-8 p-6 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f6bff]/12 text-[#4d82ff]"><IconClipboard width={26} height={26} /></span>
            <h2 className="font-display mt-4 text-xl font-extrabold text-white">Créez votre équipe</h2>
            <p className="mt-2 text-sm text-slate-500">Ajoutez votre premier travailleur pour commencer le pointage et le suivi des performances.</p>
          </div>
          <EmployeeCreateForm />
        </div>
      </section>
    );
  }

  return (
    <section id="personnel" className="mx-auto max-w-7xl scroll-mt-32 px-4 sm:px-6">
      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-white/5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f6bff]/12 text-[#4d82ff] ring-1 ring-[#2f6bff]/20">
                <IconClipboard width={21} height={21} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-white">Tableau de pointage</h2>
                <p className="mt-0.5 text-xs text-slate-500">Identité, présence et calendrier du personnel · {data.monthLabel}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-300">
              <IconCalendar width={15} height={15} className="text-[#4d82ff]" />
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            <Summary label="Effectif" value={data.summary.total} color="#4d82ff" />
            <Summary label="Présents" value={data.summary.present} color="#22c55e" />
            <Summary label="Retards" value={data.summary.retard} color="#f59e0b" />
            <Summary label="Absents" value={data.summary.absent} color="#ef4444" />
            <Summary label="Congés" value={data.summary.conge} color="#3b82f6" />
            <Summary label="Assiduité" value={`${data.summary.rate.toFixed(0)}%`} color="#22c55e" />
            <Summary label="Tâches du mois" value={data.summary.tasks} color="#a78bfa" />
            <Summary label="Valeur générée" value={fmt(data.summary.generated)} color="#22c55e" />
          </div>
        </div>

        <div className="grid min-h-[610px] lg:grid-cols-[390px_1fr]">
          <aside className="border-b border-white/5 lg:border-b-0 lg:border-r">
            <div className="space-y-3 border-b border-white/5 p-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher nom, poste, matricule…"
                className="input h-10 text-xs"
              />
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(["all", "present", "retard", "absent", "conge"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition ${
                      filter === id ? "bg-[#2f6bff] text-white" : "bg-white/[0.04] text-slate-500 hover:text-white"
                    }`}
                  >
                    {id === "all" ? "Tous" : STATUS[id].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[475px] space-y-1.5 overflow-y-auto p-2.5">
              {filtered.map((member) => (
                <EmployeeRow key={member.id} member={member} active={member.id === selected.id} onSelect={() => setSelectedId(member.id)} />
              ))}
              {filtered.length === 0 && <p className="py-12 text-center text-xs text-slate-500">Aucun employé trouvé.</p>}
            </div>
          </aside>

          <div className="p-5 sm:p-6">
            <EmployeeProfile member={selected} data={data} />
          </div>
        </div>

        <div className="border-t border-white/5 p-5 sm:p-6">
          <DailyAttendanceTable data={data} />
        </div>

        <div className="border-t border-white/5 p-5 sm:p-6">
          <MonthlyRanking members={data.members} />
        </div>

        <div className="border-t border-white/5 p-5 sm:p-6">
          <EmployeeCreateForm compact />
        </div>
      </div>
    </section>
  );
}

function DailyAttendanceTable({ data }: { data: StaffDashboardData }) {
  const { fmt } = useMoney();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const rows = data.dailyRows.filter((r) => r.date === date);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white">Pointage des travailleurs par jour</h3>
          <p className="mt-1 text-[11px] text-slate-500">Identité, présence, temps travaillé et production quotidienne</p>
        </div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input h-9 w-auto text-xs" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-white/[0.035] text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
            <tr><th className="px-4 py-3">Travailleur</th><th className="px-3 py-3">Matricule</th><th className="px-3 py-3">Statut</th><th className="px-3 py-3">Arrivée</th><th className="px-3 py-3">Heures</th><th className="px-3 py-3">Tâches</th><th className="px-4 py-3 text-right">Valeur générée</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => {
              const s = STATUS[row.status];
              return (
                <tr key={`${row.employeeId}-${row.date}`} className="transition hover:bg-white/[0.025]">
                  <td className="px-4 py-3"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={row.photo ?? ""} alt={row.name} className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/10" /><span className="font-bold text-white">{row.name}</span></div></td>
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-500">{row.matricule}</td>
                  <td className="px-3 py-3"><span className="rounded-full px-2 py-1 text-[9px] font-extrabold uppercase" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                  <td className="px-3 py-3 font-semibold text-slate-300">{row.arrivalTime ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-300">{row.hours ? `${row.hours.toFixed(1)} h` : "—"}</td>
                  <td className="px-3 py-3 font-bold text-[#a78bfa]">{row.tasks || "—"}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-[#22c55e]">{row.generated ? fmt(row.generated) : "—"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Aucun pointage enregistré pour cette date.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyRanking({ members }: { members: StaffMember[] }) {
  const { fmt } = useMoney();
  const ranked = [...members].sort((a, b) => b.performanceScore - a.performanceScore || b.generatedAmount - a.generatedAmount);
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white">Performance mensuelle de l’équipe</h3>
        <p className="mt-1 text-[11px] text-slate-500">Classement calculé avec l’assiduité, la ponctualité et les tâches réalisées</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {ranked.map((m, index) => (
          <div key={m.id} className={`relative overflow-hidden rounded-2xl border p-4 ${index === 0 ? "border-[#f59e0b]/35 bg-[#f59e0b]/[0.06]" : "border-white/[0.07] bg-white/[0.02]"}`}>
            <span className="absolute right-3 top-3 font-display text-2xl font-extrabold text-white/[0.08]">#{index + 1}</span>
            <div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={m.photo ?? ""} alt={m.name} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10" /><div className="min-w-0"><p className="truncate text-xs font-extrabold text-white">{m.name}</p><p className="truncate text-[9px] text-slate-500">{m.position}</p></div></div>
            <div className="mt-4 flex items-end justify-between"><div><p className="text-[8px] font-bold uppercase tracking-wider text-slate-600">Score</p><p className={`font-display text-2xl font-extrabold ${m.performanceScore >= 80 ? "text-[#22c55e]" : m.performanceScore >= 60 ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>{m.performanceScore}<span className="text-xs">/100</span></p></div><div className="text-right"><p className="text-[8px] font-bold uppercase text-slate-600">Généré</p><p className="text-xs font-extrabold text-[#22c55e]">{fmt(m.generatedAmount)}</p></div></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-[#2f6bff] to-[#22c55e]" style={{ width: `${m.performanceScore}%` }} /></div>
            <div className="mt-3 grid grid-cols-3 gap-1 text-center"><Mini label="Jours" value={m.workedDays} color="#4d82ff" /><Mini label="Tâches" value={m.tasksCompleted} color="#a78bfa" /><Mini label="Heures" value={Math.round(m.hoursWorked)} color="#22c55e" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Summary({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-3">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="font-display mt-1 text-xl font-extrabold" style={{ color }}>{value}</p>
    </div>
  );
}

function EmployeeRow({ member, active, onSelect }: { member: StaffMember; active: boolean; onSelect: () => void }) {
  const status = STATUS[member.today];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        active ? "border-[#2f6bff]/35 bg-[#2f6bff]/10 shadow-sm" : "border-transparent hover:border-white/8 hover:bg-white/[0.035]"
      }`}
    >
      <span className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={member.photo ?? ""} alt={member.name} className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10" />
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[#0a0f1a]" style={{ backgroundColor: status.color }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold text-white">{member.name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-slate-500">{member.position}</span>
        <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase" style={{ color: status.color, background: status.bg }}>{status.label}</span>
      </span>
      <span className="text-right">
        <span className="block text-[11px] font-bold text-slate-300">{member.rate.toFixed(0)}%</span>
        <span className="text-[9px] text-slate-600">assiduité</span>
      </span>
    </button>
  );
}

function EmployeeProfile({ member, data }: { member: StaffMember; data: StaffDashboardData }) {
  const router = useRouter();
  const { fmt, rate, symbol } = useMoney();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [perfSaved, setPerfSaved] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tasks, setTasks] = useState("8");
  const [hours, setHours] = useState("8");
  const [generated, setGenerated] = useState("1000");
  const [note, setNote] = useState("");
  const status = STATUS[member.today];

  const setStatus = (next: AttendanceStatus) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("employeeId", String(member.id));
      fd.set("date", date);
      fd.set("status", next);
      if (next === "present") fd.set("arrivalTime", "08:00");
      if (next === "retard") fd.set("arrivalTime", "09:30");
      await setEmployeeAttendance(fd);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1600);
    });
  };

  const savePerformance = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("employeeId", String(member.id));
      fd.set("date", date);
      fd.set("tasks", tasks);
      fd.set("hours", hours);
      fd.set("generated", String(Number(generated.replace(",", ".")) / rate));
      fd.set("note", note);
      const result = await setEmployeePerformance(fd);
      if (result.ok) {
        setPerfSaved(true);
        router.refresh();
        setTimeout(() => setPerfSaved(false), 1600);
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={member.photo ?? ""} alt={member.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-xl ring-2 ring-white/10" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-extrabold text-white">{member.name}</h3>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase" style={{ color: status.color, background: status.bg }}>{status.label}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#4d82ff]">{member.position}</p>
            <p className="mt-1 text-xs text-slate-500">{member.department} · {member.matricule}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
              <span>{member.phone}</span><span>{member.email}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3 text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500">Score mensuel</p>
            <p className="font-display mt-1 text-2xl font-extrabold text-[#22c55e]">{member.performanceScore}<span className="text-[10px]">/100</span></p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3 py-3 text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500">Valeur générée</p>
            <p className="mt-2 text-sm font-extrabold text-[#22c55e]">{fmt(member.generatedAmount)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_250px]">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-white">Calendrier de présence</p><p className="mt-0.5 text-[10px] text-slate-500">{data.monthLabel}</p></div>
            <div className="hidden items-center gap-2 text-[9px] sm:flex">
              {(["present", "retard", "absent", "conge"] as AttendanceStatus[]).map((s) => <span key={s} className="flex items-center gap-1 text-slate-500"><i className="h-2 w-2 rounded-full" style={{ background: STATUS[s].color }} />{STATUS[s].label}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_NAMES.map((d, i) => <div key={`${d}-${i}`} className="pb-1 text-center text-[9px] font-extrabold text-slate-600">{d}</div>)}
            {Array.from({ length: data.firstDay }).map((_, i) => <span key={`e-${i}`} />)}
            {Array.from({ length: data.daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${data.monthKey}-${String(day).padStart(2, "0")}`;
              const s = member.calendar[key];
              const future = day > data.todayDay;
              return (
                <div key={day} className={`relative flex aspect-square items-center justify-center rounded-lg border text-[10px] font-bold ${day === data.todayDay ? "border-[#4d82ff] ring-1 ring-[#4d82ff]/30" : "border-white/[0.05]"} ${future ? "text-slate-700" : "text-slate-300"}`} style={s ? { background: STATUS[s].bg, color: STATUS[s].color, borderColor: `${STATUS[s].color}35` } : undefined} title={s ? STATUS[s].label : "Non pointé"}>
                  {day}{s && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: STATUS[s].color }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white">Pointage rapide</p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">Sélectionnez la date puis le statut de {member.firstName}.</p>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input mt-4 h-9 text-xs" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["present", "retard", "absent", "conge"] as AttendanceStatus[]).map((s) => (
              <button key={s} type="button" disabled={pending} onClick={() => setStatus(s)} className="rounded-lg border px-2 py-2.5 text-[10px] font-extrabold uppercase transition hover:-translate-y-0.5 disabled:opacity-50" style={{ color: STATUS[s].color, background: STATUS[s].bg, borderColor: `${STATUS[s].color}30` }}>{STATUS[s].label}</button>
            ))}
          </div>
          {saved && <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#22c55e]"><IconCheck width={13} height={13} /> Pointage enregistré</p>}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
            <Mini label="Présences" value={member.counts.present} color="#22c55e" />
            <Mini label="Retards" value={member.counts.retard} color="#f59e0b" />
            <Mini label="Absences" value={member.counts.absent} color="#ef4444" />
            <Mini label="Congés" value={member.counts.conge} color="#3b82f6" />
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white">Performance du jour</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label><span className="mb-1 block text-[8px] font-bold uppercase text-slate-600">Tâches</span><input type="number" min={0} value={tasks} onChange={(e) => setTasks(e.target.value)} className="input h-8 text-xs" /></label>
              <label><span className="mb-1 block text-[8px] font-bold uppercase text-slate-600">Heures</span><input type="number" min={0} max={24} step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} className="input h-8 text-xs" /></label>
            </div>
            <label className="mt-2 block"><span className="mb-1 block text-[8px] font-bold uppercase text-slate-600">Valeur générée ({symbol})</span><input inputMode="decimal" value={generated} onChange={(e) => setGenerated(e.target.value)} className="input h-8 text-xs" /></label>
            <label className="mt-2 block"><span className="mb-1 block text-[8px] font-bold uppercase text-slate-600">Note</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. objectif atteint" className="input h-8 text-xs" /></label>
            <button type="button" disabled={pending} onClick={savePerformance} className="mt-3 w-full rounded-lg bg-[#2f6bff] py-2 text-[10px] font-extrabold uppercase text-white transition hover:bg-[#1f5af0] disabled:opacity-50">Enregistrer la performance</button>
            {perfSaved && <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-[#22c55e]"><IconCheck width={12} height={12} /> Performance enregistrée</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeCreateForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_s: { ok: boolean; error?: string } | null, fd: FormData) => addEmployee(fd),
    null
  );
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
  return (
    <div className={compact ? "" : "mx-auto mt-7 max-w-2xl"}>
      <div className="mb-3"><h3 className="text-xs font-extrabold uppercase tracking-wider text-white">{compact ? "Ajouter un travailleur" : "Premier travailleur"}</h3><p className="mt-1 text-[11px] text-slate-500">Une photo d’identité illustrative sera attribuée automatiquement.</p></div>
      <form action={action} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input name="firstName" required placeholder="Prénom" className="input" />
        <input name="lastName" required placeholder="Nom" className="input" />
        <input name="position" required placeholder="Poste" className="input" />
        <input name="department" required placeholder="Département" className="input" />
        <input name="phone" placeholder="Téléphone (optionnel)" className="input" />
        <input name="email" type="email" placeholder="E-mail (optionnel)" className="input" />
        <button disabled={pending} className="rounded-lg bg-[#2f6bff] px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60 sm:col-span-2">{pending ? "Ajout…" : "Ajouter à mon équipe"}</button>
      </form>
      {state && !state.ok && <p className="mt-2 text-xs font-semibold text-red-400">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-xs font-semibold text-[#22c55e]">Travailleur ajouté.</p>}
    </div>
  );
}

function Mini({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="rounded-lg bg-white/[0.03] px-2 py-2 text-center"><p className="text-lg font-extrabold" style={{ color }}>{value}</p><p className="text-[8px] font-bold uppercase text-slate-600">{label}</p></div>;
}
