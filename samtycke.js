/* ==========================================================================
   SAMTYCKE FÖR KAKOR (cookiebot)

   Sajten sätter i dagsläget inga kakor och laddar inga spårningsskript.
   Den här filen ändrar inget av det förrän SPARNING nedan fylls i med ett
   riktigt ID - så länge båda fälten är tomma avbryts skriptet direkt på
   rad ~20, ingen banner visas och ingenting laddas. cookies.html och
   integritetspolicy.html stämmer fortfarande så länge SPARNING är tom.

   AKTIVERA STATISTIK/MARKNADSFÖRING:
     1. Skaffa ett GA4 Measurement-ID (G-XXXXXXXXXX) och/eller ett
        Meta Pixel-ID, och fyll i det i SPARNING nedan.
     2. Uppdatera cookies.html och integritetspolicy.html punkt 8 så att de
        namnger Google/Meta som mottagare och beskriver vilka kakor som sätts
        - exakt så som cookies.html redan idag lovar att det kommer gå till.
     3. Klart. Besökare möts av samtyckesrutan innan något laddas, valet
        sparas lokalt i webbläsaren (kräver inget samtycke i sig - det är
        själva samtyckesposten), och kan ändras när som helst via länken
        "Kakinställningar" som då dyker upp i sidfoten.

   Ingen förikryssad ruta någonstans - opt-in på riktigt, precis som GDPR-
   kryssrutan i bokningsformuläret.
   ========================================================================== */
