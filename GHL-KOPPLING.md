# Koppla offertformuläret till GoHighLevel

Koden är klar och testad. Det som återstår är två saker som bara går att göra
inne i GHL:s och Vercels egna gränssnitt — ingen AI-agent kan klicka ihop dem,
eftersom båda tjänsterna medvetet håller hemligheter och automationsbyggaren
borta från sina API:er. Vardera tar några minuter.

**Ingenting går förlorat medan du väntar på Linus riktiga mejladress.**
Kontakten skapas i GHL vid varje förfrågan oavsett om workflowet i punkt 2 är
byggt — de syns i **Contacts** i Linus Nyysti-kontot, taggade
`offertforfragan`. Workflowet är bara det som knuffar informationen vidare
till en inkorg automatiskt.

---

## 1. Skapa token och koppla in den i Vercel

**I GHL, inne i subaccountet Linus Nyysti:**

1. Settings → **Private Integrations** → **Create New Integration**.
2. Namn: t.ex. `Webbplats – offertformulär`.
3. Scope: kryssa i **`contacts.write`** (räcker — funktionen skapar bara
   kontakter, den läser inget).
4. Skapa, och kopiera token. Den börjar med `pit-` och visas bara en gång.

**I Vercel, i projektet `linus-fonsterputs-webb`:**

1. Settings → **Environment Variables**.
2. Lägg till en ny variabel:
   - **Name:** `GHL_PIT_TOKEN`
   - **Value:** tokenet du kopierade
   - **Environment:** Production (och gärna Preview också, för att kunna
     testa innan skarp lansering)
3. Spara. Miljövariabler läses in vid nästa deploy — antingen görs en ny
   push, eller trycker du **Redeploy** på senaste deploymenten.

Location-id behöver du **inte** sätta separat. Funktionen har
`GbjBGqJludS8vdATOGax` (Linus Nyysti) inbyggt som standard i
[api/offert.js](api/offert.js).

---

## 2. Bygg workflowet som mejlar Linus

**I GHL, inne i subaccountet Linus Nyysti:** Automation → Workflows →
**Create Workflow** → Start from Scratch.

### Trigger

**Contact Created**, med filter **Tags → contains → `offertforfragan`**.

*Varför just den taggen och inte "alla nya kontakter":* om ni någon gång
lägger in kontakter manuellt i samma subaccount (t.ex. från ett samtal) ska
de inte trigga samma mejl.

*Känd begränsning:* funktionen använder GHL:s `contacts/upsert`. Skickar
samma kund in en andra förfrågan med samma e-post eller telefonnummer,
**uppdateras** den befintliga kontakten i stället för att en ny skapas — och
då triggar inte "Contact Created" en andra gång. I praktiken ovanligt (de
flesta skickar en förfrågan), men värt att veta.

### Åtgärd: Send Email

**To:** Linus riktiga mejladress (fyll i när den finns).
**From:** valfri avsändare i kontot.
**Subject:**

```
Ny offertförfrågan – {{contact.tjnst}} – {{contact.frfrgningsnummer}}
```

**Body** (klistra in, GHL fyller i merge-taggarna automatiskt — tomma fält
visas bara som tomma rader, det är väntat eftersom fönsterputs och
kontorsputs fyller i olika fält):

```
Ny förfrågan via hemsidan.

FÖRFRÅGAN {{contact.frfrgningsnummer}}
Tjänst: {{contact.tjnst}}

KUND
Namn: {{contact.first_name}} {{contact.last_name}}
Telefon: {{contact.phone}}
E-post: {{contact.email}}
Adress: {{contact.address1}}

FÖNSTERPUTS (tomt om kunden valde kontorsputs)
Antal fönster: {{contact.antal_fnster}}
Varav med spröjs: {{contact.antal_fnster_med_sprjs}}
Fönsterkarmar: {{contact.tillgg_fnsterkarmar}}
Fönsterbleck: {{contact.tillgg_fnsterbleck}}
Spröjstvätt: {{contact.tillgg_sprjstvtt}}
Inglasad balkong/uterum: {{contact.tillgg_inglasad_balkong_eller_uterum}}
Vattenavvisande behandling: {{contact.tillgg_vattenavvisande_behandling}}

KONTORSPUTS (tomt om kunden valde fönsterputs)
Lokalyta: {{contact.lokalyta_kvm}} m²
Frekvens: {{contact.putsfrekvens}}

PRIS OCH TID
Kunden ser: {{contact.uppskattat_pris_kund_betalar}} kr
Före RUT/moms: {{contact.uppskattat_pris_fre_rut}} kr
Beräknad arbetstid: {{contact.berknad_arbetstid}}

SPECIFIKATION
{{contact.offertspecifikation}}

MEDDELANDE FRÅN KUND
{{contact.meddelande_frn_kund}}

—
Det här är en förfrågan, inget bokat avtal. Bekräfta pris och tid med
kunden innan arbetet påbörjas.
```

