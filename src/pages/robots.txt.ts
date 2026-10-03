import type { APIRoute } from 'astro';
import { FORHANDSVISNING, absolut } from '../config';

const LIVE = `# Linus Fönsterputs
User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${absolut('/sitemap.xml')}
`;

const FORHANDSVISAD = `# FÖRHANDSVISNING – sidan ska inte indexeras medan den granskas.
# Slås av genom att bygga utan FORHANDSVISNING=true.
User-agent: *
Disallow: /
`;

export const GET: APIRoute = () =>
  new Response(FORHANDSVISNING ? FORHANDSVISAD : LIVE, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
