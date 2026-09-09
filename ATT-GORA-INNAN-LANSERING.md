# Att göra innan sidan publiceras

Webbplatsen är juridiskt komplett i **struktur** – policyer, villkor, ångerrätt
och företagsinformation finns på plats. Det som återstår är uppgifter som bara
du kan fylla i, plus två saker som måste vara gjorda innan sidan får gå live.

Sök på `[BYT UT]` i projektet för att hitta varje ställe. Just nu finns
**36 träffar** fördelade enligt listan längst ned.

---

## 0. Juridisk genomgång 9 september 2026

Kontrollerat mot gällande regler och åtgärdat:

| Vad | Resultat |
|---|---|
| Kakor – LEK | **Rättat.** Kakpolicyn hänvisade till 6 kap. 18 § i den gamla lagen (2003:389). Bestämmelsen ligger sedan 3 juni 2022 i **9 kap. 28 § lagen (2022:482) om elektronisk kommunikation**. |
| Kakor – i praktiken | Sidan sätter inga kakor, använder ingen localStorage och gör inga externa anrop. Ingen samtyckesruta behövs därför. Verifierat i koden. |
| GDPR artikel 13 | Uppfyllt – ändamål, rättslig grund per ändamål, lagringstider, mottagare, rättigheter och klagomål till IMY. Saknar bara personuppgiftsansvarigs identitet (se punkt 2). |
| Distansavtalslagen | Uppfyllt – information innan avtal, 14 dagars ångerrätt, Konsumentverkets standardformulär, och den uttryckliga begäran om utförande inom ångerfristen som en **egen, omarkerad, obligatorisk kryssruta**. Verifierat att ingen ruta är förifylld. |
| Konsumenttjänstlagen | Uppfyllt – reklamation inom skälig tid, två månader alltid i rätt tid, tre års reklamationsrätt. |
| Prisinformationslagen | Uppfyllt – privatpriser inklusive moms och RUT med summan före avdrag bredvid, företagspriser tydligt märkta exklusive moms. |
| RUT-taket | **Rättat.** Sidan angav 75 000 kr per person och år utan att nämna att taket delas med ROT (högst 50 000 kr får vara ROT). Klargörande inlagt på tre ställen. |
| Marknadsföringslagen | Åtgärdat – inga påhittade omdömen eller betyg någonstans. Galleriets notis anger nu vilka bilder som är från utförda jobb och vilka som är exempelbilder (se punkt 5). |
| ODR-plattformen | Inget att göra. EU:s ODR-plattform stängdes 20 juli 2025 och förordning 524/2013 är upphävd – länken får inte längre finnas. Sidan hänvisar rätt, till ARN. |
| WCAG 2.1 AA – kontrast | **Rättat.** Sekundär text (`--text-2`) låg på 4,37:1 mot den isblå bakgrunden, under kravet 4,5:1. Tonen är mörkad till `#5E6B82`. Samtliga färgpar beräknade och godkända. |
| WCAG 2.1 AA – struktur | Uppfyllt – `lang="sv"`, en h1 per sida, hoppa-till-innehåll-länk, alt-text på varje bild, label eller aria-label på varje fält, tillgängligt namn på varje knapp. |
| Delningsbild | **Fixat.** `og-bild.jpg` (1200×630) skapad ur heroifotot. Alla sidor pekar nu på den, med måtten angivna. |
| Interna länkar | Inga trasiga länkar, ankare, ikoner eller bildreferenser på någon av de nio sidorna. |

**Kvar innan publicering:** punkt 1 och 2 nedan. Båda kräver uppgifter som bara
Linus kan lämna – sidan kan inte gå live utan dem.

---

## 0.1 Vad som ändrades senast

- **Omdömesavsnittet är borttaget i sin helhet.** De sex exempelomdömena,
  betyget 4,9, raden ”Baserat på 87 omdömen på Google”, Google-loggan och
  stjärnbetyget i heron är borta ur `index.html`. Navigationslänkarna till
  *Omdömen* är borttagna på alla nio sidor, liksom den CSS och de SVG-symboler
  som bara användes där.
- **Förhandsvisningsläget är avstängt.** Bannern högst upp, varningsrutan
  ovanför omdömena, `noindex`-taggarna, robotspärren i `robots.txt` och
  `vercel.json` med `X-Robots-Tag` är borta. Sidan är alltså i skarpt läge.

> **Sidan är därmed indexerbar.** Publicera den inte förrän punkt 1 och 2
> nedan är avklarade – organisationsnummer och adress är fortfarande
> platshållartext.

Vill du tillfälligt tillbaka till granskningsläge: `node forhandsvisning.js pa`.
Skriptets omdömesmärkning har inget att märka ut längre, men bannern och
noindex fungerar som förut.

---

## 1. Måste vara klart innan lansering

### 1.1 Bokningen skickas inte vidare – GoHighLevel ska kopplas på

I `app.js` finns konstanten `BOKNING_URL`, som just nu är tom. Så länge den är
tom får kunden en bekräftelse på skärmen medan **ingen bokning når fram**.

