import "dotenv/config";
import { ensureSeed, ensureStaffSeed, ensurePerformanceSeed } from "./seedData";

Promise.all([ensureSeed(), ensureStaffSeed()])
  .then(() => ensurePerformanceSeed())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
