"use client";

import { THEME_LABELS, type Theme, useTheme } from "@/lib/theme";
import { IconPalette } from "./icons";

const PALETTES: Record<Theme, string[]> = {
  midnight: ["#05070c", "#2f6bff", "#22c55e"],
  light: ["#ffffff", "#2563eb", "#111827"],
  sky: ["#eaf7ff", "#0284c7", "#7dd3fc"],
  emerald: ["#ecfdf5", "#059669", "#34d399"],
};

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <label className="control-pill theme-picker group" title="Changer les couleurs du site">
      <span className="control-icon bg-[#8b5cf6]/12 text-[#a78bfa]">
        <IconPalette width={16} height={16} />
      </span>
      <span className="min-w-0 leading-none">
        <span className="control-kicker">Thème</span>
        <span className="control-value">{THEME_LABELS[theme]}</span>
      </span>
      <span className="ml-1 flex -space-x-1" aria-hidden>
        {PALETTES[theme].map((color) => (
          <span
            key={color}
            className="h-3.5 w-3.5 rounded-full border border-white/30 shadow-sm"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="Choisir le thème"
      >
        {(Object.keys(THEME_LABELS) as Theme[]).map((id) => (
          <option key={id} value={id}>
            {THEME_LABELS[id]}
          </option>
        ))}
      </select>
      <svg className="ml-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition group-hover:text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}
