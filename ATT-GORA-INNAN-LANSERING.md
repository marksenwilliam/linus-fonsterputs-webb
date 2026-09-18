# Att göra innan sidan publiceras

Webbplatsen är juridiskt komplett i **struktur** – policyer, villkor, ångerrätt
och företagsinformation finns på plats. Det som återstår är uppgifter som bara
du kan fylla i, plus två saker som måste vara gjorda innan sidan får gå live.

Sök på `[BYT UT]` i projektet för att hitta varje ställe. Just nu finns
**37 träffar** fördelade enligt listan längst ned.

---

## 0. Juridisk genomgång 9 september 2026

Kontrollerat mot gällande regler och åtgärdat:

| Vad | Resultat |
|---|---|
| Kakor – LEK | **Rättat.** Kakpolicyn hänvisade till 6 kap. 18 § i den gamla lagen (2003:389). Bestämmelsen ligger sedan 3 juni 2022 i **9 kap. 28 § lagen (2022:482) om elektronisk kommunikation**. |
| Kakor – i praktiken | **Inaktuell rad, rättad 18 september 2026.** Stämde när den skrevs, men sedan dess har Cookiebot, Google Analytics 4, Cloudflare Turnstile och en Google-karta tillkommit. Kakpolicyn och integritetspolicyn påstod fortfarande att sidan inte sätter några kakor och uppmanade besökaren att kontrollera i utvecklarverktygen att det var tomt. Båda sidorna är omskrivna efter hur sidan faktiskt fungerar: nödvändiga kakor (Cookiebot, Turnstile), statistik efter samtycke (GA4) och marknadsföring efter samtycke (kartan). |
| GDPR artikel 13 | Uppfyllt – ändamål, rättslig grund per ändamål, lagringstider, mottagare, rättigheter och klagomål till IMY. Saknar bara personuppgiftsansvarigs identitet (se punkt 2). |
| Distansavtalslagen | Uppfyllt – information innan avtal, 14 dagars ångerrätt, Konsumentverkets standardformulär, och den uttryckliga begäran om utförande inom ångerfristen som en **egen, omarkerad, obligatorisk kryssruta**. Verifierat att ingen ruta är förifylld. |
| Konsumenttjänstlagen | Uppfyllt – reklamation inom skälig tid, två månader alltid i rätt tid, tre års reklamationsrätt. |
| Prisinformationslagen | Uppfyllt – privatpriser inklusive moms och RUT med summan före avdrag bredvid, företagspriser tydligt märkta exklusive moms. |
| RUT-taket | **Rättat.** Sidan angav 75 000 kr per person och år utan att nämna att taket delas med ROT (högst 50 000 kr får vara ROT). Klargörande inlagt på tre ställen. |
| Marknadsföringslagen | Åtgärdat – inga påhittade omdömen eller betyg någonstans. Omdömena på sidan är 30 riktiga Google-omdömen, avskrivna ordagrant och utan gallring (se punkt 7). Galleriets notis anger nu vilka bilder som är från utförda jobb och vilka som är exempelbilder (se punkt 5). |
| ODR-plattformen | Inget att göra. EU:s ODR-plattform stängdes 20 juli 2025 och förordning 524/2013 är upphävd – länken får inte längre finnas. Sidan hänvisar rätt, till ARN. |
| WCAG 2.1 AA – kontrast | **Rättat.** Sekundär text (`--text-2`) låg på 4,37:1 mot den isblå bakgrunden, under kravet 4,5:1. Tonen är mörkad till `#5E6B82`. Samtliga färgpar beräknade och godkända. |
| WCAG 2.1 AA – struktur | Uppfyllt – `lang="sv"`, en h1 per sida, hoppa-till-innehåll-länk, alt-text på varje bild, label eller aria-label på varje fält, tillgängligt namn på varje knapp. |
| Delningsbild | **Fixat.** `og-bild.jpg` (1200×630) skapad ur heroifotot. Alla sidor pekar nu på den, med måtten angivna. |
| Interna länkar | Inga trasiga länkar, ankare, ikoner eller bildreferenser på någon av de nio sidorna. |

**Kvar innan publicering:** punkt 1 och 2 nedan. Båda kräver uppgifter som bara
Linus kan lämna – sidan kan inte gå live utan dem.

---

## 0.1 Vad som ändrades senast

- **Omdömesavsnittet är tillbaka med riktigt innehåll.** Sektionen
  `#omdomen` på startsidan är ombyggd som karusell (desktop) och stapel med
  *Ladda fler* (mobil), och navigationslänkarna till *Omdömen* finns igen på
  alla sidor. Innehållet är 30 riktiga Google-omdömen, avskrivna ordagrant –
  se punkt 7. De sex påhittade exempelomdömena, betyget 4,9 och raden ”Baserat
  på 87 omdömen på Google” från den gamla versionen är inte återinlagda
  någonstans, och stjärnbetyget i heron är fortfarande borta.
