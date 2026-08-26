import { db } from "./index";
import { versements, caEntries, depenses, pointages, settings, employees, attendance, employeePerformance } from "./schema";

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERS_LABELS = ["Versement agence centrale", "Recettes point de vente Nord", "Recettes lignes interurbaines", "Versement station portuaire", "Recettes contrats entreprises"];
const CA_LABELS = ["CA brut journalier", "CA brut exploitation", "CA brut activités"];
const DEP_LABELS: Record<string, string[]> = {
  pieces: ["Achat plaquettes de frein", "Filtres + huile moteur", "Pneumatiques avant", "Pièces alternateur"],
  entretien: ["Entretien périodique véhicule", "Révision générale", "Nettoyage industriel", "Contrôle technique"],
  divers: ["Fournitures de bureau", "Frais de télécommunication", "Assurance flotte", "Papeterie & divers"],
  panne: ["Panne moteur ligne 4", "Panne électrique atelier", "Panne climatisation", "Panne transmission"],
};

export async function ensureSeed(): Promise<void> {
  const existing = await db.select().from(versements).limit(1);
  if (existing.length > 0) return;
  const rnd = mulberry32(20250513);
  const between = (min: number, max: number) => min + rnd() * (max - min);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const vInsert: typeof versements.$inferInsert[] = [];
  const cInsert: typeof caEntries.$inferInsert[] = [];
  const dInsert: typeof depenses.$inferInsert[] = [];
  const pInsert: typeof pointages.$inferInsert[] = [];
  const DAYS = 210;
  for (let i = DAYS; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dow = d.getUTCDay();
    const weekend = dow === 0 || dow === 6;
    const trend = 1 + ((DAYS - i) / DAYS) * 0.25;
    const base = (weekend ? between(7000, 12000) : between(14000, 27000)) * trend;
    const parts = weekend ? 1 : rnd() > 0.45 ? 2 : 1;
    let rest = base;
    for (let p = 0; p < parts; p++) {
      const amount = p === parts - 1 ? rest : Math.round(rest * between(0.4, 0.65));
      rest -= amount;
      vInsert.push({ designation: pick(VERS_LABELS), amount: String(Math.round(amount)), date: d });
    }
    const ca = Math.round(base * between(0.66, 0.78));
    cInsert.push({ designation: pick(CA_LABELS), amount: String(ca), date: d });
    if (!weekend && rnd() > 0.45) {
      const cat = pick(["pieces", "entretien", "divers"] as const);
      dInsert.push({ designation: pick(DEP_LABELS[cat]), category: cat, amount: String(Math.round(between(150, 950))), date: d });
    }
    if (rnd() > 0.78) {
      dInsert.push({ designation: pick(DEP_LABELS.panne), category: "panne", amount: String(Math.round(between(150, 650))), date: d });
    }
    pInsert.push({ date: d, present: weekend ? Math.round(between(10, 16)) : Math.round(between(21, 25)), total: 25, note: null });
  }
  await db.insert(versements).values(vInsert);
  await db.insert(caEntries).values(cInsert);
  await db.insert(depenses).values(dInsert);
  await db.insert(pointages).values(pInsert);
  const setRows = await db.select().from(settings);
  if (setRows.length === 0) await db.insert(settings).values({ id: 1, objectiveCa: "2500000", prelevRate: "2", defaultCurrency: "EUR", staffTotal: 25 });
}

