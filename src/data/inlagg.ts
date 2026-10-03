/**
 * Bloggens inlägg. Härifrån kommer allt som är gemensamt för ett inlägg: korten
 * på blogg.html, Blog-schemat där, och rubrik, meta-rad och BlogPosting-schema
 * på själva inläggssidan. Brödtexten ligger i src/pages/<slug>.astro.
 *
 * Nytt inlägg: lägg till en post här, skapa src/pages/<slug>.astro (kopiera ett
 * befintligt inlägg) och lägg adressen i src/pages/sitemap.xml.ts.
 */
export interface Inlagg {
  /** Sidans filnamn utan .html – också adressen: /<slug>.html */
  slug: string;
  rubrik: string;
  /** Sidtiteln om den ska skilja sig från rubriken (utan " | Linus Fönsterputs"). */
  titel?: string;
  /** Meta-beskrivningen, som också används som beskrivning i schemat. */
  beskrivning: string;
  /** Inledningen på inlägget, och texten på kortet i blogglistan. */
  ingress: string;
  /** ISO-datum. */
  publicerad: string;
  /** Sätts när inlägget ändras väsentligt. Annars gäller publiceringsdatumet. */
  uppdaterad?: string;
  /** Uppskattad lästid i minuter. */
  minuter: number;
  /** Bilden på inläggets kort (startsidan och blogg.html), ur public/bilder/. */
  bild: { src: string; alt: string; bredd: number; hojd: number };
}

/** Äldst först – samma ordning som korten visas i. */
export const INLAGG: Inlagg[] = [
  {
    slug: 'blogg-hur-ofta-putsa-fonster',
    rubrik: 'Hur ofta ska man putsa fönster?',
    beskrivning:
      'Två gånger om året räcker för de flesta villor – men läge, årstid och pollen ändrar bilden. Här är riktlinjerna jag ger mina kunder i Uppsala.',
    ingress:
      'Den vanligaste frågan jag får. Svaret beror mindre på kalendern än på var huset ligger.',
    publicerad: '2026-06-04',
    minuter: 4,
    bild: { src: '/bilder/linus-tegelhus.jpg', alt: 'Linus putsar fönster på ett tegelhus i kvällssol', bredd: 1280, hojd: 832 },
  },
  {
    slug: 'blogg-vad-kostar-fonsterputs-uppsala',
    rubrik: 'Vad kostar fönsterputs i Uppsala?',
    beskrivning:
      'Marknadspriset för fönsterputs på villa i Uppsala ligger på 1 000–1 750 kr efter RUT. Så räknar firmorna, och så vet du vad du faktiskt betalar.',
    ingress:
      'Priserna varierar mer än man tror – och det beror nästan alltid på hur firman räknar, inte på hur smutsiga fönstren är.',
    publicerad: '2026-07-02',
    minuter: 5,
    bild: { src: '/bilder/linus-modern-villa.jpg', alt: 'Linus drar av tvålvatten från ett stort fönsterparti på en modern villa', bredd: 1280, hojd: 832 },
  },
  {
    slug: 'blogg-rut-avdrag-fonsterputs-stad',
    rubrik: 'RUT-avdrag för fönsterputs',
    titel: 'RUT-avdrag för fönsterputs 2026',
    beskrivning:
      'RUT ger 50 % rabatt på arbetskostnaden, upp till 75 000 kr per person och år. Så fungerar avdraget för fönsterputs hemma hos dig 2026.',
    ingress:
      'Halva arbetskostnaden betald av staten – men bara om tjänsten och fakturan uppfyller kraven.',
    publicerad: '2026-08-06',
    minuter: 4,
    bild: { src: '/bilder/villa-fonster-putsade.jpg', alt: 'Nyputsade villafönster med vita karmar och fönsterbleck', bredd: 1400, hojd: 840 },
  },
];

export const sokvag = (i: Inlagg) => `/${i.slug}.html`;

export const hittaInlagg = (slug: string): Inlagg => {
  const inlagg = INLAGG.find((i) => i.slug === slug);
  if (!inlagg) throw new Error(`Inlägget "${slug}" finns inte i src/data/inlagg.ts`);
  return inlagg;
};
