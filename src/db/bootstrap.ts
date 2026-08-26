import { pool } from "./index";

/**
 * Crée les tables si elles n'existent pas.
 * Permet un déploiement Vercel/Neon sans aucune commande :
 * au premier démarrage, la base se configure toute seule.
 */
const SQL = `
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS versements (
  id SERIAL PRIMARY KEY,
  designation TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS ca_entries (
  id SERIAL PRIMARY KEY,
  designation TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS depenses (
  id SERIAL PRIMARY KEY,
  designation TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS pointages (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  present INTEGER NOT NULL,
  total INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  matricule TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo TEXT,
  hired_at DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' NOT NULL,
  arrival_time TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS attendance_employee_date_idx ON attendance(employee_id, date);
CREATE TABLE IF NOT EXISTS employee_performance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0 NOT NULL,
  generated_amount NUMERIC(14,2) DEFAULT '0' NOT NULL,
  hours_worked NUMERIC(5,2) DEFAULT '0' NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS performance_employee_date_idx ON employee_performance(employee_id, date);
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  objective_ca NUMERIC(16,2) NOT NULL,
  prelev_rate NUMERIC(5,2) DEFAULT '2' NOT NULL,
  default_currency TEXT DEFAULT 'EUR' NOT NULL,
  staff_total INTEGER DEFAULT 25 NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
ALTER TABLE versements ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE ca_entries ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE depenses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE pointages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES app_users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS settings_user_id_idx ON settings(user_id) WHERE user_id IS NOT NULL;
CREATE SEQUENCE IF NOT EXISTS settings_id_seq;
ALTER SEQUENCE settings_id_seq OWNED BY settings.id;
ALTER TABLE settings ALTER COLUMN id SET DEFAULT nextval('settings_id_seq');
SELECT setval('settings_id_seq', GREATEST(COALESCE((SELECT MAX(id) FROM settings), 1), 1));
`;

export async function bootstrapSchema(): Promise<void> {
  await pool.query(SQL);
  console.log("[bootstrap] schéma vérifié / créé.");
}
