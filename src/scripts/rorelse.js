/* ==========================================================================
   LINUS FÖNSTERPUTS – rörelser
   Allt som rör sig vid scroll och inläsning, plus tjänstemenyn och
   toppbannerns kryss. Laddas på alla sidor (även tack-sidan, som saknar
   app.js). Tiderna är uppmätta på förlagan, se avsnitt 4 i
   _design-reference/movers-framer/DESIGN-PLAN.md.

   Med prefers-reduced-motion står allt still och syns direkt: inga
   uppdelade rubriker, ingen skrivmaskin, inga räknare. Ingen
   localStorage/sessionStorage används.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Guardad så att sidan fungerar även i miljöer som saknar matchMedia. */
  var mjuk = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var harIO = 'IntersectionObserver' in window;
  var rorelse = mjuk && harIO;

  /** Heltal med svenskt tusentalsavstånd: 1500 -> "1 500". Samma som tal() i
      app.js, med hårt mellanslag så att talet aldrig bryts mellan raderna. */
  function tal(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }


  /* ------------------------------------------------------------------------
     1. Rubriker tecken för tecken
        Varje tecken läggs i en egen span som tonas in och lyfts 10 px. Texten
        finns bara en gång i DOM:en – sökmotorer läser rubriken som förut –
        och rubriken får hela texten som aria-label, medan tecknen är dolda
        för skärmläsare. Annars läses den bokstav för bokstav. Orden hålls
        ihop (white-space:nowrap), så att raden aldrig bryts mitt i ett ord.
     ------------------------------------------------------------------------ */
  if (rorelse) {
    $$('.tecken').forEach(function (rubrik) {
      var text = rubrik.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;

      var synlig = document.createElement('span');
      synlig.setAttribute('aria-hidden', 'true');

      var nr = 0;
      text.split(' ').forEach(function (ord, i) {
        if (i > 0) synlig.appendChild(document.createTextNode(' '));
        var ordSpan = document.createElement('span');
        ordSpan.className = 'tecken-ord';
        Array.prototype.forEach.call(ord, function (t) {
          var s = document.createElement('span');
          s.className = 'tecken-t';
          s.style.setProperty('--i', nr++);
          s.textContent = t;
          ordSpan.appendChild(s);
        });
        synlig.appendChild(ordSpan);
      });

      rubrik.setAttribute('aria-label', text);
      rubrik.textContent = '';
      rubrik.appendChild(synlig);
    });
  }


  /* ------------------------------------------------------------------------
     2. Scroll-in
        .in glider upp när blocket rullas in i bild, .tecken tonar in sina
        tecken. Båda får .syns en gång och släpps sedan. Klassen .rorelse på
        <html> är det som döljer dem från början – utan den står allt
        synligt, så ingenting kan fastna osynligt om skriptet inte körs.
     ------------------------------------------------------------------------ */
  if (rorelse) {
    document.documentElement.classList.add('rorelse');
    var obs = new IntersectionObserver(function (poster) {
      poster.forEach(function (p) {
        if (p.isIntersecting) { p.target.classList.add('syns'); obs.unobserve(p.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.in, .tecken').forEach(function (el) { obs.observe(el); });
  } else {
    $$('.in, .tecken').forEach(function (el) { el.classList.add('syns'); });
  }


  /* ------------------------------------------------------------------------
     3. Skrivmaskinen i heron
        Sista ordet i rubriken suddas och skrivs om, ett ord i taget, i en
        loop. Takten är förlagans: drygt en tiondels sekund per tecken när
        ordet skrivs, snabbare när det suddas, och en sekunds paus både när
        ordet står färdigt och när raden är tom.

        Ordet som står i HTML ligger kvar som text, synligt bara för
        skärmläsare. Det skrivande ordet ritas av CSS ur data-text (se
        .skrivmaskin-ord i stil.css) och är alltså aldrig text i DOM:en – så
        rubriken som sökmotorer läser är alltid exakt densamma, oavsett när
        sidan renderas, och inget ord kommer med två gånger.
     ------------------------------------------------------------------------ */
  (function () {
    var falt = $('.skrivmaskin[data-ord]');
    if (!falt || !mjuk) return;

    var forsta = falt.textContent.trim();
    var ordlista = [forsta].concat(falt.getAttribute('data-ord').split('|'));

    var fast = document.createElement('span');
    fast.className = 'sr';
    fast.textContent = forsta;
    var synlig = document.createElement('span');
    synlig.className = 'skrivmaskin-ord';
    synlig.setAttribute('aria-hidden', 'true');
    synlig.setAttribute('data-text', forsta);
    falt.textContent = '';
    falt.appendChild(fast);
    falt.appendChild(synlig);

    function visa(text) { synlig.setAttribute('data-text', text); }

    var SKRIV = 108, SUDDA = 65, HALL = 1080, TOM = 1070;
    var ordNr = 0;

    /* Väntar medan fliken är dold, så att loopen inte rusar i bakgrunden. */
    function vanta(ms, sedan) {
      setTimeout(function () {
        if (document.hidden) { vanta(400, sedan); return; }
        sedan();
      }, ms);
    }

    function sudda() {
      falt.classList.add('skriver');
      var text = synlig.getAttribute('data-text');
      if (text.length) {
        visa(text.slice(0, -1));
        vanta(SUDDA, sudda);
      } else {
        falt.classList.remove('skriver');
        ordNr = (ordNr + 1) % ordlista.length;
        vanta(TOM, function () { skriv(0); });
      }
    }

    function skriv(n) {
      falt.classList.add('skriver');
      var ord = ordlista[ordNr];
      visa(ord.slice(0, n + 1));
      if (n + 1 < ord.length) { vanta(SKRIV, function () { skriv(n + 1); }); }
      else { falt.classList.remove('skriver'); vanta(HALL, sudda); }
    }

    vanta(HALL + 400, sudda);
  })();


  /* ------------------------------------------------------------------------
     4. Räknare
        Siffrorna i den avslutande CTA:n räknas upp från noll när de rullas
        in i bild, snabbt i början och långsamt mot slutet. I HTML står
        slutvärdet, och exakt den texten sätts tillbaka när räkningen är
        klar – så inget avrundningsfel kan bli kvar.
     ------------------------------------------------------------------------ */
  (function () {
    var siffror = $$('[data-raknare]');
    if (!siffror.length || !rorelse) return;

    var TID = 2600, FORDROJNING = 300;

    function rakna(el) {
      var mal = parseFloat(el.getAttribute('data-raknare'));
      var efter = el.getAttribute('data-efter') || '';
      var slut = el.getAttribute('data-slut');
      var start = null;
      function ruta(nu) {
        if (start === null) start = nu;
        var t = Math.min((nu - start) / TID, 1);
        var e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);   /* ease-out (expo) */
        el.textContent = tal(mal * e) + efter;
        if (t < 1) requestAnimationFrame(ruta);
        else el.textContent = slut;
      }
      setTimeout(function () { requestAnimationFrame(ruta); }, FORDROJNING);
    }

    var obsR = new IntersectionObserver(function (poster) {
      poster.forEach(function (p) {
        if (!p.isIntersecting) return;
        obsR.unobserve(p.target);
        rakna(p.target);
      });
    }, { threshold: 0.6 });

    siffror.forEach(function (el) {
      el.setAttribute('data-slut', el.textContent);
      el.textContent = '0' + (el.getAttribute('data-efter') || '');
      obsR.observe(el);
    });
  })();


  /* ------------------------------------------------------------------------
     5. Tjänstemenyn i sidhuvudet
        Öppnas av hover och fokus i CSS. Här läggs klicket till, för
        pekskärm och tangentbord, med aria-expanded, Escape och klick utanför.
     ------------------------------------------------------------------------ */
  (function () {
    var meny = $('#nav-meny');
    if (!meny) return;
    var knapp = $('.nav-knapp', meny);

    function satt(oppen) {
      meny.classList.toggle('oppen', oppen);
      knapp.setAttribute('aria-expanded', oppen ? 'true' : 'false');
    }
    knapp.addEventListener('click', function () { satt(!meny.classList.contains('oppen')); });
    meny.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && meny.classList.contains('oppen')) { satt(false); knapp.focus(); }
    });
    meny.addEventListener('focusout', function (e) {
      if (!meny.contains(e.relatedTarget)) satt(false);
    });
    document.addEventListener('click', function (e) {
      if (!meny.contains(e.target)) satt(false);
    });
  })();


  /* ------------------------------------------------------------------------
     6. Toppbannerns kryss
        Döljer bannern för resten av besöket på sidan. Inget sparas, så den
        visas igen på nästa sida – sajten använder ingen lagring i webbläsaren.
     ------------------------------------------------------------------------ */
  var bannerKryss = $('#toppbanner-stang');
  if (bannerKryss) {
    bannerKryss.addEventListener('click', function () { $('#toppbanner').hidden = true; });
  }

})();
