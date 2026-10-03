# Linus Fönsterputs

Webbplats med inbyggt bokningssystem för en enmansfirma inom fönsterputs och
kontorsputs i Uppsala län.

Byggd med [Astro](https://astro.build) och publicerad som statisk sajt på
Vercel. Bokningsformuläret postar till en serverless-funktion
(`api/offert.js`) som skapar kontakten i GoHighLevel.

## Kom igång

```
npm install
npm run dev        # utvecklingsserver på http://localhost:4321
npm run build      # bygger sajten till dist/
npm run preview    # visar bygget i dist/ lokalt
```

Kräver Node 22.12 eller senare.

`/api/offert` är en Vercel-funktion och svarar därför inte i `npm run dev`.
Själva skickandet av ett formulär går att prova mot en Vercel-förhandsgranskning.

## Innan sidan publiceras

Läs **[ATT-GORA-INNAN-LANSERING.md](ATT-GORA-INNAN-LANSERING.md)**. Där står
allt som återstår, bland annat den geografiska adressen och kopplingen till
GoHighLevel ([GHL-KOPPLING.md](GHL-KOPPLING.md)) och Cloudflare Turnstile.

## Struktur

| Sökväg | Innehåll |
|---|---|
| `src/pages/` | En fil per sida. Adresserna är desamma som förut: `/blogg.html`, `/kopvillkor.html` … |
| `src/pages/robots.txt.ts`, `sitemap.xml.ts` | Skapar `robots.txt` och `sitemap.xml` vid bygget |
| `src/layouts/BaseLayout.astro` | Det alla sidor delar: `<head>`, sidhuvud, sidfot och bokningsvy |
| `src/layouts/InlaggLayout.astro` | Skalet för blogginlägg, juridiska sidor och 404 |
| `src/components/` | Sidhuvud, sidfot, bokningsvy, ikoner och företagets strukturerade data |
| `src/data/inlagg.ts` | Bloggens inlägg: rubrik, ingress, datum och lästid |
| `src/scripts/app.js` | All JavaScript på sidorna med bokning: priser, bokningsflöde, omdömen |
| `src/scripts/rorelse.js` | Rörelserna på alla sidor: scroll-in, rubriker tecken för tecken, skrivmaskinen i heron, räknare och tjänstemenyn |
| `src/scripts/tack.js` | Tack-sidans skript |
| `src/styles/stil.css` | All formgivning, mobilen först |
| `_design-reference/movers-framer/` | Förlagan (Framer-mallen Movers): analys, uppmätta mått och tider, skärmdumpar |
| `src/dev/agentation-dev.js` | Utvecklingsverktyg som bara läggs in av dev-servern |
| `public/` | Bilder, ikoner, typsnitt, favicon, delningsbild och webmanifest – serveras som de är |
| `api/offert.js` | Serverless-funktion på Vercel: formuläret → GoHighLevel |
| `vercel.json` | Bygginställningar, `/tack` → `tack.html` och säkerhetshuvuden (CSP m.m.) |

## Så är den byggd

- **Designen följer Framer-mallen Movers** (vit och grå botten, rundade kort,
  pillerknappar, Geist och Inter Display) men med Linus blå som enda
  accentfärg. Analysen med uppmätta mått och animationstider ligger i
  `_design-reference/movers-framer/DESIGN-PLAN.md`.
- **Mobilen först.** Två brytpunkter, samma som i förlagan: surfplatta från
  `@media (min-width: 810px)` och dator från `@media (min-width: 1200px)`.
  Mobillayouten går att ändra utan att röra datorvyn – och tvärtom.
- **Rörelse bara när den är tillåten.** `rorelse.js` sätter klassen
  `.rorelse` på `<html>` först när `prefers-reduced-motion` inte är satt; utan
  den står allt innehåll synligt och stilla från början.
- **Egna filer i botten, tredjepart bara efter samtycke.** Typsnitt, bilder och
  egna skript ligger på egen domän. Cookiebot och Cloudflare Turnstile laddas
  alltid (nödvändiga), medan Google Analytics 4 och kartan i sidfoten laddas
  först när besökaren sagt ja. Ingen localStorage eller sessionStorage används.
- **Priser räknas ut i webbläsaren.** Fast pris för fönsterputs, kvadratmeter­
  baserat för kontorsputs. Alla belopp före RUT hålls jämna, så att halva
  summan alltid blir ett helt krontal och radsummorna stämmer mot totalen.
- **Tillgänglighet.** WCAG 2.1 AA på kontrast, tangentbordsnavigering och
  `prefers-reduced-motion`.
- **Omdömena bor i `src/scripts/app.js`.** Listan `OMDOMEN` i avsnitt 7 är enda
  källan – den bygger både karusellen på desktop och stapeln på mobil. Där
  ligger 30 riktiga Google-omdömen, ordagrant avskrivna. Är listan tom döljs
  hela sektionen. Läs punkt 7 i `ATT-GORA-INNAN-LANSERING.md` innan du ändrar i
  dem: påhittade eller tillrättalagda omdömen är olagliga, inte bara
  olämpliga.

## Att ändra

Sidhuvudet, mobilmenyn, sidfoten, bokningsvyn och `LocalBusiness`-blocket
fanns förut kopierade i nio HTML-filer. Nu finns de på ett ställe vardera i
`src/components/`, och en ändring slår igenom på alla sidor.

- **Domänen** står i `site` i `astro.config.mjs`. Canonical, `og:url`,
  `og:image`, strukturerad data, `sitemap.xml` och `robots.txt` räknas ut
  därifrån.
- **Nytt blogginlägg:** lägg en post i `src/data/inlagg.ts`, kopiera ett
  befintligt inlägg i `src/pages/` (filen ska heta som postens `slug`, med
  `.astro`) och lägg adressen i `src/pages/sitemap.xml.ts`.
- **Ny sida:** skapa `src/pages/<namn>.astro` som använder `BaseLayout`, se
  `tack.astro` eller `index.astro`. Sidan hamnar på `/<namn>.html`.
- **Telefonnummer, priser och öppettider** står också i löptexten på flera
  sidor och måste ändras där för hand. Uppgifterna i den strukturerade datan
  ändras i `src/components/LocalBusiness.astro`.

## Förhandsvisningsläge

Vill du visa sidan utan att den ser ut som en verksamhet i drift, och utan att
den hamnar i sökresultat: bygg med `FORHANDSVISNING=true`. I Vercel sätts det
som miljövariabel, lokalt läggs `FORHANDSVISNING=true` i en `.env`-fil (den
ignoreras av git). Alla sidor får då en `noindex`-tagg och en banner överst,
och `robots.txt` stänger ute alla robotar. Ta bort variabeln och bygg om för
att gå tillbaka.

## Publicering

Vercel-projektet `linus-fonsterputs-webb` bygger sajten med `npm run build`
och publicerar `dist/` (se `vercel.json`). Mappen `api/` deployas som
serverless-funktioner. Miljövariablerna som funktionen behöver beskrivs i
[GHL-KOPPLING.md](GHL-KOPPLING.md) och i punkt 1 i
`ATT-GORA-INNAN-LANSERING.md`.

## Licenser

Koden i det här repot är upphovsrättsskyddad och har ingen öppen licens.
Utan licensfil gäller "all rights reserved" – ingen annan får återanvända den,
även om repot är publikt.

Undantag: typsnitten i `public/typsnitt/` – Geist och Inter Display – är
licensierade under **SIL Open Font License 1.1**. Licenstexterna ligger i
`public/typsnitt/OFL-Geist.txt` och `public/typsnitt/OFL.txt` (Inter) och
måste följa med om filerna kopieras vidare.

Bilderna `glasfasad-stort-glasparti.jpg`, `kontor-lokal-stadning.jpg` och
`kontorsputs-uppsala.jpg` kommer från Unsplash med fri licens. Övriga foton
tillhör uppdragsgivaren.