- **Förhandsvisningsläget är avstängt.** Bannern högst upp, varningsrutan
  ovanför omdömena, `noindex`-taggarna, robotspärren i `robots.txt` och
  `vercel.json` med `X-Robots-Tag` är borta. Sidan är alltså i skarpt läge.

> **Sidan är därmed indexerbar.** Publicera den inte förrän punkt 1 och 2
> nedan är avklarade – den geografiska adressen är fortfarande
> platshållartext.

Vill du tillfälligt tillbaka till granskningsläge: `node forhandsvisning.js pa`.
Skriptets omdömesmärkning har inget att märka ut längre, men bannern och
noindex fungerar som förut.

---

## 1. Måste vara klart innan lansering

### 1.1 GoHighLevel – två manuella steg kvar

Sidan skickar inte längre något till en webhook-URL. Formuläret är sedan
september 2026 en offertförfrågan som postar till `/api/offert` – en egen
serverless-funktion (`api/offert.js`) som skapar en kontakt direkt i GHL via
16 färdigskapade custom fields i subaccountet Linus Nyysti.

**Det som återstår går inte att göra via API – varken för mig eller för
någon annan AI-agent.** Både GHL:s Private Integration-tokens och
workflow-byggaren är UI-låsta av säkerhetsskäl. Fullständig, klicka-färdig
guide med färdigskriven mejltext: **[GHL-KOPPLING.md](GHL-KOPPLING.md)**.

Kort sagt:
1. Skapa en Private Integration-token i GHL, lägg den som `GHL_PIT_TOKEN` i
   Vercels miljövariabler.
2. Bygg ett workflow i GHL (trigger: ny kontakt taggad `offertforfragan` →
   åtgärd: mejla Linus).

Kontakterna sparas i GHL redan nu, även innan workflowet är byggt – så inga
förfrågningar går förlorade medan Linus mejladress väntar på att skapas.

**Integritetspolicyn är redan uppdaterad för det här.** Punkt 5 i
`integritetspolicy.html` namnger HighLevel Inc som mottagare, anger att
uppgifter överförs till USA och att överföringen vilar på EU–U.S. Data Privacy
Framework. Inget mer behöver göras där för GHL:s skull. Se även
juridikavsnittet längst ned i GHL-KOPPLING.md.

### 1.2 Cloudflare Turnstile – secret key saknas

Offertformuläret har fått spamskydd (Cloudflare Turnstile, sitekey
`0x4AAAAAAE1mnkgxauk_GAQp`, verifieras i `api/offert.js`). Secret key kan
bara hämtas i Cloudflare-dashboarden – inte via API – så:

1. Hämta widgetens secret key i Cloudflare-dashboarden (Turnstile-sidan).
2. Lägg den som `TURNSTILE_SECRET_KEY` i Vercels miljövariabler.

**Utan den svarar `/api/offert` 400 på varje förfrågan** – funktionen är
byggd att fail-closed, precis som GHL-token i punkt 1.1. Sätt den innan
detta går live, annars slutar formuläret ta emot förfrågningar helt.

### 1.3 HTTPS

Sidan måste nås över `https://`. Personuppgifter (namn, adress, telefon)
skickas genom bokningsformuläret, och det får inte gå okrypterat. Sätt också
upp automatisk omdirigering från `http://` till `https://`.

---

## 2. Företagsuppgifter att fylla i

Dessa är obligatoriska enligt **8 § lagen om elektronisk handel (2002:562)**
och enligt **GDPR artikel 13**. De ska stå på sidan, lätt att hitta.

| Uppgift | Var den ska in | Status |
|---|---|---|
| Organisationsnummer | Sidfoten på alla sidor, `kopvillkor.html`, `integritetspolicy.html`, strukturerad data | **Klart** – `031221-5551` |
| Momsregistreringsnummer | Sidfoten, `kopvillkor.html`, strukturerad data | **Klart** – `SE031221555101`. Numret är härlett ur org.nr enligt standardregeln (`SE` + tio siffror + `01`). Stäm av mot registerutdraget från Skatteverket. |
| Geografisk adress | Sidfoten, `kopvillkor.html`, `integritetspolicy.html` | Kvarstår – platshållartext |
| Riktig e-postadress | Sidfoten och samtliga policysidor | **Klart** – `kontakt@linusfonsterputs.se`. Brevlådan måste finnas innan sidan går live. |
| Firmanamn enligt registreringsbevis | Om det skiljer sig från "Linus Fönsterputs" | Kontrollera |

