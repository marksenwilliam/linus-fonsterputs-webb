/* ==========================================================================
   OFFERTFÖRFRÅGAN → GOHIGHLEVEL

   Serverless-funktion på Vercel. Sajten i övrigt är statisk, och statiska
   sidor kan inte läsa Vercels environment variables – gjorde de det skulle
   token ligga öppet i sidkällan. Därför går formuläret hit i stället:
   webbläsaren postar JSON till /api/offert, funktionen lägger på token på
   serversidan och skapar kontakten i GoHighLevel.

   Ingen bokning sker här. Kontakten hamnar i subaccountet, och därifrån
   sköter ett GHL-workflow mejlet och SMS:et till Linus.

   MILJÖVARIABLER
     GHL_PIT_TOKEN     Private Integration-token, börjar med pit-
     GHL_LOCATION_ID   Subaccountets id (har ett förinställt värde nedan)

   Funktionen accepterar även några vanliga alternativnamn, så att den
   fungerar oavsett vad variablerna råkade döpas till i Vercel. Saknas de
   svarar den 500 med vilka namn den letade efter – aldrig med något värde.
   ========================================================================== */

'use strict';

/* GHL:s v2-API. Version-headern är obligatorisk och versionsstyr svaret. */
var GHL_URL = 'https://services.leadconnectorhq.com/contacts/upsert';
var GHL_VERSION = '2021-07-28';

var TOKEN_NAMN = [
  'GHL_PIT_TOKEN', 'GHL_PRIVATE_INTEGRATION_TOKEN', 'GHL_TOKEN',
  'GHL_API_KEY', 'GOHIGHLEVEL_API_KEY', 'LEADCONNECTOR_TOKEN'
];
var LOCATION_NAMN = [
  'GHL_LOCATION_ID', 'GHL_SUBACCOUNT_ID', 'GOHIGHLEVEL_LOCATION_ID', 'LOCATION_ID'
];

/* Subaccountet Linus Nyysti. Inget hemligt – bara en rimlig standard om
   variabeln inte råkar finnas. */
var STANDARD_LOCATION = 'GbjBGqJludS8vdATOGax';

/* Fält-id från subaccountet. GHL kapar svenska tecken i fieldKey
   ("contact.tjnst"), så id används i stället – de är stabila.
   Hämta om vid behov: GET /locations/{locationId}/customFields */
var FALT = {
  tjanst:        'NHDG83Fw8NZhNvORYIu7',
  antalFonster:  't5c9z3eQgN9V7x7JF1Cf',
  antalSprojs:   '6DHkDkxmHu96CXuUhOsy',
  karmar:        '0EihuU3tqCWKlFQIWrxx',
  bleck:         'xQ2CB0MrZ4DjvUm6vswm',
  sprojstvatt:   'lU9ei89R3jUxmVK1tv3T',
  balkong:       'dKgqQv9uYvptTBYPoAys',
  behandling:    'GFKxPc5Wkxq1ZXDZmYpX',
  lokalyta:      'NXko2EwGtYH27xkA1nOE',
  frekvens:      '17qm7ed6yBWCkhP2881U',
  prisKund:      'PqMbsRxkJIpzYIwtifxK',
  prisForeRut:   'FSFVAKi3klvs2IqWwaiw',
  arbetstid:     '76noGjgho0z5jqDDamzf',
  specifikation: '0dHfdUkPHLsHy5kzdjkt',
  meddelande:    'eEPSKJ1IAz8l2q7MU4mZ',
  forfragan:     'l2J9yizxV0XohmMwMSst'
};

/* ---- Små hjälpare ------------------------------------------------------ */

function forsta(namn) {
  for (var i = 0; i < namn.length; i++) {
    var v = process.env[namn[i]];
    if (v && String(v).trim()) return String(v).trim();
  }
  return '';
}

function text(v, maxLangd) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, maxLangd || 200);
}

function heltal(v, min, max) {
  var n = parseInt(v, 10);
  if (isNaN(n)) return null;
  return Math.min(Math.max(n, min), max);
}

function jaNej(v) { return v ? 'Ja' : 'Nej'; }

/** "070-123 45 67" -> "+46701234567". Lämnar okända format orörda. */
function telefonE164(rr) {
  var r = rr.replace(/[\s\-().]/g, '');
  if (/^\+46\d{7,13}$/.test(r)) return r;
  if (/^0046\d{7,13}$/.test(r)) return '+46' + r.slice(4);
  if (/^0\d{7,12}$/.test(r)) return '+46' + r.slice(1);
  return rr;
}

/* ---- Validering, samma regler som formuläret men på serversidan -------- */

/* Samma mönster som HTML5:s inbyggda e-postvalidering, och samma som
   används i app.js. Snällare regler släpper igenom adresser som
   GoHighLevel sedan nekar med 422 "email must be an email". */
var EPOST_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validera(k) {
  var fel = [];
  if (!k.fornamn) fel.push('fornamn');
  if (!k.efternamn) fel.push('efternamn');
  if (!EPOST_REGEX.test(k.epost)) fel.push('epost');
  if (k.telefon.replace(/\D/g, '').length < 8) fel.push('telefon');
  if (k.adress.length < 4) fel.push('adress');
  if (k.tjanst !== 'fonster' && k.tjanst !== 'kontor') fel.push('tjanst');
  if (!k.godkant) fel.push('godkannande');
  return fel;
}