(function () {
  'use strict';

  var SPARNING = {
    ga4: '',        /* t.ex. 'G-XXXXXXXXXX' */
    metaPixel: ''   /* t.ex. '1234567890123456' */
  };

  var aktiv = !!(SPARNING.ga4 || SPARNING.metaPixel);
  if (!aktiv) return;

  var NYCKEL = 'lf-samtycke';

  function las() {
    try { return JSON.parse(localStorage.getItem(NYCKEL)); } catch (e) { return null; }
  }
  function spara(val) {
    try {
      localStorage.setItem(NYCKEL, JSON.stringify({
        statistik: !!val.statistik,
        marknadsforing: !!val.marknadsforing,
        tidpunkt: new Date().toISOString()
      }));
    } catch (e) { /* Privat läge eller avstängd lagring - valet gäller bara den här sessionen. */ }
  }

  function laddaGA4() {
    if (!SPARNING.ga4 || window.gtag) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + SPARNING.ga4;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', SPARNING.ga4, { anonymize_ip: true });
  }

  function laddaMeta() {
    if (!SPARNING.metaPixel || window.fbq) return;
    (function (f, b, e, v) {
      var n, t, s;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', SPARNING.metaPixel);
    window.fbq('track', 'PageView');
  }

  function tillampa(val) {
    if (val.statistik) laddaGA4();
    if (val.marknadsforing) laddaMeta();
  }

  /* ---- Bannerns HTML. Ren statisk text, inga användarvärden. ------------ */

  var ruta = document.createElement('div');
  ruta.className = 'samtycke-ruta';
  ruta.setAttribute('role', 'dialog');
  ruta.setAttribute('aria-label', 'Inställningar för kakor');

  function ritaFraga() {
    ruta.innerHTML =
      '<div class="samtycke-inner">' +
        '<p class="samtycke-text">Vi vill använda kakor för besöksstatistik' +
          (SPARNING.metaPixel ? ' och marknadsföring' : '') +
          '. Du väljer själv - webbplatsen fungerar precis lika bra om du tackar nej. ' +
          'Läs mer i <a href="cookies.html">kakpolicyn</a>.</p>' +
        '<div class="samtycke-knappar">' +
          '<button type="button" class="knapp knapp-sekundar knapp-liten" id="samtycke-nodvandiga">Endast nödvändiga</button>' +
          '<button type="button" class="pris-lank" id="samtycke-anpassa">Anpassa</button>' +
          '<button type="button" class="knapp knapp-primar knapp-liten" id="samtycke-alla">Acceptera alla</button>' +
        '</div>' +
      '</div>';

    document.getElementById('samtycke-alla').addEventListener('click', function () {
      avsluta({ statistik: true, marknadsforing: true });
    });
    document.getElementById('samtycke-nodvandiga').addEventListener('click', function () {
      avsluta({ statistik: false, marknadsforing: false });
    });
    document.getElementById('samtycke-anpassa').addEventListener('click', function () { ritaAnpassa(false); });
  }

  function ritaAnpassa(laddaOmVidSpara) {
    var sparat = las() || { statistik: false, marknadsforing: false };
    ruta.innerHTML =
      '<div class="samtycke-inner">' +
        '<p class="samtycke-text">Välj vad du godkänner. Läs mer i <a href="cookies.html">kakpolicyn</a>.</p>' +
        '<label class="gdpr-kort samtycke-val">' +
          '<input type="checkbox" id="samtycke-statistik"' + (sparat.statistik ? ' checked' : '') + '>' +
          '<span class="check-ruta"><svg aria-hidden="true"><use href="#i-bock"/></svg></span>' +
          '<span><strong>Statistik.</strong> Anonymiserad besöksstatistik (Google Analytics) så att Linus ser vilka sidor som används.</span>' +
        '</label>' +
        (SPARNING.metaPixel ?
          '<label class="gdpr-kort samtycke-val">' +
            '<input type="checkbox" id="samtycke-marknadsforing"' + (sparat.marknadsforing ? ' checked' : '') + '>' +
            '<span class="check-ruta"><svg aria-hidden="true"><use href="#i-bock"/></svg></span>' +
            '<span><strong>Marknadsföring.</strong> Mäter resultatet av annonser (Meta) så att de kan riktas bättre.</span>' +
          '</label>'
        : '') +
        '<div class="samtycke-knappar">' +
          '<button type="button" class="knapp knapp-primar knapp-liten" id="samtycke-spara">Spara val</button>' +
        '</div>' +
      '</div>';

    document.getElementById('samtycke-spara').addEventListener('click', function () {
      avsluta({
        statistik: document.getElementById('samtycke-statistik').checked,
        marknadsforing: SPARNING.metaPixel ? document.getElementById('samtycke-marknadsforing').checked : false
      }, laddaOmVidSpara);
    });
  }

  /* laddaOm: sant när valet ändras i efterhand (via "Kakinställningar").
     Redan inladdade spårningsskript går inte att "ta bort" ur en pågående
     sida, så ett indraget samtycke kräver en omladdning för att faktiskt
     sluta gälla. Första gången (bannern) finns inget laddat ännu, så då
     behövs ingen omladdning. */
  function avsluta(val, laddaOm) {
    spara(val);
    tillampa(val);
    ruta.remove();
    if (laddaOm) window.location.reload();
  }

  /* ---- Länk i sidfoten för att ändra valet i efterhand ------------------ */

  function laggTillInstallningslank() {
    var juridikNav = document.querySelector('.footer-juridik');
    if (!juridikNav || document.getElementById('samtycke-installningar')) return;
    var lank = document.createElement('button');
    lank.type = 'button';
    lank.id = 'samtycke-installningar';
    lank.className = 'samtycke-fotlank';
    lank.textContent = 'Kakinställningar';
    lank.addEventListener('click', function () {
      document.body.appendChild(ruta);
      ritaAnpassa(true);
    });
    juridikNav.appendChild(lank);
  }

  var sparat = las();
  if (sparat) {
    tillampa(sparat);
  } else {
    document.body.appendChild(ruta);
    ritaFraga();
  }

  /* defer garanterar att DOM:en är klar när den här filen körs - inget
     behov av att vänta på DOMContentLoaded (som redan kan ha hunnit
     avfyras innan en lyssnare hinner registreras). */
  laggTillInstallningslank();
})();