**Den strukturerade datan (uppdaterad 2026-09-18).** `LocalBusiness`-blocket
ligger nu på alla sju indexerbara sidor med samma `@id`
(`https://linusfonsterputs.se/#business`), så att Google ser en enda
verksamhet i stället för en per sida. Bloggsidornas `publisher` pekar på samma
`@id`. Blocket innehåller org.nr (`taxID`), momsnummer (`vatID`), e-post,
telefon, öppettider, tjänstekatalog och `areaServed`.

De två sidor som är `noindex` – `404.html` och `tack.html` – har medvetet
inget block, eftersom sökmotorer aldrig läser strukturerad data där.

`address` anges bara på ort- och länsnivå (Uppsala, Uppsala län, SE). Den
tidigare påhittade adressen `Gatan 1, 750 00 Uppsala` är sedan 2026-09-14
borta, och någon gatuadress läggs inte tillbaka på egen hand – fel uppgift
till Google är värre än ingen alls. Fyll på med `streetAddress`, `postalCode`
och `geo` bara om Linus vill publicera en riktig, offentlig besöksadress
(annars är det en typisk service-area-verksamhet, vilket `areaServed` täcker).

**Blocket är duplicerat i åtta filer.** Ändrar du en uppgift i det – e-post,
telefon, priser, öppettider – måste ändringen speglas i samtliga, precis som
för sidfoten och bokningsvyn.

## 3. Domän och delningsbild

| Uppgift | Var |
|---|---|
| Riktig domän | `canonical` och `og:url` i alla HTML-filer, `sitemap.xml`, `robots.txt`, `@id` och `url` i `LocalBusiness`-blocket |
| Delningsbild 1200×630 px | `og:image` – filen `og-bild.jpg` finns inte än |

## 3.1 Google-kartan i sidfoten – inbäddningen saknas

Sidfoten har en Google-karta på alla tio sidor, men **den visar bara området,
inte företagsprofilen**. Länken *Öppna i Google Maps* pekar däremot rätt.

### Varför det inte går att lösa härifrån

En inbäddning av formen `?q=<text>&output=embed` gör en vanlig Google-sökning
och bygger ett eget kort av träffen. Det kortet är **inte** kopplat till
företagsprofilen, och skrev därför ut *"Inga recensioner"* bredvid namnet –
trots att profilen har 30. Det gick inte att laga genom att byta söktext:
bara en riktig profilinbäddning bär betyg och antal.

Adressen är därför bytt mot en ren områdeskarta över Uppsala, som åtminstone
inte påstår något felaktigt, tills den riktiga inbäddningen finns.

Den riktiga inbäddningskoden går inte att hämta från utvecklingsmiljön:
`share.google`, `google.com` och `maps.google.com` är alla blockerade av
nätverkspolicyn.

### Gör så här

1. Öppna Google Företagsprofil → **Dela** → **Bädda in en karta**.
2. Kopiera `src`-adressen ur iframe-koden. Den ska börja med
   `https://www.google.com/maps/embed?pb=` – börjar den med `maps.google.com/maps?q=`
   är det en sökning igen, och då kommer "Inga recensioner" tillbaka.
3. Byt ut `data-cookieblock-src` på `<iframe>` i sidfotsblocket, på alla tio
   sidor. `href` på länken *Öppna i Google Maps* ska stå kvar som den är.
   Sök på `[BYT UT] Adressen nedan visar bara området` för att hitta dem.
4. Byt gärna rubriken `<h4>Var jag jobbar</h4>` mot något som passar ett
   profilkort, t.ex. *Linus Fönsterputs på Google*.

Kartan är samtyckesspärrad: iframen har `data-cookieblock-src` i stället för
`src`, och Cookiebot byter först när besökaren godkänt marknadsföringskakor.
Utan samtycke visas en ruta med en vanlig länk, och inget anrop går till
Google. Växlingen sker i CSS (`iframe:not([src])`), så den fungerar även på
`tack.html` som inte laddar `app.js`.

`vercel.json` har fått `https://www.google.com` och `https://maps.google.com`
i `frame-src` – utan det blockerar sidans egen CSP kartan.

## 4. Leverantörer att lista i integritetspolicyn

Punkt 5 i `integritetspolicy.html` räknar upp mottagarna av personuppgifter
generellt. Fyll i vilka det faktiskt blir, och teckna
personuppgiftsbiträdesavtal med var och en:

- Faktura- och bokföringssystem
- Redovisningskonsult eller byrå
- Webbhotell
- E-postleverantör
- Eventuell mottagare av bokningarna (se 1.1)

