# Att göra innan sidan publiceras

Webbplatsen är juridiskt komplett i **struktur** – policyer, villkor, ångerrätt
och företagsinformation finns på plats. Det som återstår är uppgifter som bara
du kan fylla i, plus två saker som måste vara gjorda innan sidan får gå live.

Sök på `[BYT UT]` i projektet för att hitta varje ställe. Just nu finns
**53 träffar** fördelade enligt listan längst ned.

---

## 1. Måste vara klart innan lansering

### 1.1 Omdömena på startsidan är påhittade

De fyra omdömena i avsnittet *Omdömen* och betyget som visas där är
exempeltexter. **Att publicera påhittade omdömen är förbjudet.** Det står
uttryckligen i punkt 23 b i den så kallade svarta listan (bilaga I till
direktiv 2005/29/EG, som gäller som svensk lag via marknadsföringslagen), och
Konsumentverket kan ingripa med förbud och sanktionsavgift.

Den maskinläsbara märkningen (`aggregateRating` med 4,9 och 87 omdömen) är
redan borttagen ur `index.html`, eftersom den var det allvarligaste – ett
konkret, kontrollerbart påstående om ett antal omdömen som inte finns.

**Kvar att göra:** ersätt de synliga omdömestexterna med riktiga omdömen från
riktiga kunder, som har lämnat dem och godkänt att de publiceras med namn. Har
du inga än – ta bort hela avsnittet tills du har det.

### 1.2 Bokningen skickas inte vidare

I `app.js` finns konstanten `BOKNING_URL`, som just nu är tom. Så länge den är
tom får kunden en bekräftelse på skärmen medan **du inte får någon bokning
alls**. Sätt den till adressen dit bokningarna ska skickas – ett
formulärskript hos webbhotellet, en e-posttjänst eller ett eget API.

Kravet är att mottagaren ligger i EU/EES eller har giltig skyddsmekanism, och
att du har **personuppgiftsbiträdesavtal** med leverantören innan den används
skarpt. Det följer av GDPR artikel 28.

### 1.3 HTTPS

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

## 3. Domän och delningsbild

| Uppgift | Var |
|---|---|
| Riktig domän | `canonical` och `og:url` i alla HTML-filer, `sitemap.xml`, `robots.txt` |
| Delningsbild 1200×630 px | `og:image` – filen `og-bild.jpg` finns inte än |

## 4. Leverantörer att lista i integritetspolicyn

Punkt 5 i `integritetspolicy.html` räknar upp mottagarna av personuppgifter
generellt. Fyll i vilka det faktiskt blir, och teckna
personuppgiftsbiträdesavtal med var och en:

- Faktura- och bokföringssystem
- Redovisningskonsult eller byrå
- Webbhotell
- E-postleverantör
- Eventuell mottagare av bokningarna (se 1.2)

## 5. Två bilder är fortfarande exempelbilder

`glasfasad-stort-glasparti.jpg`, `kontor-lokal-stadning.jpg` och
`kontorsputs-uppsala.jpg` är hämtade från Unsplash med fri licens. De är
lagliga att använda, men byt gärna till egna jobbfoton. Fönsterputsbilderna är
redan Linus egna.

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
| index.html | 8 |
| integritetspolicy.html | 9 |
| kopvillkor.html | 9 |
| cookies.html | 4 |
| 404.html | 4 |
| blogg.html | 4 |
| blogg-hur-ofta-putsa-fonster.html | 4 |
| blogg-vad-kostar-fonsterputs-uppsala.html | 4 |
| blogg-rut-avdrag-fonsterputs-stad.html | 4 |
| sitemap.xml | 1 |
| app.js | 1 |
| stil.css | 1 |
| **Totalt** | **53** |