/* ---- Funktionen -------------------------------------------------------- */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, fel: 'Endast POST.' });
  }

  var token = forsta(TOKEN_NAMN);
  var locationId = forsta(LOCATION_NAMN) || STANDARD_LOCATION;

  if (!token) {
    /* Namnen är inte hemliga; värdena lämnar aldrig funktionen. */
    console.error('Ingen GHL-token i miljön. Letade efter: ' + TOKEN_NAMN.join(', '));
    return res.status(500).json({
      ok: false,
      fel: 'Servern saknar konfiguration.',
      letadeEfter: TOKEN_NAMN
    });
  }

  var kropp = req.body;
  if (typeof kropp === 'string') {
    try { kropp = JSON.parse(kropp); } catch (e) { kropp = null; }
  }
  if (!kropp || typeof kropp !== 'object') {
    return res.status(400).json({ ok: false, fel: 'Felaktig begäran.' });
  }

  /* Honungsfälla: fältet är dolt för människor men fylls i av robotar.
     Svaret ser lyckat ut så att spammaren inte lär sig något. */
  if (text(kropp.foretag, 100)) {
    return res.status(200).json({ ok: true });
  }

  var k = {
    fornamn:   text(kropp.fornamn, 60),
    efternamn: text(kropp.efternamn, 60),
    epost:     text(kropp.epost, 120).toLowerCase(),
    telefon:   text(kropp.telefon, 30),
    /* Adressfältet innehåller både gata och ort sedan postorten togs bort
       ur formuläret. Ingen egen stad skickas därför till GHL. */
    adress:    text(kropp.adress, 160),
    meddelande: text(kropp.meddelande, 1000),
    tjanst:    text(kropp.tjanst, 10),
    godkant:   kropp.godkant === true
  };

  var fel = validera(k);
  if (fel.length) {
    return res.status(400).json({ ok: false, fel: 'Ofullständiga uppgifter.', falt: fel });
  }

  var antalFonster = heltal(kropp.antalFonster, 1, 200);
  var antalSprojs = heltal(kropp.antalSprojs, 0, 200);
  if (antalSprojs !== null && antalFonster !== null && antalSprojs > antalFonster) {
    antalSprojs = antalFonster;
  }

  /* Priset räknas fram i webbläsaren och följer med som uppskattning.
     Det klampas till ett rimligt spann så att ett manipulerat värde inte
     kan hamna i Linus mejl – han bekräftar ändå alltid priset själv. */
  var prisKund = heltal(kropp.prisKund, 0, 200000);
  var prisForeRut = heltal(kropp.prisForeRut, 0, 400000);

  var forfragan = 'LF-' + String(Math.floor(1000 + Math.random() * 9000));
  var tjanstNamn = k.tjanst === 'fonster' ? 'Fönsterputs' : 'Kontorsputs';

  var falt = [
    { id: FALT.tjanst, value: tjanstNamn },
    { id: FALT.forfragan, value: forfragan },
    { id: FALT.karmar, value: jaNej(kropp.karmar) },
    { id: FALT.bleck, value: jaNej(kropp.bleck) },
    { id: FALT.sprojstvatt, value: jaNej(kropp.sprojstvatt) },
    { id: FALT.balkong, value: jaNej(kropp.balkong) },
    { id: FALT.behandling, value: jaNej(kropp.behandling) },
    { id: FALT.arbetstid, value: text(kropp.arbetstid, 40) },
    { id: FALT.specifikation, value: text(kropp.specifikation, 2000) },
    { id: FALT.meddelande, value: k.meddelande }
  ];
  if (antalFonster !== null) falt.push({ id: FALT.antalFonster, value: antalFonster });
  if (antalSprojs !== null) falt.push({ id: FALT.antalSprojs, value: antalSprojs });
  if (prisKund !== null) falt.push({ id: FALT.prisKund, value: prisKund });
  if (prisForeRut !== null) falt.push({ id: FALT.prisForeRut, value: prisForeRut });

  var lokalyta = heltal(kropp.lokalyta, 1, 5000);
  if (k.tjanst === 'kontor') {
    if (lokalyta !== null) falt.push({ id: FALT.lokalyta, value: lokalyta });
    falt.push({ id: FALT.frekvens, value: text(kropp.frekvens, 40) });
  }

  var kontakt = {
    locationId: locationId,
    firstName: k.fornamn,
    lastName: k.efternamn,
    name: k.fornamn + ' ' + k.efternamn,
    email: k.epost,
    phone: telefonE164(k.telefon),
    address1: k.adress,
    country: 'SE',
    source: 'Webbplats – offertförfrågan',
    tags: ['offertforfragan', 'webbplats', tjanstNamn.toLowerCase()],
    customFields: falt
  };

  try {
    var svar = await fetch(GHL_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Version': GHL_VERSION,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(kontakt)
    });

    if (!svar.ok) {
      var detalj = await svar.text();
      console.error('GHL svarade ' + svar.status + ': ' + detalj.slice(0, 500));
      return res.status(502).json({ ok: false, fel: 'Förfrågan kunde inte tas emot just nu.' });
    }

    return res.status(200).json({ ok: true, forfragan: forfragan });
  } catch (e) {
    console.error('Anropet till GHL misslyckades: ' + (e && e.message));
    return res.status(502).json({ ok: false, fel: 'Förfrågan kunde inte tas emot just nu.' });
  }
};