## 5. Tre bilder är inte foton från utförda jobb

`kontor-lokal-stadning.jpg` och `kontorsputs-uppsala.jpg` är hämtade från
Unsplash med fri licens. De är lagliga att använda, men byt gärna till egna
jobbfoton.

`villa-fonster-putsade.jpg` i bildspelet är **AI-genererad** (Higgsfield,
nano_banana_pro, 2 krediter) och ersätter den tidigare glasfasadbilden.
Motivet är en villafasad med nyputsade fönster, men det är inget foto från
ett verkligt jobb.

**Värt att tänka på:** avsnittet heter *Bilder på fönsterputsning* och läses
som en portfölj. Samma regelverk som gäller påhittade omdömen –
marknadsföringslagens förbud mot vilseledande framställningar – träffar också
bilder som ger intryck av utfört arbete som inte är utfört. Så länge tre av
sju galleribilder inte kommer från egna jobb bör de bytas ut, eller
avsnittet märkas så att det framgår vilka bilder som är illustrationer.

Fönsterputsbilderna med Linus i bild är redan hans egna.

## 6. Ta bort Agentation innan lansering

`agentation-lokal.js` är ett utvecklingsverktyg som hämtar React och
Agentation från esm.sh och visar ett verktygsfält där du kan klicka på
element och lämna kommentarer. Det kör bara på `localhost` – första raden
avbryter på alla andra domäner, så besökare laddar aldrig något.

Radera ändå filen och script-taggen längst ned i de nio HTML-sidorna innan
sidan går live, så att ingen utvecklingskod följer med i produktionen.

## 7. Omdömen – riktiga, och så här håller du dem aktuella

Omdömesavsnittet ligger på startsidan (`#omdomen`, mellan galleriet och
vanliga frågor), byggt som en karusell på desktop och en stapel med
*Ladda fler* på mobil. **Innehållet är 30 riktiga Google-omdömen**, avskrivna
ordagrant med emojier och egna signaturer i behåll. Brickan överst visar
5,0 och 30 omdömen och länkar till företagsprofilen.

### Var innehållet ligger

Allt på ett ställe: avsnitt 7 i `app.js`.

| Vad | Var | Att veta |
|---|---|---|
| Omdömena | `OMDOMEN`-listan | Ett objekt per omdöme: `namn`, `roll`, `betyg` (1–5) och `text`. |
| Sammanfattningen | `BETYG`-objektet | `snitt` och `antal` måste stämma med Google-profilen, `profil` är länken dit. Brickan visas först när `antal` är större än 0. |

Tre saker sköter sig själva:

- **Tom lista döljer hela sektionen.** Ligger inget i `OMDOMEN` renderas
  ingenting alls.
- **Omdömen utan text** (åtta kunder satte bara betyg) får en kort rad i
  stapeln på mobilen i stället för citat, och hoppas över i karusellen – ett
  kort som bara säger "betyg utan text" ger inget i ett flöde som rullar
  förbi. De räknas ändå in i siffran 30 på brickan.
- **Den gula varningsrutan** ovanför korten visas bara om något objekt har
  `platshallare: true`. Den är alltså borta nu, och kommer tillbaka om du
  lägger in ett exempel under tiden du väntar på ett riktigt omdöme.

### När nya omdömen kommer in

1. Lägg till objektet överst i `OMDOMEN` (profilen visar nyast först).
2. Räkna upp `antal` i `BETYG`, och justera `snitt` om medelbetyget ändrats.

Fältet `roll` är tomt på alla trettio. Det är avsiktligt: vilken tjänst varje
omdöme gällde framgår inte av profilen, och ska inte gissas. Vill du använda
fältet framöver ska det stå kort och rymmas på en rad bredvid namnet.

### Reglerna

Riktiga omdömen får publiceras, men bara om de kommer från kunder som lämnat
dem och godkänt att de visas med namn. Namnen som står på sidan är exakt de
kunderna själva publicerat på Google, med versaler och gemener som de skrev
dem. Skriv av texten ordagrant – korta inte, skriv inte om och slå inte ihop
flera omdömen till ett. Plocka heller inte bort omdömen för att snygga till
urvalet: ett tillrättalagt urval är i sig vilseledande. Påhittade omdömen är
förbjudna enligt punkt 23 b i svarta listan (bilaga I till direktiv
2005/29/EG, som gäller som svensk lag via marknadsföringslagen), och
Konsumentverket kan ingripa med förbud och sanktionsavgift.

Betyget och antalet måste stämma med den faktiska Google-profilen den dagen
sidan publiceras, och behöver ses över när nya omdömen kommer in.

