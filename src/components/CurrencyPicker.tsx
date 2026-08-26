"use client";

import { useMoney, CURRENCY_LABELS, type Currency } from "@/lib/currency";
import { IconWallet } from "./icons";

const SHORT: Record<Currency, string> = {
  EUR: "Euro",
  USD: "Dollar",
  XOF: "Franc CFA",
};

const SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  XOF: "F",
};

export default function CurrencyPicker() {
  const { currency, setCurrency } = useMoney();

  return (
    <label className="control-pill group" title={CURRENCY_LABELS[currency]}>
      <span className="control-icon bg-[#22c55e]/12 text-[#22c55e]">
        <IconWallet width={16} height={16} />
      </span>
      <span className="min-w-0 leading-none">
        <span className="control-kicker">Devise</span>
        <span className="control-value">
          <span className="font-extrabold text-[#22c55e]">{SYMBOL[currency]}</span> {SHORT[currency]}
        </span>
      </span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Choisir la devise"
      >
        <option value="EUR">Euro (€)</option>
        <option value="USD">Dollar ($)</option>
        <option value="XOF">Franc CFA</option>
      </select>
      <svg className="ml-1 h-3.5 w-3.5 shrink-0 text-slate-500 transition group-hover:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}
