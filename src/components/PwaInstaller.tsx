"use client";

import { useEffect, useState } from "react";
import { IconDownload, IconX } from "./icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstaller() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPrompt(null);
      setOpen(false);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={install}
        className="control-pill group"
        title="Installer l'application SL"
      >
        <span className="control-icon bg-[#2f6bff]/12 text-[#4d82ff]">
          <IconDownload width={16} height={16} />
        </span>
        <span className="min-w-0 text-left leading-none">
          <span className="control-kicker">Application</span>
          <span className="control-value">Installer sur cet appareil</span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b111d] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/spl-app-192.png" alt="SL" className="h-12 w-12 rounded-xl" />
                <div>
                  <h2 className="font-display font-extrabold uppercase text-white">Installer SL GESTION DE SUIVIE</h2>
                  <p className="mt-0.5 text-xs text-slate-400">Application gratuite sur votre appareil</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <IconX width={17} height={17} />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">
              {ios ? (
                <>
                  <p>Sur iPhone ou iPad :</p>
                  <ol className="list-decimal space-y-2 pl-5 text-slate-400">
                    <li>Ouvrez ce site dans <strong className="text-white">Safari</strong>.</li>
                    <li>Appuyez sur le bouton <strong className="text-white">Partager</strong> (carré avec flèche).</li>
                    <li>Choisissez <strong className="text-white">Sur l’écran d’accueil</strong>.</li>
                    <li>Appuyez sur <strong className="text-white">Ajouter</strong>.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>L’installation automatique n’est pas encore proposée par ce navigateur.</p>
                  <p className="text-slate-400">
                    Ouvrez le menu du navigateur (⋮), puis choisissez <strong className="text-white">Installer l’application</strong> ou <strong className="text-white">Ajouter à l’écran d’accueil</strong>.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