Ta gärna med omdömen som inte är femstjärniga. En sida med enbart toppbetyg
läses som tillrättalagd, och plockar man bort de sämre omdömena är urvalet i
sig vilseledande.

### Strukturerad data: lägg inte in betyget där

`aggregateRating` och `review` är medvetet utelämnade ur `LocalBusiness`-blocket.
Google räknar omdömen som företaget självt publicerar om sig självt som
*self-serving reviews*, och de ger inte utökade sökresultat för `LocalBusiness` –
de kan dessutom leda till en manuell åtgärd. Betyget hör hemma på
Google-profilen; sektionen på sidan länkar dit i stället.

---

## Vad som redan är gjort

- **Integritetspolicy** enligt GDPR artikel 13 – ändamål, rättslig grund,
  lagringstider, mottagare, rättigheter och klagomål till IMY.
- **Köpvillkor** med företagsinformation, priser, RUT, betalning, avbokning,
  reklamation enligt konsumenttjänstlagen och tvistlösning via ARN.
- **Ångerrätt** enligt distansavtalslagen: information innan avtalet ingås,
  uttrycklig begäran om utförande inom ångerfristen som egen kryssruta, och
  Konsumentverkets standardformulär.
- **Kakpolicy** – redovisar kaka för kaka vad som sätts och när: nödvändiga
  (Cookiebot, Cloudflare Turnstile), statistik efter samtycke (Google
  Analytics 4) och marknadsföring efter samtycke (Google-kartan i sidfoten).
  Samtycket hanteras av Cookiebot och kan ändras via *Kakinställningar* i
  sidfoten på varje sida.
- **Typsnittet Inter hostas lokalt** i stället för från Google. Inga
  besökar-IP-adresser lämnar sidan för typsnittens skull.
- **Priser** anges inklusive moms och RUT för privatpersoner, och exklusive
  moms för företag – enligt prisinformationslagen.
- **robots.txt**, **sitemap.xml** och en **404-sida**.
- **Strukturerad data** – `LocalBusiness` på alla indexerbara sidor med org.nr,
  momsnummer, kontaktuppgifter, öppettider och tjänstekatalog, plus `FAQPage`
  på startsidan och `Blog`/`BlogPosting` på bloggen.
- **WCAG 2.1 AA** på kontrast och tangentbordsnavigering.
- **Inga påhittade omdömen eller betyg** någonstans på sidan. De 30 omdömena i
  `#omdomen` är riktiga Google-omdömen, ordagrant avskrivna, och brickan visar
  profilens faktiska 5,0 av 30 (punkt 7).

## Om tillgänglighetslagen

Lagen om vissa produkters och tjänsters tillgänglighet (2023:254) gäller sedan
28 juni 2025 för bland annat e-handelstjänster. Webbplatsen med sin bokning
räknas som en sådan tjänst.

**Mikroföretag som tillhandahåller tjänster är undantagna.** Ett mikroföretag
har *färre än 10 anställda* och dessutom en omsättning *eller* en
balansomslutning på högst 2 miljoner euro, alltså ungefär 23 miljoner kronor.
Båda villkoren ska vara uppfyllda. För en fönsterputsfirma är det antalet
anställda som är den gräns som kan nås först – och där går strecket vid tio,
inte vid två eller tre.

Undantaget gäller **tjänster**. Om verksamheten någon gång även börjar sälja
produkter via webben gäller andra regler för själva produkterna, och då är
mikroföretag inte undantagna på samma sätt.

Sidan är byggd mot WCAG 2.1 AA oavsett. Växer företaget förbi tio anställda
behöver alltså ingenting byggas om.

---

## Platshållare per fil

| Fil | Antal |
|---|---|
| index.html | 6 |
| integritetspolicy.html | 5 |
| kopvillkor.html | 4 |
| cookies.html | 3 |
| 404.html | 3 |
| tack.html | 3 |
| blogg.html | 3 |
| blogg-hur-ofta-putsa-fonster.html | 3 |
| blogg-vad-kostar-fonsterputs-uppsala.html | 3 |
| blogg-rut-avdrag-fonsterputs-stad.html | 3 |
| sitemap.xml | 1 |
| **Totalt** | **37** |

Kvar är tre saker: domänen (som ska bytas överallt när den är klar), den
geografiska adressen och kartlänken i sidfoten (punkt 3.1). Org.nr, momsnummer
och e-postadress är ifyllda.

Omdömena räknas inte in här: de är riktiga och ligger i `OMDOMEN` i `app.js`,
inte bakom en `[BYT UT]`-markering. Se punkt 7.