export async function ensureStaffSeed(): Promise<void> {
  const existing = await db.select().from(employees).limit(1);
  if (existing.length > 0) return;
  const staff: (typeof employees.$inferInsert)[] = [
    { matricule: "SL-001", firstName: "Amina", lastName: "Diallo", position: "Responsable des opérations", department: "Exploitation", phone: "+221 77 410 23 18", email: "amina.diallo@sl.local", photo: "/team/amina.jpg", hiredAt: new Date("2021-03-15T00:00:00Z") },
    { matricule: "SL-002", firstName: "Karim", lastName: "Ndiaye", position: "Superviseur logistique", department: "Logistique", phone: "+221 76 822 14 09", email: "karim.ndiaye@sl.local", photo: "/team/karim.jpg", hiredAt: new Date("2020-09-07T00:00:00Z") },
    { matricule: "SL-003", firstName: "Sophie", lastName: "Koné", position: "Comptable", department: "Finance", phone: "+225 07 55 31 42 10", email: "sophie.kone@sl.local", photo: "/team/sophie.jpg", hiredAt: new Date("2022-01-10T00:00:00Z") },
    { matricule: "SL-004", firstName: "Ibrahim", lastName: "Traoré", position: "Technicien maintenance", department: "Maintenance", phone: "+223 76 28 90 11", email: "ibrahim.traore@sl.local", photo: "/team/ibrahim.jpg", hiredAt: new Date("2021-07-01T00:00:00Z") },
    { matricule: "SL-005", firstName: "Fatou", lastName: "Ba", position: "Coordinatrice commerciale", department: "Commercial", phone: "+221 78 090 11 44", email: "fatou.ba@sl.local", photo: "/team/fatou.jpg", hiredAt: new Date("2023-02-20T00:00:00Z") },
  ];
  const inserted = await db.insert(employees).values(staff).returning();
  const rows: (typeof attendance.$inferInsert)[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const statuses = ["present", "present", "present", "present", "present", "retard", "absent", "conge"];
  for (let daysAgo = 44; daysAgo >= 0; daysAgo--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - daysAgo);
    if (d.getUTCDay() === 0) continue;
    for (const [index, emp] of inserted.entries()) {
      const selector = (daysAgo * 7 + index * 3) % statuses.length;
      const status = statuses[selector];
      rows.push({ employeeId: emp.id, date: d, status, arrivalTime: status === "present" ? `0${8 + (index % 2)}:${String((index * 7) % 60).padStart(2, "0")}` : status === "retard" ? "09:35" : null, note: status === "conge" ? "Congé validé" : status === "absent" ? "Absence à justifier" : null });
    }
  }
  await db.insert(attendance).values(rows);
  const performances: (typeof employeePerformance.$inferInsert)[] = [];
  for (const row of rows) {
    if (row.status !== "present" && row.status !== "retard") continue;
    const index = inserted.findIndex((e) => e.id === row.employeeId);
    const day = row.date.getUTCDate();
    const tasks = 3 + ((day + index * 2) % 8);
    const generated = 180 + tasks * (45 + index * 12) + ((day * 37) % 240);
    performances.push({ employeeId: row.employeeId, date: row.date, tasksCompleted: tasks, generatedAmount: String(generated), hoursWorked: row.status === "retard" ? "6.5" : "8", note: tasks >= 8 ? "Très bonne performance" : null });
  }
  await db.insert(employeePerformance).values(performances);
}

export async function ensurePerformanceSeed(): Promise<void> {
  const existing = await db.select().from(employeePerformance).limit(1);
  if (existing.length > 0) return;
  const staff = await db.select().from(employees);
  const records = await db.select().from(attendance);
  if (!staff.length || !records.length) return;
  const performances: (typeof employeePerformance.$inferInsert)[] = [];
  for (const row of records) {
    if (row.status !== "present" && row.status !== "retard") continue;
    const index = staff.findIndex((e) => e.id === row.employeeId);
    const day = row.date.getUTCDate();
    const tasks = 3 + ((day + Math.max(0, index) * 2) % 8);
    performances.push({ employeeId: row.employeeId, date: row.date, tasksCompleted: tasks, generatedAmount: String(180 + tasks * (45 + Math.max(0, index) * 12) + ((day * 37) % 240)), hoursWorked: row.status === "retard" ? "6.5" : "8", note: tasks >= 8 ? "Très bonne performance" : null });
  }
  if (performances.length) await db.insert(employeePerformance).values(performances);
}
