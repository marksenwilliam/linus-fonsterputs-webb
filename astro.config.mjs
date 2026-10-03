// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Agentation – visuell återkoppling under utveckling (se src/dev/agentation-dev.js).
 * Skriptet läggs bara in av dev-servern, så ingenting av det följer med i bygget.
 *
 * @type {import('astro').AstroIntegration}
 */
const agentation = {
  name: 'agentation-dev',
  hooks: {
    'astro:config:setup': ({ command, injectScript }) => {
      if (command === 'dev') injectScript('page', `import '/src/dev/agentation-dev.js';`);
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // Enda stället där domänen står. Canonical, og:url, JSON-LD, sitemap.xml och
  // robots.txt räknas ut ur det här värdet – byt det när adressen ändras.
  site: 'https://linusfonsterputs.se',

  // Sidorna ska ligga kvar på exakt samma adresser som förut (blogg.html,
  // kopvillkor.html …). Det är de adresserna som står i sitemap.xml och i
  // Googles index, så 'file' ger dist/blogg.html i stället för
  // dist/blogg/index.html.
  build: { format: 'file' },
  trailingSlash: 'never',

  // Av med flit: komprimeringen tar bort radbrytningar mellan inline-element,
  // och därmed det mellanrum webbläsaren ritar ut mellan dem (brödsmulorna
  // "Start › Blogg" blir annars "Start ›Blogg").
  compressHTML: false,

  // Agentations verktygsfält ligger nere till höger – Astros eget skulle krocka.
  devToolbar: { enabled: false },

  vite: {
    build: {
      // stil.css levereras precis som den är skriven. CSS-minifieraren skrev om
      // den på sätt som inte alltid var likvärdiga: den tog bort backdrop-filter
      // (bara -webkit-varianten blev kvar, så Chrome och Firefox tappade
      // blurren på .mob-cta) och gjorde @media (min-width: 1024px) till den nyare
      // formen (width >= 1024px), som Safari före 16.4 inte förstår.
      // Slå på igen med cssMinify: true, och kör då om jämförelsen mot originalet.
      cssMinify: false,
    },
  },

  integrations: [agentation],
});