**Planen är GoHighLevel.** Sätt `BOKNING_URL` till webhook-adressen från ett
inkommande webhook-steg i ett GHL-workflow. `skickaBokning` postar redan JSON
med tjänst, tid, pris, kunduppgifter och de två godkännandena, vilket är det
format GHL tar emot.

Två saker måste vara på plats innan riktiga kunduppgifter börjar flöda dit:

1. **Personuppgiftsbiträdesavtal** med HighLevel, enligt GDPR artikel 28.
2. **Grund för överföring till USA.** HighLevel Inc. är amerikanskt, så
   uppgifterna lämnar EU/EES. Kontrollera om de är anslutna till EU–US Data
   Privacy Framework; är de inte det krävs EU-kommissionens
   standardavtalsklausuler plus en bedömning av överföringen.

**Då måste också integritetspolicyn ändras.** `integritetspolicy.html` punkt 5
säger i dag att uppgifterna behandlas inom EU/EES. Det stämmer inte längre när
GHL är inkopplat. Skriv om stycket så att det namnger HighLevel som mottagare,
anger att uppgifter överförs till USA och vilken skyddsmekanism som gäller.
Lägg samtidigt in HighLevel i listan över mottagare i samma punkt.

### 1.2 HTTPS

Sidan måste nås över `https://`. Personuppgifter (namn, adress, telefon)
skickas genom bokningsformuläret, och det får inte gå okrypterat. Sätt också
upp automatisk omdirigering från `http://` till `https://`.

---

## 2. Företagsuppgifter att fylla i

Dessa är obligatoriska enligt **8 § lagen om elektronisk handel (2002:562)**
och enligt **GDPR artikel 13**. De ska stå på sidan, lätt att hitta.

| Uppgift | Var den ska in |
|---|---|
| Organisationsnummer | Sidfoten på alla sidor, `kopvillkor.html`, `integritetspolicy.html` |
| Momsregistreringsnummer | Sidfoten, `kopvillkor.html` |
| Geografisk adress | Sidfoten, `kopvillkor.html`, `integritetspolicy.html` |
| Riktig e-postadress | Sidfoten och samtliga policysidor (nu `hej@linusfonsterputs.se`) |
| Firmanamn enligt registreringsbevis | Om det skiljer sig från "Linus Fönsterputs" |

**Även den strukturerade datan.** `LocalBusiness`-blocket högst upp i
`index.html` innehåller adressen `Gatan 1, 750 00 Uppsala`, som är påhittad.
Den syns inte på sidan men läses av sökmotorer. Byt till den riktiga adressen,
eller ta bort `address`-objektet om ingen besöksadress ska publiceras.

## 3. Domän och delningsbild

| Uppgift | Var |
|---|---|
| Riktig domän | `canonical` och `og:url` i alla HTML-filer, `sitemap.xml`, `robots.txt`, `@id` och `url` i `LocalBusiness`-blocket |
| Delningsbild 1200×630 px | `og:image` – filen `og-bild.jpg` finns inte än |

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

## 7. Om du vill ha tillbaka omdömen

Riktiga omdömen får publiceras, men bara om de kommer från kunder som lämnat
dem och godkänt att de visas med namn. Påhittade omdömen är förbjudna enligt
punkt 23 b i svarta listan (bilaga I till direktiv 2005/29/EG, som gäller som
svensk lag via marknadsföringslagen), och Konsumentverket kan ingripa med
förbud och sanktionsavgift.

Vill du visa ett Google-betyg måste siffran och antalet stämma med den
faktiska Google-profilen den dagen sidan publiceras, och den behöver ses över
när nya omdömen kommer in.

---

## Vad som redan är gjort

- **Integritetspolicy** enligt GDPR artikel 13 – ändamål, rättslig grund,
  lagringstider, mottagare, rättigheter och klagomål till IMY.
- **Köpvillkor** med företagsinformation, priser, RUT, betalning, avbokning,
  reklamation enligt konsumenttjänstlagen och tvistlösning via ARN.
- **Ångerrätt** enligt distansavtalslagen: information innan avtalet ingås,
  uttrycklig begäran om utförande inom ångerfristen som egen kryssruta, och
  Konsumentverkets standardformulär.
- **Kakpolicy** – sidan sätter inga kakor, använder ingen besöksstatistik och
  gör inga externa anrop. Därför behövs ingen samtyckesruta.
- **Typsnittet Inter hostas lokalt** i stället för från Google. Inga
  besökar-IP-adresser lämnar sidan.
- **Priser** anges inklusive moms och RUT för privatpersoner, och exklusive
  moms för företag – enligt prisinformationslagen.
- **robots.txt**, **sitemap.xml** och en **404-sida**.
- **WCAG 2.1 AA** på kontrast och tangentbordsnavigering.
- **Inga påhittade omdömen eller betyg** någonstans på sidan.

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
| index.html | 7 |
| integritetspolicy.html | 5 |
| kopvillkor.html | 4 |
| cookies.html | 3 |
| 404.html | 3 |
| blogg.html | 3 |
| blogg-hur-ofta-putsa-fonster.html | 3 |
| blogg-vad-kostar-fonsterputs-uppsala.html | 3 |
| blogg-rut-avdrag-fonsterputs-stad.html | 3 |
| sitemap.xml | 1 |
| app.js | 1 |
| **Totalt** | **36** |
