export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapSchema } = await import("./db/bootstrap");
    await bootstrapSchema().catch((e: unknown) => console.error("[bootstrap] échec:", e));

    const { ensureSeed, ensureStaffSeed, ensurePerformanceSeed } = await import("./db/seedData");
    await ensureSeed().catch((e: unknown) => console.error("[seed] échec:", e));
    await ensureStaffSeed().catch((e: unknown) => console.error("[seed personnel] échec:", e));
    await ensurePerformanceSeed().catch((e: unknown) => console.error("[seed performance] échec:", e));
  }
}
