"use client";

import Header from "./Header";
import type { AppAlert } from "@/lib/alerts";

export default function AppHeader({ alerts }: { alerts: AppAlert[] }) {
  return <Header alerts={alerts} />;
}
