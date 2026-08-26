"use client";

import { IconPrinter } from "./icons";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:text-white"
    >
      <IconPrinter width={16} height={16} />
      Imprimer le rapport
    </button>
  );
}
