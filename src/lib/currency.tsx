"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Currency = "EUR" | "USD" | "XOF";

/** Toutes les montants sont stockés en EUR (devise de base). */
const RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  XOF: 655.957,
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: "Euro (€)",
  USD: "Dollar ($)",
  XOF: "Franc CFA",
};

const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

function render(currency: Currency, eur: number): string {
  const v = Math.round(eur * RATES[currency]);
  const n = nf.format(v);
  if (currency === "USD") return `$${n}`;
  if (currency === "XOF") return `${n} F CFA`;
  return `${n} €`;
}

interface MoneyCtx {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Formate un montant stocké en EUR vers la devise active. */
  fmt: (eur: number) => string;
  /** Formate sans symbole (axes de graphiques). */
  fmtAxis: (eur: number) => string;
  symbol: string;
  /** Taux EUR -> devise active (pour convertir les saisies). */
  rate: number;
}

const Ctx = createContext<MoneyCtx | null>(null);

export function CurrencyProvider({
  children,
  initial = "EUR",
}: {
  children: ReactNode;
  initial?: Currency;
}) {
  const [currency, setCurrency] = useState<Currency>(initial);

  const fmt = useCallback((eur: number) => render(currency, eur), [currency]);

  const fmtAxis = useCallback(
    (eur: number) => {
      const v = Math.round(eur * RATES[currency]);
      if (Math.abs(v) >= 1_000_000) return `${nf.format(Math.round(v / 1000))}k`;
      if (Math.abs(v) >= 10_000) return `${nf.format(Math.round(v / 1000))}k`;
      return nf.format(v);
    },
    [currency]
  );

  const value = useMemo<MoneyCtx>(
    () => ({
      currency,
      setCurrency,
      fmt,
      fmtAxis,
      symbol: currency === "USD" ? "$" : currency === "XOF" ? "F CFA" : "€",
      rate: RATES[currency],
    }),
    [currency, fmt, fmtAxis]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMoney(): MoneyCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMoney must be used within CurrencyProvider");
  return ctx;
}
