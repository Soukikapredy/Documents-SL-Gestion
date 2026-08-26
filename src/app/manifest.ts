import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SL GESTION DE SUIVIE",
    short_name: "SL SUIVIE",
    description:
      "Cockpit de gestion commerciale : versements, chiffre d'affaires, charges, bilan et objectifs.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#05070c",
    theme_color: "#2f6bff",
    categories: ["business", "finance", "productivity"],
    lang: "fr-FR",
    icons: [
      {
        src: "/icons/spl-app-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/spl-app-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/spl-app-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
