import "dotenv/config";
import { existsSync } from "node:fs";

const requiredFiles = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "vercel.json",
  "drizzle.config.ts",
  ".env.example",
  "src/app/page.tsx",
  "src/db/schema.ts",
  "src/db/bootstrap.ts",
  "src/instrumentation.ts",
  "public/robots.txt",
  "public/sitemap.xml",
];

const missingFiles = requiredFiles.filter((file) => !existsSync(file));
const requiredEnv = ["DATABASE_URL"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

console.log("\nSPL Gestion de Suivi — contrôle pré-déploiement\n");

if (missingFiles.length) {
  console.error("Fichiers manquants :", missingFiles.join(", "));
} else {
  console.log("✓ Tous les fichiers obligatoires sont présents.");
}

if (missingEnv.length) {
  console.warn(
    "⚠ Variables absentes dans cet environnement :",
    missingEnv.join(", "),
    "\n  Ajoutez-les dans Vercel → Settings → Environment Variables."
  );
} else {
  console.log("✓ Toutes les variables obligatoires sont définies.");
}

if (missingFiles.length) process.exit(1);
console.log("\nProjet prêt à être importé dans Vercel.\n");
