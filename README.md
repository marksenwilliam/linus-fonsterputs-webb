# Linus Fönsterputs

Webbplats med inbyggt bokningssystem för en enmansfirma inom fönsterputs och
kontorsputs i Uppsala län.

Statisk sajt utan byggsteg – ren HTML, CSS och JavaScript. Öppna
`index.html` i en webbläsare, eller lägg filerna på valfritt webbhotell.

## Innan sidan publiceras

Läs **[ATT-GORA-INNAN-LANSERING.md](ATT-GORA-INNAN-LANSERING.md)**. Där står
allt som återstår, bland annat två saker som måste vara gjorda innan sidan får
gå live: omdömena är påhittade exempeltexter, och bokningsformuläret skickar
inte vidare någonstans förrän `BOKNING_URL` i `app.js` är ifylld.

## Filer

| Fil | Innehåll |
|---|---|
| `index.html` | Startsida med hela bokningsvyn |
| `stil.css` | All formgivning, mobilen först |
| `app.js` | All JavaScript: priser, kalender, bokningsflöde |
| `blogg.html` + tre inlägg | Blogg för sökordstrafik |
| `kopvillkor.html` | Köpvillkor och ångerrätt |
| `integritetspolicy.html` | Personuppgiftsbehandling enligt GDPR |
| `cookies.html` | Kakpolicy (sidan sätter inga kakor) |
| `404.html` | Felsida |
| `bilder/` | Foton och logotyp |
| `typsnitt/` | Inter, egen hosting (SIL Open Font License 1.1) |
| `robots.txt`, `sitemap.xml` | För sökmotorer |

## Så är den byggd

- **Mobilen först.** Datorvyn ligger i `@media (min-width: 1024px)`, så
  mobillayouten går att ändra utan att röra skrivbordsvyn – och tvärtom.
- **Inga externa anrop.** Typsnitt, bilder och skript ligger på egen domän.
  Inga kakor, ingen besöksstatistik, ingenting sparas i webbläsaren.
- **Priser räknas ut i webbläsaren.** Fast pris för fönsterputs, kvadratmeter­
  baserat för kontorsputs. Alla belopp före RUT hålls jämna, så att halva
  summan alltid blir ett helt krontal och radsummorna stämmer mot totalen.
- **Tillgänglighet.** WCAG 2.1 AA på kontrast, tangentbordsnavigering och
  `prefers-reduced-motion`.

## Att känna till vid ändringar

Bokningsvyn ligger **duplicerad i nio HTML-filer**. Ändrar du något i
formuläret måste ändringen speglas i samtliga. Redigera `index.html` och kopiera
sedan de delade blocken därifrån till övriga sidor – header, mobilmeny, sidfot
och hela bokningsvyn. Alternativet är att låta `app.js` bygga formuläret från en
enda mall, vilket tar bort problemet permanent.
