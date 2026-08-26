import { IconArrowRight } from "./icons";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-white/5 print:hidden">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-yacht.jpg"
          alt="Voilier SL Gestion de Suivie en mer"
          className="h-full w-full object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070c] via-[#05070c]/80 to-[#05070c]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-transparent to-[#05070c]/60" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="absolute right-6 top-10 hidden flex-col items-end gap-2 md:flex" aria-hidden>
          <span className="font-display text-3xl font-extrabold italic tracking-tight text-white/90">SL</span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#4d82ff]">GESTION DE SUIVIE</span>
        </div>

        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.3em] text-[#4d82ff]">
          Pilotez. Analysez. Décidez.
        </p>
        <h1 className="font-display max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Votre activité.
          <br />
          Vos chiffres.
          <br />
          <span className="text-[#2f6bff]">Votre succès.</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-300">
          SL Gestion de Suivie est votre cockpit de pilotage. Suivez vos performances en temps
          réel, maîtrisez vos charges et atteignez vos objectifs de fin d'année.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#operations"
            className="group inline-flex items-center gap-2 rounded-lg bg-[#2f6bff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#2f6bff]/25 transition hover:bg-[#1f5af0]"
          >
            Accéder au tableau de bord
            <IconArrowRight width={16} height={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#bilan"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:border-white/30 hover:text-white"
          >
            Voir le bilan mensuel
          </a>
        </div>
      </div>
    </section>
  );
}
