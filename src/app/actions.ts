"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { versements, caEntries, depenses, pointages, settings, attendance, employeePerformance, employees } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Result = { ok: true } | { ok: false; error: string };
const ATTENDANCE_STATUSES = ["present", "absent", "retard", "conge"] as const;
const CATEGORIES = ["panne", "pieces", "entretien", "divers"] as const;

function parseMoney(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseDate(raw: FormDataEntryValue | null): Date | null {
  if (typeof raw !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function addEmployee(fd: FormData): Promise<Result> {
  const firstName = String(fd.get("firstName") ?? "").trim();
  const lastName = String(fd.get("lastName") ?? "").trim();
  const position = String(fd.get("position") ?? "").trim();
  const department = String(fd.get("department") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim() || null;
  const email = String(fd.get("email") ?? "").trim() || null;
  if (!firstName || !lastName || !position || !department) return { ok: false, error: "Nom, poste et département sont requis." };
  const count = (await db.select({ id: employees.id }).from(employees)).length;
  const photos = ["/team/amina.jpg", "/team/karim.jpg", "/team/sophie.jpg", "/team/ibrahim.jpg", "/team/fatou.jpg"];
  await db.insert(employees).values({ matricule: `SL-${String(count + 1).padStart(3, "0")}`, firstName, lastName, position, department, phone, email, photo: photos[count % photos.length], hiredAt: new Date() });
  revalidatePath("/");
  return { ok: true };
}

export async function setEmployeeAttendance(fd: FormData): Promise<Result> {
  const employeeId = Number(fd.get("employeeId"));
  const date = parseDate(fd.get("date"));
  const status = String(fd.get("status") ?? "present");
  const arrivalTime = String(fd.get("arrivalTime") ?? "").trim() || null;
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!Number.isInteger(employeeId) || employeeId <= 0) return { ok: false, error: "Employé invalide." };
  if (!date) return { ok: false, error: "Date invalide." };
  if (!(ATTENDANCE_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Statut invalide." };
  await db.delete(attendance).where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, date)));
  await db.insert(attendance).values({ employeeId, date, status, arrivalTime, note });
  revalidatePath("/");
  return { ok: true };
}

export async function setEmployeePerformance(fd: FormData): Promise<Result> {
  const employeeId = Number(fd.get("employeeId"));
  const date = parseDate(fd.get("date"));
  const tasks = Number(fd.get("tasks"));
  const hours = Number(String(fd.get("hours") ?? "0").replace(",", "."));
  const generated = Number(String(fd.get("generated") ?? "0").replace(/\s/g, "").replace(",", "."));
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!Number.isInteger(employeeId) || employeeId <= 0) return { ok: false, error: "Employé invalide." };
  if (!date) return { ok: false, error: "Date invalide." };
  if (!Number.isInteger(tasks) || tasks < 0) return { ok: false, error: "Nombre de tâches invalide." };
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) return { ok: false, error: "Nombre d’heures invalide." };
  if (!Number.isFinite(generated) || generated < 0) return { ok: false, error: "Valeur générée invalide." };
  await db.delete(employeePerformance).where(and(eq(employeePerformance.employeeId, employeeId), eq(employeePerformance.date, date)));
  await db.insert(employeePerformance).values({ employeeId, date, tasksCompleted: tasks, hoursWorked: String(hours), generatedAmount: String(generated), note });
  revalidatePath("/");
  return { ok: true };
}

export async function addVersement(fd: FormData): Promise<Result> {
  const designation = String(fd.get("designation") ?? "").trim();
  const amount = parseMoney(fd.get("amount"));
  const date = parseDate(fd.get("date"));
  if (!designation) return { ok: false, error: "Désignation requise." };
  if (amount === null) return { ok: false, error: "Montant invalide." };
  if (!date) return { ok: false, error: "Date invalide." };
  await db.insert(versements).values({ designation, amount: String(Math.round(amount)), date });
  revalidatePath("/");
  return { ok: true };
}

export async function addCa(fd: FormData): Promise<Result> {
  const designation = String(fd.get("designation") ?? "").trim() || "CA brut hebdomadaire";
  const amount = parseMoney(fd.get("amount"));
  const date = parseDate(fd.get("date"));
  if (amount === null) return { ok: false, error: "Montant invalide." };
  if (!date) return { ok: false, error: "Date invalide." };
  await db.insert(caEntries).values({ designation, amount: String(Math.round(amount)), date });
  revalidatePath("/");
  return { ok: true };
}

export async function addDepense(fd: FormData): Promise<Result> {
  const designation = String(fd.get("designation") ?? "").trim();
  const amount = parseMoney(fd.get("amount"));
  const date = parseDate(fd.get("date"));
  const cat = String(fd.get("category") ?? "divers");
  const category = (CATEGORIES as readonly string[]).includes(cat) ? cat : "divers";
  if (!designation) return { ok: false, error: "Désignation requise." };
  if (amount === null) return { ok: false, error: "Montant invalide." };
  if (!date) return { ok: false, error: "Date invalide." };
  await db.insert(depenses).values({ designation, category, amount: String(Math.round(amount)), date });
  revalidatePath("/");
  return { ok: true };
}

