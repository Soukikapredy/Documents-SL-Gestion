import { Logo, IconArrowRight, IconCompass } from "./icons";
import PrintButton from "./PrintButton";

export function Cta() {
  return (
    <section id="rapports" className="mx-auto max-w-7xl scroll-mt-20 px-4 print:hidden sm:px-6">
      <div className="card relative mt-8 overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 text-white/[0.05]">
          <IconCompass width={240} height={240} strokeWidth={0.8} />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              Prenez les bonnes décisions.
              <br />
              <span className="text-[#2f6bff]">Au bon moment.</span>
            </h2>
          </div>
          <div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              SL Gestion de Suivie vous donne une vision claire et en temps réel de votre
              activité pour piloter votre performance et construire l'avenir.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#operations"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#2f6bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2f6bff]/25 transition hover:bg-[#1f5af0]"
              >
                Voir les rapports détaillés
                <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <PrintButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const COLS = [
  {
    title: "Navigation",
    links: [
      ["Tableau de bord", "#top"],
      ["Opérations", "#operations"],
      ["Charges", "#charges"],
      ["Bilan", "#bilan"],
      ["Objectifs", "#objectifs"],
      ["Rapports", "#rapports"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Aide", "#top"],
      ["Documentation", "#top"],
      ["Contact", "#top"],
      ["Paramètres", "#parametres"],
    ],
  },
  {
    title: "Légal",
    links: [
      ["Conditions d'utilisation", "#top"],
      ["Politique de confidentialité", "#top"],
      ["Mentions légales", "#top"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/5 bg-[#070a12] print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-slate-500">Cockpit de gestion commerciale</p>
          <p className="mt-4 text-sm font-extrabold uppercase tracking-wide text-[#4d82ff]">SL GESTION DE SUIVIE</p>
          <p className="mt-6 text-xs text-slate-600">© 2025 SL GESTION DE SUIVIE. Tous droits réservés.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-[13px] text-slate-400 transition hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
