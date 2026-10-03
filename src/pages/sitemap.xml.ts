import type { APIRoute } from 'astro';
import { absolut } from '../config';

/**
 * Sidorna som ska finnas i sitemap.xml. 404 och tack är noindex och står
 * därför inte med. Nytt blogginlägg eller ny sida: lägg till en rad här.
 */
const SIDOR = [
  { sokvag: '/', lastmod: '2026-09-23', changefreq: 'weekly', prioritet: '1.0' },
  { sokvag: '/blogg.html', lastmod: '2026-09-19', changefreq: 'monthly', prioritet: '0.7' },
  { sokvag: '/blogg-hur-ofta-putsa-fonster.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.6' },
  { sokvag: '/blogg-vad-kostar-fonsterputs-uppsala.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.6' },
  { sokvag: '/blogg-rut-avdrag-fonsterputs-stad.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.6' },
  { sokvag: '/kopvillkor.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.3' },
  { sokvag: '/integritetspolicy.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.3' },
  { sokvag: '/cookies.html', lastmod: '2026-09-19', changefreq: 'yearly', prioritet: '0.2' },
];

export const GET: APIRoute = () => {
  const poster = SIDOR.map(
    (s) => `  <url>
    <loc>${absolut(s.sokvag)}</loc>
    <lastmod>${s.lastmod}</lastmod>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.prioritet}</priority>
  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${poster}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
