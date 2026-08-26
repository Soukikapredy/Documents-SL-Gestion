import { db } from "@/db";
import { versements, caEntries, depenses, pointages, settings } from "@/db/schema";
import { and, gte, eq } from "drizzle-orm";

export interface AppAlert {
  id: string;
  level: "warn" | "info" | "success";
  title: string;
  message: string;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/** Calcule les alertes du tableau de bord à partir des données réelles. */
export async function getAlerts(userId: number): Promise<AppAlert[]> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const prevMonthEnd = addDays(monthStart, -1);
  const prevMonthStart = new Date(Date.UTC(prevMonthEnd.getUTCFullYear(), prevMonthEnd.getUTCMonth(), 1));
  const yearStart = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  const weekAgo = addDays(today, -6);

  const [vMonth, dSincePrev, pWeek, setRows, vToday, caYear] = await Promise.all([
    db.select().from(versements).where(and(eq(versements.userId, userId), gte(versements.date, monthStart))),
    db.select().from(depenses).where(and(eq(depenses.userId, userId), gte(depenses.date, prevMonthStart))),
    db.select().from(pointages).where(and(eq(pointages.userId, userId), gte(pointages.date, weekAgo))),
    db.select().from(settings).where(eq(settings.userId, userId)).limit(1),
    db.select().from(versements).where(and(eq(versements.userId, userId), eq(versements.date, today))),
    db.select().from(caEntries).where(and(eq(caEntries.userId, userId), gte(caEntries.date, yearStart))),
  ]);

  const alerts: AppAlert[] = [];
  const num = (x: string | number) => Number(x ?? 0);
  const inMonth = (d: Date) => d >= monthStart;

  // Pannes du mois
  const pannesMonth = dSincePrev.filter((r) => r.category === "panne" && inMonth(r.date)).length;
  if (pannesMonth >= 5) {
    alerts.push({
      id: "pannes",
      level: "warn",
      title: "Activité pannes élevée",
      message: `${pannesMonth} pannes déclarées ce mois-ci. Vérifiez la maintenance de la flotte.`,
    });
  }

  // Dépenses en hausse
  const depMonth = dSincePrev.filter((r) => inMonth(r.date)).reduce((s, r) => s + num(r.amount), 0);
  const depPrev = dSincePrev.filter((r) => !inMonth(r.date)).reduce((s, r) => s + num(r.amount), 0);
  if (depPrev > 0 && depMonth > depPrev * 1.1) {
    alerts.push({
      id: "depenses",
      level: "warn",
      title: "Dépenses en hausse",
      message: `Les dépenses du mois dépassent de ${Math.round(((depMonth - depPrev) / depPrev) * 100)}% le mois précédent.`,
    });
  }

  // Pointage faible
  let pr = 0;
  let tt = 0;
  for (const r of pWeek) {
    pr += r.present;
    tt += r.total;
  }
  const attendance = tt > 0 ? (pr / tt) * 100 : 100;
  if (attendance < 90) {
    alerts.push({
      id: "pointage",
      level: "warn",
      title: "Taux de présence faible",
      message: `Présence moyenne de ${attendance.toFixed(0)}% sur 7 jours (seuil : 90%).`,
    });
  }

  // Retard d'objectif
  const objective = setRows[0] ? num(setRows[0].objectiveCa) : 2_500_000;
  const realized = caYear.reduce((s, r) => s + num(r.amount), 0);
  const expected = ((today.getUTCMonth() + 1) / 12) * objective;
  if (objective > 0 && realized < expected * 0.9) {
    alerts.push({
      id: "objectif",
      level: "info",
      title: "Objectif annuel en retard",
      message: `CA réalisé à ${Math.round((realized / objective) * 100)}% de l'objectif, sous la trajectoire attendue.`,
    });
  }

  // Aucune saisie aujourd'hui
  if (vToday.length === 0) {
    alerts.push({
      id: "saisie",
      level: "info",
      title: "Aucune saisie aujourd'hui",
      message: "Aucun versement enregistré pour la journée en cours.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "ok",
      level: "success",
      title: "Tout est sous contrôle",
      message: "Aucune anomalie détectée sur vos indicateurs.",
    });
  }

  return alerts;
}
