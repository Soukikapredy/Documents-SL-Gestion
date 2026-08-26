import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

/** Comptes propriétaires — chaque compte possède un espace de données isolé. */
export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Versements journaliers (recettes entrantes), montants en EUR (devise de base). */
export const versements = pgTable("versements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  designation: text("designation").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Chiffre d'affaires brut (saisi par jour / semaine). */
export const caEntries = pgTable("ca_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  designation: text("designation").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Dépenses : catégorie = panne | pieces | entretien | divers. */
export const depenses = pgTable("depenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  designation: text("designation").notNull(),
  category: text("category").notNull(), // 'panne' | 'pieces' | 'entretien' | 'divers'
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Pointage du personnel : présents / effectif total. */
export const pointages = pgTable("pointages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  date: date("date", { mode: "date" }).notNull(),
  present: integer("present").notNull(),
  total: integer("total").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Fiches d'identité du personnel. */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
  matricule: text("matricule").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  position: text("position").notNull(),
  department: text("department").notNull(),
  phone: text("phone"),
  email: text("email"),
  photo: text("photo"),
  hiredAt: date("hired_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Présence individuelle par jour : present | absent | retard | conge. */
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date", { mode: "date" }).notNull(),
  status: text("status").notNull().default("present"),
  arrivalTime: text("arrival_time"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Performance quotidienne individuelle : tâches et valeur commerciale générée. */
export const employeePerformance = pgTable("employee_performance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  date: date("date", { mode: "date" }).notNull(),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  generatedAmount: numeric("generated_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }).notNull().default("0"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Paramètres : objectif CA annuel, taux de prélèvement, devise par défaut… */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => appUsers.id, { onDelete: "cascade" }).unique(),
  objectiveCa: numeric("objective_ca", { precision: 16, scale: 2 }).notNull(),
  prelevRate: numeric("prelev_rate", { precision: 5, scale: 2 }).notNull().default("2"),
  defaultCurrency: text("default_currency").notNull().default("EUR"),
  staffTotal: integer("staff_total").notNull().default(25),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
