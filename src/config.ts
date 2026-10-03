/** Företagsnamnet, som det står i sidtitlar och delningskort. */
export const FORETAG_NAMN = 'Linus Fönsterputs';

/** Sajtens adress utan avslutande snedstreck. Kommer ur `site` i astro.config.mjs. */
export const SITE = import.meta.env.SITE.replace(/\/$/, '');

/** Gör en sökväg ("/blogg.html") till en fullständig adress. */
export const absolut = (sokvag: string) => `${SITE}${sokvag}`;

/** ISO-datum ("2026-06-04") till svensk text ("4 juni 2026"). */
export const datumSv = (iso: string) =>
  new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));

/**
 * Förhandsvisningsläge: noindex på alla sidor, en banner överst och en
 * robots.txt som stänger ute alla robotar. Slås på genom att bygga med
 * FORHANDSVISNING=true (miljövariabel i Vercel, eller i en lokal .env).
 */
export const FORHANDSVISNING = ['true', '1'].includes(
  String(import.meta.env.FORHANDSVISNING ?? '').toLowerCase(),
);