export async function addPointage(fd: FormData): Promise<Result> {
  const date = parseDate(fd.get("date"));
  const present = Number(fd.get("present"));
  const total = Number(fd.get("total"));
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!date) return { ok: false, error: "Date invalide." };
  if (!Number.isInteger(present) || present < 0) return { ok: false, error: "Présents invalide." };
  if (!Number.isInteger(total) || total <= 0) return { ok: false, error: "Effectif invalide." };
  if (present > total) return { ok: false, error: "Présents > effectif total." };
  await db.delete(pointages).where(eq(pointages.date, date));
  await db.insert(pointages).values({ date, present, total, note });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteDay(dateIso: string): Promise<Result> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return { ok: false, error: "Date invalide." };
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  await db.delete(versements).where(eq(versements.date, date));
  await db.delete(caEntries).where(eq(caEntries.date, date));
  await db.delete(depenses).where(eq(depenses.date, date));
  await db.delete(pointages).where(eq(pointages.date, date));
  revalidatePath("/");
  return { ok: true };
}

export async function resetData(): Promise<Result> {
  await db.delete(versements);
  await db.delete(caEntries);
  await db.delete(depenses);
  await db.delete(pointages);
  await db.delete(employees);
  await db.update(settings).set({ objectiveCa: "2500000", prelevRate: "2", defaultCurrency: "EUR", staffTotal: 5, updatedAt: new Date() }).where(eq(settings.id, 1));
  revalidatePath("/");
  return { ok: true };
}

const CURRENCIES = ["EUR", "USD", "XOF"] as const;

export async function updateSettings(fd: FormData): Promise<Result> {
  const cur = String(fd.get("currency") ?? "EUR");
  const currency = (CURRENCIES as readonly string[]).includes(cur) ? cur : "EUR";
  const rateRaw = parseMoney(fd.get("rate"));
  const staff = Number(fd.get("staffTotal"));
  const objective = parseMoney(fd.get("objective"));
  const rate = rateRaw === null ? null : Math.min(100, rateRaw);
  const staffOk = Number.isInteger(staff) && staff > 0 ? staff : null;
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  const base = { objectiveCa: objective !== null ? String(Math.round(objective)) : "2500000", prelevRate: rate !== null ? String(rate) : "2", defaultCurrency: currency, staffTotal: staffOk ?? 25 };
  if (rows.length === 0) await db.insert(settings).values({ id: 1, ...base });
  else await db.update(settings).set({ ...base, updatedAt: new Date() }).where(eq(settings.id, rows[0].id));
  revalidatePath("/");
  return { ok: true };
}

type Kind = "versement" | "ca" | "depense" | "pointage";

export async function saveEntry(fd: FormData): Promise<Result> {
  const kind = String(fd.get("kind")) as Kind;
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Écriture introuvable." };
  const date = parseDate(fd.get("date"));
  if (!date) return { ok: false, error: "Date invalide." };
  if (kind === "versement" || kind === "ca" || kind === "depense") {
    const designation = String(fd.get("designation") ?? "").trim();
    const amount = parseMoney(fd.get("amount"));
    if (!designation) return { ok: false, error: "Désignation requise." };
    if (amount === null) return { ok: false, error: "Montant invalide." };
    if (kind === "versement") await db.update(versements).set({ designation, amount: String(Math.round(amount)), date }).where(eq(versements.id, id));
    else if (kind === "ca") await db.update(caEntries).set({ designation, amount: String(Math.round(amount)), date }).where(eq(caEntries.id, id));
    else {
      const cat = String(fd.get("category") ?? "divers");
      const category = (CATEGORIES as readonly string[]).includes(cat) ? cat : "divers";
      await db.update(depenses).set({ designation, category, amount: String(Math.round(amount)), date }).where(eq(depenses.id, id));
    }
  } else if (kind === "pointage") {
    const present = Number(fd.get("present"));
    const total = Number(fd.get("total"));
    if (!Number.isInteger(present) || present < 0) return { ok: false, error: "Présents invalide." };
    if (!Number.isInteger(total) || total <= 0) return { ok: false, error: "Effectif invalide." };
    if (present > total) return { ok: false, error: "Présents > effectif total." };
    await db.update(pointages).set({ present, total, date }).where(eq(pointages.id, id));
  } else return { ok: false, error: "Type inconnu." };
  revalidatePath("/");
  return { ok: true };
}

export async function removeEntry(fd: FormData): Promise<Result> {
  const kind = String(fd.get("kind")) as Kind;
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Écriture introuvable." };
  if (kind === "versement") await db.delete(versements).where(eq(versements.id, id));
  else if (kind === "ca") await db.delete(caEntries).where(eq(caEntries.id, id));
  else if (kind === "depense") await db.delete(depenses).where(eq(depenses.id, id));
  else if (kind === "pointage") await db.delete(pointages).where(eq(pointages.id, id));
  else return { ok: false, error: "Type inconnu." };
  revalidatePath("/");
  return { ok: true };
}

export async function updateObjective(fd: FormData): Promise<Result> {
  const amount = parseMoney(fd.get("objective"));
  if (amount === null) return { ok: false, error: "Objectif invalide." };
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  if (rows.length === 0) await db.insert(settings).values({ id: 1, objectiveCa: String(Math.round(amount)) });
  else await db.update(settings).set({ objectiveCa: String(Math.round(amount)), updatedAt: new Date() }).where(eq(settings.id, rows[0].id));
  revalidatePath("/");
  return { ok: true };
}