*Kontrollera merge-taggarna för namn/telefon/mejl/adress i GHL:s eget
fältväljarverktyg i mejleditorn* — `{{contact.first_name}}` osv. är GHL:s
vanliga standardtaggar, men editorn visar den exakta listan för just det här
kontot om något stavats annorlunda.

### Valfri åtgärd: SMS till Linus

Lägg till en andra åtgärd, **Send SMS**, till Linus mobilnummer, t.ex.:

```
Ny förfrågan ({{contact.tjnst}}) från {{contact.first_name}} {{contact.last_name}}, {{contact.phone}}. Se mejlet för detaljer.
```

### Publicera

Slå på workflowet (**Draft → Publish**, uppe till höger). Ett workflow i
utkastläge kör ingenting.

---

## 3. Testa hela kedjan

1. Öppna sajten, gå igenom offertguiden och skicka en riktig förfrågan.
2. Kolla **Contacts** i GHL — en ny kontakt ska dyka upp inom några sekunder,
   taggad `offertforfragan`, med alla fält ifyllda.
3. Kolla att mejlet kom fram (och SMS:et, om ni satte upp det).
4. Kör **Automation → Workflows → [ditt workflow] → History** för att se om
   något fallerat, om mejlet uteblev.

Går inte kontakten att skapa (steg 2 misslyckas): kolla Vercels
**Runtime Logs** för projektet — funktionen loggar exakt vilka
miljövariabelnamn den letade efter, och vad GHL svarade om anropet
avvisades.

---

## Referens: alla custom fields (fält-id är redan inkodade i funktionen)

| Fält | fieldKey (merge-tagg) |
|---|---|
| Tjänst | `contact.tjnst` |
| Antal fönster | `contact.antal_fnster` |
| Antal fönster med spröjs | `contact.antal_fnster_med_sprjs` |
| Tillägg Fönsterkarmar | `contact.tillgg_fnsterkarmar` |
| Tillägg Fönsterbleck | `contact.tillgg_fnsterbleck` |
| Tillägg Spröjstvätt | `contact.tillgg_sprjstvtt` |
| Tillägg Inglasad balkong/uterum | `contact.tillgg_inglasad_balkong_eller_uterum` |
| Tillägg Vattenavvisande behandling | `contact.tillgg_vattenavvisande_behandling` |
| Lokalyta kvm | `contact.lokalyta_kvm` |
| Putsfrekvens | `contact.putsfrekvens` |
| Uppskattat pris kund betalar | `contact.uppskattat_pris_kund_betalar` |
| Uppskattat pris före RUT | `contact.uppskattat_pris_fre_rut` |
| Beräknad arbetstid | `contact.berknad_arbetstid` |
| Offertspecifikation | `contact.offertspecifikation` |
| Meddelande från kund | `contact.meddelande_frn_kund` |
| Förfrågningsnummer | `contact.frfrgningsnummer` |

Alla 16 ligger redan skapade i Linus Nyysti-kontot (`model: contact`).
Behöver de återskapas: `GET /locations/{locationId}/customFields`.

## Innan riktiga kunduppgifter börjar flöda dit

Två juridiska saker måste vara på plats, oavsett hur workflowet ser ut:

1. **Personuppgiftsbiträdesavtal** med HighLevel, enligt GDPR artikel 28.
2. **Grund för överföring till USA.** HighLevel Inc. är amerikanskt.
   Kontrollera om kontot omfattas av EU–US Data Privacy Framework; är det
   inte det krävs EU-kommissionens standardavtalsklausuler.

**Då måste integritetspolicyn också ändras.** `integritetspolicy.html`
punkt 5 säger i dag att uppgifterna behandlas inom EU/EES. Det stämmer inte
längre när GHL är inkopplat — se punkt 1.1 i
[ATT-GORA-INNAN-LANSERING.md](ATT-GORA-INNAN-LANSERING.md).
