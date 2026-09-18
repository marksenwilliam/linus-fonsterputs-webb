/* ==========================================================================
   LINUS FÖNSTERPUTS – all JavaScript
   OBS: ingen localStorage/sessionStorage används. All state ligger i minnet.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. Små hjälpfunktioner
     ------------------------------------------------------------------------ */
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /** Arbetstiden visas avrundad till närmaste fem minuter – exakt nog för
      en uppskattning, utan att låtsas vara mer precis än den är. */
  function visadTid(min) { return tidText(Math.round(min / 5) * 5); }

  /** Formaterar ett heltal som "1 025 kr" med svenskt tusentalsavstånd. */
  function kr(n) { return tal(n) + ' kr'; }
  function tal(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /** "150" -> "2 h 30 min" */
  function tidText(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (h === 0) return m + ' min';
    if (m === 0) return h + ' h';
    return h + ' h ' + m + ' min';
  }
  /** Minuter från midnatt -> "09:00" */
  function klocka(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }

  /* Respekterar prefers-reduced-motion. Guardad så att sidan fungerar
     även i miljöer som saknar matchMedia. */
  var mjuk = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);


  /* ------------------------------------------------------------------------
     1. Sticky header – vit bakgrund vid scroll
     ------------------------------------------------------------------------ */
  var topp = $('#topp');
  function uppdateraTopp() {
    if (window.scrollY > 40) topp.classList.add('fast');
    else topp.classList.remove('fast');
  }
  window.addEventListener('scroll', uppdateraTopp, { passive: true });
  uppdateraTopp();


  /* ------------------------------------------------------------------------
     2. Mobilmeny
     ------------------------------------------------------------------------ */
  var burgare = $('#burgare');
  var mobmeny = $('#mobmeny');
  var menyBakgrund = [];

  function menyFokus() {
    return [burgare].concat($$('a[href], button:not([disabled])', mobmeny))
      .filter(function (el) { return el.getClientRects().length > 0; });
  }

  function stangMeny() {
    mobmeny.classList.remove('oppen');
    burgare.setAttribute('aria-expanded', 'false');
    burgare.setAttribute('aria-label', 'Öppna meny');
    topp.classList.remove('meny-oppen');
    document.body.classList.remove('laast');
    menyBakgrund.forEach(function (post) {
      if (!post.varInert) post.el.removeAttribute('inert');
    });
    menyBakgrund = [];
  }
  function vaxlaMeny() {
    if (mobmeny.classList.contains('oppen')) { stangMeny(); return; }
    mobmeny.classList.add('oppen');
    burgare.setAttribute('aria-expanded', 'true');
    burgare.setAttribute('aria-label', 'Stäng meny');
    topp.classList.add('meny-oppen');
    document.body.classList.add('laast');
    menyBakgrund = $$('main, .footer, .mob-cta').map(function (el) {
      var post = { el: el, varInert: el.hasAttribute('inert') };
      el.setAttribute('inert', '');
      return post;
    });
    var fokus = menyFokus();
    (fokus[1] || burgare).focus();
  }
  burgare.addEventListener('click', vaxlaMeny);

  /* Menyn stängs när man klickar på vilken länk som helst i den – inte bara
     navlänkarna, utan även genvägen till tjänsterna och telefonnumret. */
  $$('#mobmeny a').forEach(function (a) { a.addEventListener('click', stangMeny); });

  /* Håll fokus i den öppna menyn och återgå till menyknappen med Escape. */
  document.addEventListener('keydown', function (e) {
    if (!mobmeny.classList.contains('oppen')) return;
    if (e.key === 'Escape') { e.preventDefault(); stangMeny(); burgare.focus(); }
    if (e.key === 'Tab') {
      var fokus = menyFokus();
      var index = fokus.indexOf(document.activeElement);
      if (index === -1 || (e.shiftKey && index === 0) || (!e.shiftKey && index === fokus.length - 1)) {
        e.preventDefault();
        fokus[e.shiftKey ? fokus.length - 1 : 0].focus();
      }
    }
  });

  /* Desktop döljer mobilmenyn i CSS; ta även bort dess scroll- och fokuslås. */
  window.addEventListener('resize', function () {
    if (window.innerWidth < 1024 || !mobmeny.classList.contains('oppen')) return;
    var flyttaFokus = mobmeny.contains(document.activeElement) || document.activeElement === burgare;
    stangMeny();
    if (flyttaFokus) {
      var lank = $('.nav a', topp);
      if (lank) lank.focus();
    }
  });


  /* ------------------------------------------------------------------------
     3. Scroll-in-animationer (IntersectionObserver)
     ------------------------------------------------------------------------ */
  if ('IntersectionObserver' in window && mjuk) {
    document.documentElement.classList.add('rorelse');
    var obs = new IntersectionObserver(function (poster) {
      poster.forEach(function (p) {
        if (p.isIntersecting) { p.target.classList.add('syns'); obs.unobserve(p.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.in').forEach(function (el) { obs.observe(el); });
  } else {
    $$('.in').forEach(function (el) { el.classList.add('syns'); });
  }


  /* ------------------------------------------------------------------------
     4. Sticky mobil-CTA – visas efter heron, döljs i footern
     ------------------------------------------------------------------------ */
  var mobCta = $('#mob-cta');
  var hero = $('#hero');
  var footer = $('.footer');
  var forbiHero = false, iFooter = false;

  function uppdateraMobCta() {
    if (!mobCta) return;
    mobCta.classList.toggle('visa', forbiHero && !iFooter);
  }
  /* Sajten har flera sidtyper. Bloggens inlägg har t.ex. ingen #hero, så varje
     element kontrolleras innan det observeras – annars kastar observe(null). */
  if ('IntersectionObserver' in window && mobCta) {
    if (hero) {
      new IntersectionObserver(function (p) {
        forbiHero = !p[0].isIntersecting; uppdateraMobCta();
      }, { threshold: 0.15 }).observe(hero);
    } else {
      forbiHero = true;   /* ingen hero att passera – visa knappen direkt */
    }

    if (footer) {
      new IntersectionObserver(function (p) {
        iFooter = p[0].isIntersecting; uppdateraMobCta();
      }, { threshold: 0.02 }).observe(footer);
    }
    uppdateraMobCta();
  }


  /* ------------------------------------------------------------------------
     5. FAQ – accordion (en öppen åt gången)
     ------------------------------------------------------------------------ */
  var faqKnappar = $$('.faq-fraga');
  faqKnappar.forEach(function (knapp) {
    document.getElementById(knapp.getAttribute('aria-controls')).hidden = true;
    knapp.addEventListener('click', function () {
      var post = knapp.closest('.faq-post');
      var svar = document.getElementById(knapp.getAttribute('aria-controls'));
      var oppen = knapp.getAttribute('aria-expanded') === 'true';

      /* Stäng alla först */
      faqKnappar.forEach(function (k) {
        k.setAttribute('aria-expanded', 'false');
        k.closest('.faq-post').classList.remove('oppen');
        document.getElementById(k.getAttribute('aria-controls')).hidden = true;
      });

      /* Öppna den klickade om den var stängd */
      if (!oppen) {
        knapp.setAttribute('aria-expanded', 'true');
        post.classList.add('oppen');
        svar.hidden = false;
      }
    });
  });


  /* ------------------------------------------------------------------------
     6. Före/efter-slider (fungerar med mus, touch och tangentbord)
        Ett osynligt range-fält täcker hela ytan, vilket ger drag-stöd gratis.
     ------------------------------------------------------------------------ */
  /* Varje jämförelse i slideshowen kopplas upp för sig */
  $$('[data-fe]').forEach(function (fe) {
    var reglage = fe.querySelector('.fe-slider');
    var efter = fe.querySelector('[data-efter]');
    var handtag = fe.querySelector('[data-handtag]');
    function uppdatera() {
      var p = parseFloat(reglage.value);
      /* Vänster halva visar FÖRE (baslagret), höger halva EFTER.
         Efter-lagret beskärs därför från vänster. */
      efter.style.clipPath = 'inset(0 0 0 ' + p + '%)';
      efter.style.webkitClipPath = 'inset(0 0 0 ' + p + '%)';
      handtag.style.left = p + '%';
    }
    reglage.addEventListener('input', function () { fe.classList.add('rord'); uppdatera(); });
    uppdatera();
  });

  /* Slideshow: bläddra mellan flera före/efter-jämförelser */
  (function () {
    var show = $('#fe-show');
    if (!show) return;
    var slides = $$('.fe-slide', show);
    var punkter = $('#fe-punkter');
    var scen = $('#fe-scen');
    var i = 0;

    slides.forEach(function (s, k) {
      var p = document.createElement('button');
      p.type = 'button';
      p.className = 'fe-punkt';
      p.setAttribute('aria-label', 'Bild ' + (k + 1) + ': ' + s.getAttribute('data-scen'));
      p.addEventListener('click', function () { visa(k); });
      punkter.appendChild(p);
    });

    function visa(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, m) { s.classList.toggle('aktiv', m === i); });
      $$('.fe-punkt', punkter).forEach(function (p, m) {
        p.setAttribute('aria-pressed', m === i ? 'true' : 'false');
      });
      scen.textContent = slides[i].getAttribute('data-scen');
    }

    $('.fe-pil.bak', show).addEventListener('click', function () { visa(i - 1); });
    $('.fe-pil.fram', show).addEventListener('click', function () { visa(i + 1); });

    /* Piltangenter när fokus ligger i slideshowen */
    show.addEventListener('keydown', function (e) {
      if (e.target.classList.contains('fe-slider')) return; /* reglaget äger vänster/höger */
      if (e.key === 'ArrowLeft') { visa(i - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { visa(i + 1); e.preventDefault(); }
    });

    visa(0);
  })();


  /* ------------------------------------------------------------------------
     7. Omdömen – Google-recensioner
        Listan OMDOMEN nedan är sidans enda källa. Är den tom göms hela
        sektionen, så sidan kan gå live utan tomma kort. Samma kort byggs
        till karusellen (desktop) och till stapeln (mobil).

        VIKTIGT: varje omdöme måste komma från en riktig kund som lämnat det
        på Google, och texten ska stå ordagrant. Skriv inte om, korta inte och
        slå inte ihop flera omdömen. Plocka heller inte bort omdömen för att
        snygga till urvalet – det är i sig vilseledande. Påhittade omdömen är
        förbjudna enligt punkt 23 b i svarta listan (bilaga I till direktiv
        2005/29/EG, som gäller som svensk lag via marknadsföringslagen) och
        Konsumentverket kan ingripa med förbud och sanktionsavgift.

        Lägger du in ett exempel under tiden: sätt platshallare:true på det, så
        varnar sidan synligt att omdömet inte är riktigt.
     ------------------------------------------------------------------------ */

  /* Sammanfattningen överst. Siffrorna måste stämma med Google-profilen den
     dag sidan publiceras, och ses över när nya omdömen kommer in. */
  var BETYG = {
    snitt: 5,            /* Snittbetyg på Google, samma siffra som profilen visar */
    antal: 30,           /* Antal omdömen. 0 döljer hela brickan */
    profil: 'https://share.google/U0JNifvViv9w0H4gy'
  };

  /* Omdömena i den ordning de ligger på Google-profilen. Texterna är avskrivna
     ordagrant, inklusive emojier och egna signaturer. Åtta kunder satte bara
     betyg utan att skriva något – de har text: '' och räknas ändå in i
     antalet ovan. Fältet roll är avsiktligt tomt: vilken tjänst varje omdöme
     gällde framgår inte av profilen, och det ska inte gissas. */
  var OMDOMEN = [
    { namn: 'Joakim Wiberg', roll: '', betyg: 5, text: '' },
    { namn: 'Emelie Kellnberger', roll: '', betyg: 5, text: 'Nöjda varje gång! Enkelt att boka och Linus tar alltid våra fönster som man måste stå på stege för att nå 🤩' },
    { namn: 'elin Johansson', roll: '', betyg: 5, text: '' },
    { namn: 'Marianne Olsson', roll: '', betyg: 5, text: 'Rekommenderar Linus varmt, han gör ett fantastiskt jobb med skinande resultat! /Marianne' },
    { namn: 'Therese Skogh', roll: '', betyg: 5, text: 'Proffsigt utfört arbete och trevlig kommunikation. Vi kommer absolut att anlita Linus igen.' },
    { namn: 'Linnéa Eriksson', roll: '', betyg: 5, text: '' },
    { namn: 'Torsten Sandberg', roll: '', betyg: 5, text: 'Glasklart bra. Smidigt och bra. Mycket nöjda. //Torsten o Inger S' },
    { namn: 'Julia Lyckberg', roll: '', betyg: 5, text: '' },
    { namn: 'Cecilia Schmidt-Karlsson', roll: '', betyg: 5, text: 'Trevlig och noggrann! Rekommenderas!' },
    { namn: 'Anna Larsson', roll: '', betyg: 5, text: 'Trevlig och duktig 🤗' },
    { namn: 'Jörgen Anderson', roll: '', betyg: 5, text: '' },
    { namn: 'Maria Lejskog', roll: '', betyg: 5, text: 'Mycket trevlig och pålitlig men framförallt noggrann och gör ett oerhört bra jobb. Kan varmt rekommendera Linus' },
    { namn: 'Arne Pettersson', roll: '', betyg: 5, text: 'Över förväntan, även om jag hade höga förväntningar' },
    { namn: 'Alexander Forslund', roll: '', betyg: 5, text: 'Toppen service, bemötande och slutresultat. Kan starkt rekommendera Linus!' },
    { namn: 'Sophie Schelin', roll: '', betyg: 5, text: 'Superduktig! Fint resultat och trevligt bemötande!' },
    { namn: 'Jenny Nilsson', roll: '', betyg: 5, text: '' },
    { namn: 'Hildegun Weissenberg', roll: '', betyg: 5, text: '' },
    { namn: 'Monica Magnusson', roll: '', betyg: 5, text: 'Så nöjda med Linus fönsterputs. Vårt uterum fick skinande glasväggar. Vi kommer kontakta Linus när det blir dax för fönsterputs igen.' },
    { namn: 'Linda Göting', roll: '', betyg: 5, text: 'Så nöjd!' },
    { namn: 'Kajsa Fagerström', roll: '', betyg: 5, text: 'Vi är jättenöjda med Linus som gjorde ett toppenbra jobb med våra fönster. Snabbt, rent, trevlig och bra pris! Vi kommer anlita honom igen!' },
    { namn: 'Britta Gesar', roll: '', betyg: 5, text: 'Mycket trygg, trevlig och duktig på sitt jobb. Rekommenderar honom' },
    { namn: 'Helene Hansen', roll: '', betyg: 5, text: 'Toppen fint resultat. Pålitlig och punktlig. Kan verkligen rekommendera denna firma.' },
    { namn: 'ylva björkegren', roll: '', betyg: 5, text: 'Smidig kommunikation och väl utfört arbete till ett bra pris!' },
    { namn: 'Daniel Thollin Hall', roll: '', betyg: 5, text: 'Duktig, snabb och smidig.' },
    { namn: 'jonas malm', roll: '', betyg: 5, text: 'Linus var väldigt trevlig och gjorde ett fantastiskt bra jobb.' },
    { namn: 'Annica Gadle', roll: '', betyg: 5, text: 'Jättenöjd med putsningen, snabbt och professionellt utfört. Har redan bokat ny tid.' },
    { namn: 'Maritza Thulin', roll: '', betyg: 5, text: '' },
    { namn: 'Kennel Krafts', roll: '', betyg: 5, text: 'Helt underbart att få fönstren putsade' },
    { namn: 'Martin Kenving', roll: '', betyg: 5, text: 'Kanon! Riktigt bra service o resultat!' },
    { namn: 'Joakim Eriksson', roll: '', betyg: 5, text: 'Rekommenderas! Linus är duktig och snabb!' }
  ];

  (function () {
    var sektion = $('#omdomen');
    if (!sektion || !OMDOMEN.length) return;   /* inga omdömen – sektionen förblir dold */

    sektion.hidden = false;

    /* --- Byggstenar ------------------------------------------------------ */

    /** Fem stjärnor där de som ligger över betyget ritas tonade. */
    function stjarnor(betyg) {
      var ut = '';
      for (var i = 1; i <= 5; i++) {
        ut += '<svg viewBox="0 0 24 24" aria-hidden="true"' + (i > betyg ? ' class="tom"' : '') +
              '><use href="#i-stjarna"/></svg>';
      }
      return ut;
    }

    /** Ett omdömeskort. `klippt` klipper texten till fyra rader (mobil). */
    function byggKort(omd, klippt) {
      var kort = document.createElement('article');
      kort.className = 'omd-kort';

      /* Kunder som bara satte betyg får en kort rad i stället för citat, så
         att kortet inte blir en tom ruta. */
      var text = document.createElement('p');
      if (omd.text) {
        text.className = 'omd-text' + (klippt ? ' klippt' : '') + (omd.platshallare ? ' utkast' : '');
        text.textContent = omd.text;
      } else {
        text.className = 'omd-text omd-utan-text';
        text.textContent = 'Lämnade betyg utan skriven text.';
      }

      var huvud = document.createElement('div');
      huvud.className = 'omd-huvud';
      huvud.innerHTML =
        '<div class="omd-person">' +
          '<span class="avatar" aria-hidden="true">' + omd.namn.charAt(0) + '</span>' +
          '<span class="omd-person-text">' +
            '<cite class="omd-namn"></cite>' +
            (omd.roll ? '<span class="omd-meta"></span>' : '') +
          '</span>' +
        '</div>' +
        '<span class="stjarnor omd-betyg" role="img" aria-label="' + omd.betyg + ' av 5 stjärnor">' + stjarnor(omd.betyg) + '</span>';
      /* Namn och roll sätts som text, inte som HTML: de kommer från Google och
         ska aldrig kunna bära med sig uppmärkning in på sidan. */
      huvud.querySelector('.omd-namn').textContent = omd.namn;
      if (omd.roll) huvud.querySelector('.omd-meta').textContent = omd.roll;

      kort.appendChild(huvud);
      kort.appendChild(text);

      /* Citattecknet hör till ett citat. Kort som bara bär ett betyg får inget. */
      if (omd.text) {
        var citat = document.createElement('span');
        citat.className = 'omd-citat';
        citat.setAttribute('aria-hidden', 'true');
        citat.innerHTML = '<svg viewBox="0 0 24 24"><use href="#i-citat"/></svg>';
        kort.appendChild(citat);
      }
      return kort;
    }

    /* --- Varningen när omdömena är platshållare -------------------------- */
    var notis = $('#omd-notis');
    var harPlatshallare = OMDOMEN.some(function (o) { return o.platshallare; }) || BETYG.platshallare;
    if (notis && harPlatshallare) notis.hidden = false;

    /* --- Betygsbrickan --------------------------------------------------- */
    var brickrad = $('#omd-brickrad');
    if (brickrad && BETYG.antal > 0) {
      var snitt = BETYG.snitt.toFixed(1).replace('.', ',');
      var etikett = 'Betyg ' + snitt + ' av 5 på Google, baserat på ' + BETYG.antal + ' omdömen';
      var bricka = document.createElement(BETYG.profil ? 'a' : 'div');
      bricka.className = 'omd-bricka';
      if (BETYG.profil) {
        bricka.href = BETYG.profil;
        bricka.target = '_blank';
        bricka.rel = 'noopener';
        bricka.setAttribute('aria-label', etikett + ' – öppnar Google i ny flik');
      }
      bricka.innerHTML =
        '<svg class="g-logga" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-google"/></svg>' +
        '<span class="omd-snitt">' + snitt + '</span>' +
        '<span class="stjarnor stor" role="img" aria-label="' + etikett + '">' + stjarnor(Math.round(BETYG.snitt)) + '</span>' +
        '<span class="omd-antal">' + BETYG.antal + ' omdömen på Google</span>';
      brickrad.appendChild(bricka);
      brickrad.hidden = false;
    }

    /* --- Karusellen (desktop) -------------------------------------------- */
    /* Kortuppsättningen läggs två gånger i spåret. När spåret rullat en hel
       uppsättning nollställs positionen, och eftersom nästa uppsättning ser
       likadan ut syns aldrig något hopp. Kopian döljs för skärmläsare.

       Bara omdömen med text hamnar i karusellen: ett kort som bara säger
       "betyg utan text" ger inget i ett flöde som rullar förbi. De syns i
       stapeln på mobilen i stället, och räknas med i siffran på brickan. */
    (function () {
      var fonster = $('#omd-fonster');
      var spar = $('#omd-spar');
      if (!fonster || !spar) return;

      var medText = OMDOMEN.filter(function (o) { return o.text; });
      if (!medText.length) return;

      /* Korten är olika breda efter hur lång texten är. Med samma bredd åt
         alla skulle "Så nöjd!" få lika hög ruta som ett stycke på fyra rader,
         eftersom raden av kort sträcks till den högsta. */
      function bredd(text) {
        return Math.round(275 + Math.min(text.length * 1.25, 205)) + 'px';
      }

      function laggTill(omd, kopia) {
        var kort = byggKort(omd, false);
        kort.style.flex = '0 0 ' + bredd(omd.text);
        if (kopia) kort.setAttribute('aria-hidden', 'true');
        spar.appendChild(kort);
      }
      medText.forEach(function (o) { laggTill(o, false); });
      medText.forEach(function (o) { laggTill(o, true); });

      var laege = 0;          /* aktuell förskjutning i px, alltid <= 0 */
      var fart = 0.35;        /* px per bildruta – lugn, läsbar hastighet */
      var pekas = false;      /* muspekaren eller fokus ligger i karusellen */
      var dras = false;
      var syns = false;
      var korare = null;

      function halva() { return spar.scrollWidth / 2; }

      function flytta() {
        var h = halva();
        if (h > 0) {
          /* Håll läget inom en uppsättning, åt båda hållen. */
          while (laege <= -h) laege += h;
          while (laege > 0) laege -= h;
        }
        spar.style.transform = 'translateX(' + laege + 'px)';
      }

      function ruta() {
        if (!pekas && !dras) { laege -= fart; flytta(); }
        korare = requestAnimationFrame(ruta);
      }

      function start() {
        if (korare === null && mjuk) korare = requestAnimationFrame(ruta);
      }
      function stopp() {
        if (korare !== null) { cancelAnimationFrame(korare); korare = null; }
      }

      /* Rullar bara medan sektionen är i bild – ingen animation i bakgrunden. */
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (poster) {
          syns = poster[0].isIntersecting;
          if (syns) start(); else stopp();
        }, { threshold: 0 }).observe(fonster);
      } else {
        start();
      }

      /* Paus när besökaren läser: hover, fokus i karusellen eller dold flik. */
      fonster.addEventListener('mouseenter', function () { pekas = true; });
      fonster.addEventListener('mouseleave', function () { pekas = false; });
      fonster.addEventListener('focusin', function () { pekas = true; });
      fonster.addEventListener('focusout', function () { pekas = false; });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopp(); else if (syns) start();
      });

      /* Dra med mus eller penna. Touch hanteras inte här: under 768px visas
         stapeln i stället, och där ska sidan kunna scrollas som vanligt. */
      var dragStart = 0, laegeStart = 0;
      fonster.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        dras = true;
        dragStart = e.clientX;
        laegeStart = laege;
        fonster.classList.add('dras');
        fonster.setPointerCapture(e.pointerId);
      });
      fonster.addEventListener('pointermove', function (e) {
        if (!dras) return;
        e.preventDefault();
        laege = laegeStart + (e.clientX - dragStart);
        flytta();
      });
      function slappTag(e) {
        if (!dras) return;
        dras = false;
        fonster.classList.remove('dras');
        if (e.pointerId !== undefined && fonster.hasPointerCapture(e.pointerId)) {
          fonster.releasePointerCapture(e.pointerId);
        }
      }
      fonster.addEventListener('pointerup', slappTag);
      fonster.addEventListener('pointercancel', slappTag);

      /* Pilarna: ett kort i taget, så karusellen går att använda utan mus. */
      function steg() {
        var kort = spar.firstElementChild;
        return kort ? kort.offsetWidth + 20 : 300;
      }
      var bak = $('#omd-bak'), fram = $('#omd-fram');
      if (bak) bak.addEventListener('click', function () { laege += steg(); flytta(); });
      if (fram) fram.addEventListener('click', function () { laege -= steg(); flytta(); });

      flytta();
    })();

    /* --- Stapeln (mobil) -------------------------------------------------- */
    /* Fyra omdömen visas direkt, resten hämtas i omgångar. Varje kort klipps
       till fyra rader och fälls ut med en egen knapp – men bara om texten
       faktiskt är längre än så, vilket mäts efter att kortet ritats. */
    (function () {
      var stapel = $('#omd-stapel');
      var merRuta = $('#omd-mer');
      var merKnapp = $('#omd-mer-knapp');
      if (!stapel) return;

      var visade = 0;
      var FORSTA = 4, FLER = 8;

      function ritaKort(omd) {
        var kort = byggKort(omd, true);
        var text = kort.querySelector('.omd-text');

        var las = document.createElement('button');
        las.type = 'button';
        las.className = 'omd-las';
        las.textContent = 'Läs mer';
        las.hidden = true;
        kort.insertBefore(las, kort.querySelector('.omd-citat'));

        stapel.appendChild(kort);

        /* Knappen ska bara finnas när något faktiskt är dolt. Mätningen görs
           efter att layouten räknats om, annars är höjderna ännu 0. */
        requestAnimationFrame(function () {
          if (text.scrollHeight > text.clientHeight + 2) las.hidden = false;
        });

        las.addEventListener('click', function () {
          var utfalld = !text.classList.contains('klippt');
          /* Bara ett kort i taget är utfällt, som FAQ:n på samma sida. */
          $$('.omd-kort', stapel).forEach(function (annat) {
            var annanText = annat.querySelector('.omd-text');
            var annanKnapp = annat.querySelector('.omd-las');
            if (annat !== kort && annanText && !annanText.classList.contains('klippt')) {
              annanText.classList.add('klippt');
              if (annanKnapp) annanKnapp.textContent = 'Läs mer';
            }
          });
          text.classList.toggle('klippt', utfalld);
          las.textContent = utfalld ? 'Läs mer' : 'Visa mindre';
        });
      }

      function visaFler() {
        var omgang = visade === 0 ? FORSTA : FLER;
        OMDOMEN.slice(visade, visade + omgang).forEach(ritaKort);
        visade = Math.min(visade + omgang, OMDOMEN.length);
        if (merRuta) merRuta.hidden = visade >= OMDOMEN.length;
      }

      visaFler();
      if (merKnapp) merKnapp.addEventListener('click', visaFler);
    })();
  })();


  /* ==========================================================================
     8. OFFERTFÖRFRÅGAN
     ========================================================================== */

  /* --- 8.1 State (endast i minnet) ------------------------------------- */
  var STANDARD = {
    fonster: { antal: 15, sprojsAntal: 0, sprojstvatt: false,
               balkong: false, karmar: false, bleck: false, behandling: false },
    kontor:  { yta: 120, frekvens: 'engang' }
  };

  var S = {
    steg: 1,
    tjanst: null,
    fonster: Object.assign({}, STANDARD.fonster),
    kontor:  Object.assign({}, STANDARD.kontor)
  };

  var TJANSTNAMN = { fonster: 'Fönsterputs', kontor: 'Kontorsputs' };

  var FREKVENSTEXT = {
    kontor: { engang: 'Engångsputs', manad: 'Varje månad', kvartal: 'Varje kvartal', halvar: 'Två gånger per år' }
  };
  var RABATT = {
    kontor: { engang: 0, manad: 0.15, kvartal: 0.10, halvar: 0.05 }
  };
  /* Antal tillfällen per år – används för årskostnaden vid avtal */
  var PER_AR = {
    kontor: { engang: 0, manad: 12, kvartal: 4, halvar: 2 }
  };


  /* --- 8.2 Prisberäkning ------------------------------------------------ */

  /** Avrundar arbetstiden uppåt till närmaste halvtimme. */
  /* Math.round först: yta × 1,1 kan ge t.ex. 440.00000000000006 i flyttal,
     vilket annars tippar avrundningen uppåt en hel halvtimme. */
  function halvtimme(min) { return Math.ceil(Math.round(min) / 30) * 30; }

  /* Spröjstvätt är en egen tjänst med fast pris: 300 kr inkl. RUT för att
     tvätta varje spröjs på husets samtliga spröjsfönster. Jämnt belopp
     ex. RUT så att halveringen alltid går jämnt ut. */
  var SPROJSTVATT = 600;

  /**
   * FÖNSTERPUTS – alltid fast pris 950 kr inkl. RUT (1 900 kr ex. RUT).
   * Formulärets fält påverkar ENDAST den beräknade arbetstiden.
   */
  function beraknaFonster() {
    var f = S.fonster;

    /* ARBETSTIDER, enligt Linus egna mätningar. Alla uttryckta som antal per
       timme och räknade om till minuter per enhet, så att en ändrad takt bara
       behöver skrivas in på ett ställe.

         Fönsterputs   10 fönster på 1 h 40 min  ->  10 min per fönster
         Spröjsfönster  6 per timme              ->  10 min per fönster
         Spröjstvätt   15 per timme             ->   4 min per spröjsfönster
         Fönsterkarmar 15 per timme             ->   4 min per fönster
         Fönsterbleck  22 per timme             ->  ca 2,7 min per fönster
         Balkong       1 per timme              ->  60 min

       Spröjsfönster tar samma tid som vanliga fönster och räknas redan in i
       antalet, därför ligger inget eget tidspåslag på dem. Priset skiljer
       sig ändå, eftersom arbetet kräver mer noggrannhet.

       Vattenavvisande behandling saknar mätning än och ligger kvar på 25 min. */
    var PER_FONSTER   = 10;
    var PER_SPROJSTV  = 60 / 15;
    var PER_KARM      = 60 / 15;
    var PER_BLECK     = 60 / 22;
    var BALKONG_MIN   = 60;
    var BEHANDLING_MIN = 25;

    var min = f.antal * PER_FONSTER;
    if (f.sprojstvatt) min += f.sprojsAntal * PER_SPROJSTV;
    if (f.karmar) min += f.antal * PER_KARM;
    if (f.bleck) min += f.antal * PER_BLECK;
    if (f.balkong) min += BALKONG_MIN;
    if (f.behandling) min += BEHANDLING_MIN;

    /* Fast pris för själva huset, in- och utvändigt. Inglasad balkong och
       uterum ingår INTE utan läggs på som tillägg. */
    var GRUND = 1900;
    /* Alla belopp är ex. RUT och hålls JÄMNA – då blir halva summan exakt och
       radernas inkl-RUT-priser stämmer alltid mot totalen. */
    var BALKONG = 400, PER_SPROJS = 140, KARMAR = 600, BLECK = 400,
        BEHANDLING = 750;

    var rader = [{ namn: 'Fönsterputs, standardhus', varde: kr(GRUND), belopp: GRUND }];
    var total = GRUND;

    if (f.sprojsAntal > 0) {
      var spr = f.sprojsAntal * PER_SPROJS;
      total += spr;
      rader.push({ namn: 'Spröjs (' + f.sprojsAntal + ' st × ' + (PER_SPROJS / 2) + ' kr)', varde: kr(spr), belopp: spr });
    }
    /* Utan spröjsfönster finns inget att tvätta – tillägget kan inte köpas. */
    if (f.sprojstvatt && f.sprojsAntal > 0) {
      total += SPROJSTVATT;
      rader.push({ namn: 'Spröjstvätt', varde: kr(SPROJSTVATT), belopp: SPROJSTVATT });
    }
    if (f.karmar) { total += KARMAR; rader.push({ namn: 'Fönsterkarmar', varde: kr(KARMAR), belopp: KARMAR }); }
    if (f.bleck)  { total += BLECK;  rader.push({ namn: 'Fönsterbleck',  varde: kr(BLECK),  belopp: BLECK }); }
    if (f.balkong) { total += BALKONG; rader.push({ namn: 'Inglasad balkong eller uterum', varde: kr(BALKONG), belopp: BALKONG }); }
    if (f.behandling) { total += BEHANDLING; rader.push({ namn: 'Vattenavvisande behandling', varde: kr(BEHANDLING), belopp: BEHANDLING }); }
    var attBetala = Math.ceil(total / 2);

    return {
      tjanst: 'fonster',
      rader: rader,
      visaOrdinarie: false,
      total: total,
      rutBelopp: total - attBetala,
      attBetala: attBetala,
      harRut: true, exMoms: false,
      minuter: min, bokadMin: halvtimme(min),
      frekvens: 'engang', manad: null
    };
  }

  /** KONTORSPUTS – all glasyta på kontoret. Priset följer lokalens storlek:
      grundavgift 395 kr + 6 kr/m², exklusive moms. Företagstjänst, ingen RUT.
      Ger 335–380 kr/tim, alltså under marknadens lägsta nivå (400–550 kr/tim). */
  function beraknaKontor() {
    var k = S.kontor, rader = [], GRUND = 395, PER_KVM = 6;
    rader.push({ namn: 'Grundavgift kontorsputs', varde: kr(GRUND) });
    var ytPris = k.yta * PER_KVM;
    rader.push({ namn: 'Lokalyta ' + tal(k.yta) + ' m² × ' + PER_KVM + ' kr', varde: kr(ytPris) });
    var sum = GRUND + ytPris;

    var rab = RABATT.kontor[k.frekvens];
    var total = sum;
    if (rab > 0) {
      total = Math.round(sum * (1 - rab));
      rader.push({
        namn: 'Avtalsrabatt, ' + FREKVENSTEXT.kontor[k.frekvens].toLowerCase() + ' (−' + Math.round(rab * 100) + ' %)',
        varde: '−' + kr(sum - total), klass: 'rabatt'
      });
    }

    var min = 40 + k.yta * 1.1;
    var ggr = PER_AR.kontor[k.frekvens];
    var arskostnad = ggr ? Math.round(total * ggr / 10) * 10 : null;

    return {
      tjanst: 'kontor', rader: rader, visaOrdinarie: false,
      total: total, rutBelopp: 0, attBetala: total,
      harRut: false, exMoms: true,
      minuter: min, bokadMin: halvtimme(min),
      frekvens: k.frekvens, manad: null, arskostnad: arskostnad
    };
  }

  function berakna() {
    if (S.tjanst === 'fonster') return beraknaFonster();
    if (S.tjanst === 'kontor') return beraknaKontor();
    return null;
  }


  /* --- 8.3 Prisrutan ---------------------------------------------------- */

  /* Priset visas bara i sista steget. Under vägen dit ligger fokus på en
     fråga i taget, så ingen summeringspanel konkurrerar om utrymmet. */
  function ritaPris() {
    var b = berakna();
    var stor = $('#pris-stor'), under = $('#pris-under'), rader = $('#pris-rader');
    if (!stor || !b) return;

    stor.textContent = kr(b.attBetala);
    under.textContent = b.harRut
      ? 'Efter RUT-avdrag · ' + kr(b.total) + ' före avdrag'
      : 'Per tillfälle, exklusive moms';

    var h = '';
    b.rader.forEach(function (r) {
      h += '<div class="pris-rad"><span>' + r.namn + '</span><span>' + r.varde + '</span></div>';
    });
    if (b.harRut) {
      h += '<div class="pris-rad summa"><span>Summa före RUT</span><span>' + kr(b.total) + '</span></div>';
      h += '<div class="pris-rad gron"><span>RUT-avdrag</span><span>−' + kr(b.rutBelopp) + '</span></div>';
    }
    h += '<div class="pris-rad summa"><span>Att betala</span><span>' + kr(b.attBetala) + '</span></div>';
    if (b.arskostnad) {
      h += '<div class="pris-rad"><span>Beräknad årskostnad</span><span>ca ' + kr(b.arskostnad) + '/år</span></div>';
    }
    h += '<div class="pris-rad"><span>Beräknad arbetstid</span><span>ca ' + visadTid(b.minuter) + '</span></div>';
    rader.innerHTML = h;
  }

  var prisToggle = $('#pris-toggle');
  if (prisToggle) {
    prisToggle.addEventListener('click', function () {
      var rader = $('#pris-rader');
      var oppen = !rader.hidden;
      rader.hidden = oppen;
      prisToggle.setAttribute('aria-expanded', String(!oppen));
      prisToggle.textContent = oppen ? 'Visa specifikation' : 'Dölj specifikation';
    });
  }


  /* --- 8.4 Formulärkontroller ------------------------------------------ */

  /** Markerar valda kort så att CSS kan visa bocken. */
  function synkaVald() {
    $$('.val-kort').forEach(function (kort) {
      var ruta = kort.querySelector('input');
      if (ruta) kort.classList.toggle('vald', ruta.checked);
    });
    $$('.val-kort[data-valj]').forEach(function (kort) {
      kort.classList.toggle('vald', kort.getAttribute('data-valj') === S.tjanst);
      kort.setAttribute('aria-pressed', kort.getAttribute('data-valj') === S.tjanst ? 'true' : 'false');
    });
  }

  var STEPPER = {
    'f-antal':  { min: 1, max: 60 },
    'f-sprojs': { min: 0, max: function () { return S.fonster.antal; } }
  };

  function stepperVarde(namn) {
    return namn === 'f-antal' ? S.fonster.antal : S.fonster.sprojsAntal;
  }

  function sattStepper(namn, v) {
    var g = STEPPER[namn];
    var max = typeof g.max === 'function' ? g.max() : g.max;
    v = Math.min(Math.max(v, g.min), max);
    if (namn === 'f-antal') {
      S.fonster.antal = v;
      /* Spröjsfönster kan aldrig bli fler än det totala antalet */
      if (S.fonster.sprojsAntal > v) S.fonster.sprojsAntal = v;
    } else {
      S.fonster.sprojsAntal = v;
    }
    ritaFormular();
  }

  function ritaFormular() {
    $('#f-antal-varde').textContent = S.fonster.antal;
    $('#f-antal-slider').value = S.fonster.antal;
    $('#f-sprojs-varde').textContent = S.fonster.sprojsAntal;
    $('#f-sprojs-slider').value = S.fonster.sprojsAntal;
    $('#f-sprojs-slider').max = S.fonster.antal;
    $('#k-yta-varde').textContent = tal(S.kontor.yta) + ' m²';
    $('#k-yta').value = S.kontor.yta;

    $$('[data-stepper]').forEach(function (b) {
      var namn = b.getAttribute('data-stepper');
      var delta = parseInt(b.getAttribute('data-delta'), 10);
      var g = STEPPER[namn];
      var max = typeof g.max === 'function' ? g.max() : g.max;
      var v = stepperVarde(namn);
      b.disabled = delta < 0 ? v <= g.min : v >= max;
    });

    /* Utan spröjsfönster finns inget att spröjstvätta */
    var kortSt = $('#kort-sprojstvatt');
    if (kortSt) {
      var ruta = $('#f-sprojstvatt');
      if (S.fonster.sprojsAntal === 0 && ruta.checked) {
        ruta.checked = false;
        S.fonster.sprojstvatt = false;
      }
      kortSt.hidden = S.fonster.sprojsAntal === 0;
    }

    synkaVald();
    ritaPris();
  }

  $$('[data-stepper]').forEach(function (b) {
    b.addEventListener('click', function () {
      var namn = b.getAttribute('data-stepper');
      sattStepper(namn, stepperVarde(namn) + parseInt(b.getAttribute('data-delta'), 10));
    });
  });

  $('#f-antal-slider').addEventListener('input', function () { sattStepper('f-antal', parseInt(this.value, 10)); });
  $('#f-sprojs-slider').addEventListener('input', function () { sattStepper('f-sprojs', parseInt(this.value, 10)); });
  $('#k-yta').addEventListener('input', function () { S.kontor.yta = parseInt(this.value, 10); ritaFormular(); });

  $$('input[name="k-frekvens"]').forEach(function (i) {
    i.addEventListener('change', function () { S.kontor.frekvens = this.value; ritaFormular(); });
  });

  function koppla(id, satt) {
    $(id).addEventListener('change', function () { satt(this.checked); ritaFormular(); });
  }
  koppla('#f-balkong', function (v) { S.fonster.balkong = v; });
  koppla('#f-karmar',  function (v) { S.fonster.karmar = v; });
  koppla('#f-bleck',   function (v) { S.fonster.bleck = v; });
  koppla('#f-behandling', function (v) { S.fonster.behandling = v; });
  koppla('#f-sprojstvatt', function (v) { S.fonster.sprojstvatt = v; });


  /* --- 8.5 Stegnavigering ----------------------------------------------- */

  /* Ett steg åt gången, en fråga per steg. Sektionerna ligger i DOM-ordning
     och de som är märkta data-bara hör till en enda tjänst – de hoppas över
     när den andra tjänsten är vald. */
  var bokning = $('#bokning');
  var sidScroll = 0;
  var alla = $$('.bok-steg');
  var nuvarande = 0;

  function aktiva() {
    return alla.filter(function (sek) {
      var bara = sek.getAttribute('data-bara');
      if (!bara) return true;
      return bara === S.tjanst;
    });
  }

  function visaFel(sel) { var f = $(sel); if (f) f.classList.add('visa'); }
  function doljFel(sel) { var f = $(sel); if (f) f.classList.remove('visa'); }
  function doljAllaFel() { $$('.felruta').forEach(function (f) { f.classList.remove('visa'); }); }

  function ritaSteg() {
    var lista = aktiva();
    var sek = lista[nuvarande];
    alla.forEach(function (s) { s.classList.toggle('aktiv', s === sek); });

    /* Tacksteget ligger utanför räkningen – då är förfrågan redan skickad */
    var iTack = sek && sek.getAttribute('data-steg') === 'tack';
    var stegrad = $('#stegrad');
    if (stegrad) stegrad.hidden = iTack;

    if (!iTack) {
      var raknade = lista.filter(function (s) { return s.getAttribute('data-steg') !== 'tack'; });
      var nr = raknade.indexOf(sek) + 1;
      /* Innan tjänsten är vald räknas fönsterputsens steg med ändå, annars
         skulle totalen hoppa från 6 till 9 mitt i guiden. */
      var antagen = S.tjanst || 'fonster';
      var totalt = alla.filter(function (s) {
        var bara = s.getAttribute('data-bara');
        return s.getAttribute('data-steg') !== 'tack' && (!bara || bara === antagen);
      }).length;
      $('#stegtext').textContent = 'Steg ' + nr + ' av ' + totalt;
      $('#stegspar-fyll').style.width = (nr / totalt * 100) + '%';
    }

    if (sek && sek.getAttribute('data-steg') === 'skicka') ritaPris();
    window.scrollTo({ top: 0, behavior: 'auto' });
    var forsta = sek && sek.querySelector('input:not([type="hidden"]):not([tabindex="-1"]), textarea, button[data-valj]');
    if (forsta && forsta.focus && !iTack) forsta.focus({ preventScroll: true });
  }

  function gaTill(i) {
    var lista = aktiva();
    nuvarande = Math.min(Math.max(i, 0), lista.length - 1);
    doljAllaFel();
    ritaSteg();
  }

  function visaSteg(namn) {
    var lista = aktiva();
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].getAttribute('data-steg') === namn) { gaTill(i); return; }
    }
  }

  /** Kontrollerar det aktuella steget innan man får gå vidare. */
  /* Kontaktuppgifterna ligger i ett enda steg. Alla sex fälten valideras
     innan kunden får gå vidare. */
  var STEGFALT = {
    kontakt: ['fornamn', 'efternamn', 'telefon', 'epost', 'adress']
  };

  function stegetOk() {
    var sek = aktiva()[nuvarande];
    var namn = sek.getAttribute('data-steg');

    if (STEGFALT[namn]) {
      var ok = true, forsta = null;
      STEGFALT[namn].forEach(function (f) {
        if (!validera(f, true)) { ok = false; if (!forsta) forsta = $(FALT[f]); }
      });
      if (!ok && forsta && forsta.focus) forsta.focus();
      return ok;
    }
    if (namn === 'tjanst' && !S.tjanst) { visaFel('#fel-tjanst'); return false; }
    return true;
  }

  $$('[data-fram]').forEach(function (b) {
    b.addEventListener('click', function () { if (stegetOk()) gaTill(nuvarande + 1); });
  });
  $$('[data-bak]').forEach(function (b) {
    b.addEventListener('click', function () { gaTill(nuvarande - 1); });
  });

  /* Enter i ett textfält går vidare i stället för att skicka formuläret */
  $('#kundform').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    var sek = aktiva()[nuvarande];
    if (sek && sek.getAttribute('data-steg') === 'skicka') return;
    e.preventDefault();
    if (stegetOk()) gaTill(nuvarande + 1);
  });

  /* Tjänstekorten: ett tryck väljer och går vidare */
  $$('.val-kort[data-valj]').forEach(function (k) {
    k.addEventListener('click', function () {
      S.tjanst = k.getAttribute('data-valj');
      doljFel('#fel-tjanst');
      ritaFormular();
      /* Listan över aktiva steg ändras med tjänsten, så positionen räknas om */
      var lista = aktiva();
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].getAttribute('data-steg') === 'tjanst') { gaTill(i + 1); return; }
      }
    });
  });

  function oppnaBokning(tjanst) {
    sidScroll = window.scrollY;
    stangMeny();
    document.body.classList.add('bokar');
    bokning.setAttribute('aria-hidden', 'false');
    if (tjanst) { S.tjanst = tjanst; ritaFormular(); }
    gaTill(0);
  }

  function stangBokning() {
    document.body.classList.remove('bokar');
    bokning.setAttribute('aria-hidden', 'true');
    window.scrollTo({ top: sidScroll, behavior: 'auto' });
  }

  $$('[data-boka]').forEach(function (b) {
    b.addEventListener('click', function () { oppnaBokning(b.getAttribute('data-tjanst')); });
  });

  /* Hela tjänstekortet på startsidan är tryckbart, knappen är den riktiga
     kontrollen för tangentbord och skärmläsare. */
  $$('.tjanst-kort').forEach(function (kort) {
    var knapp = kort.querySelector('[data-boka]');
    if (!knapp) return;
    kort.addEventListener('click', function (e) {
      if (e.target.closest('a,button')) return;
      knapp.click();
    });
  });

  $('#stang-bokning').addEventListener('click', stangBokning);
  $$('[data-avbryt]').forEach(function (b) { b.addEventListener('click', stangBokning); });


  /* --- 8.6 Validering av kunduppgifter ---------------------------------- */

  /* Samma mönster som HTML5:s inbyggda e-postvalidering. Snällare regler
     (typ [^\s@]+@[^\s@]+) släpper igenom adresser som GoHighLevel sedan
     nekar med 422 "email must be an email" - då hinner kunden aldrig se
     felet, bara ett generiskt "kunde inte skickas" efteråt. */
  var EPOST_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  var REGLER = {
    fornamn: function (v) {
      if (!v.trim()) return 'Ange ditt förnamn';
      if (v.trim().length < 2) return 'Förnamnet ser för kort ut';
      return '';
    },
    efternamn: function (v) {
      if (!v.trim()) return 'Ange ditt efternamn';
      if (v.trim().length < 2) return 'Efternamnet ser för kort ut';
      return '';
    },
    telefon: function (v) {
      var rent = v.replace(/[\s\-()+.]/g, '');
      if (!v.trim()) return 'Ange ditt telefonnummer';
      if (!/^\d+$/.test(rent)) return 'Telefonnumret får bara innehålla siffror';
      if (rent.length < 8) return 'Telefonnumret ser för kort ut';
      if (rent.length > 15) return 'Telefonnumret ser för långt ut';
      return '';
    },
    epost: function (v) {
      if (!v.trim()) return 'Ange din e-postadress';
      if (!EPOST_REGEX.test(v.trim())) return 'Ange en giltig e-postadress';
      return '';
    },
    adress: function (v) {
      if (!v.trim()) return 'Ange adress och ort';
      if (v.trim().length < 4) return 'Adressen ser för kort ut';
      return '';
    }
  };

  var FALT = { fornamn: '#k-fornamn', efternamn: '#k-efternamn', telefon: '#k-telefon',
               epost: '#k-epost', adress: '#k-adress' };

  /** Returnerar true om fältet är giltigt. visaTomt=false tystar tomma fält
      medan kunden fortfarande skriver. */
  function validera(namn, visaTomt) {
    var input = $(FALT[namn]);
    var ruta = input.closest('.ffalt');
    var fel = REGLER[namn](input.value);
    var tomt = !input.value.trim();

    if (fel && (visaTomt || !tomt)) {
      ruta.classList.add('fel');
      ruta.classList.remove('ok');
      $('#fel-' + namn).textContent = fel;
      return false;
    }
    ruta.classList.remove('fel');
    ruta.classList.toggle('ok', !fel && !tomt);
    $('#fel-' + namn).textContent = '';
    return !fel;
  }

  Object.keys(FALT).forEach(function (namn) {
    var input = $(FALT[namn]);
    input.addEventListener('blur', function () { validera(namn, true); });
    input.addEventListener('input', function () { validera(namn, false); });
  });

  $('#k-gdpr').addEventListener('change', function () {
    $('#gdpr-kort').classList.toggle('fel', !this.checked);
  });


  /* --- 8.6b Cloudflare Turnstile ------------------------------------------
     Skyddar offertformuläret mot spam. Widgeten renderas automatiskt av
     Turnstiles eget skript (se head) utifrån data-sitekey på #turnstile-
     ruta - dessa tre callbacks är de globala krokarna dit den. Token
     verifieras sedan på serversidan i api/offert.js. */
  var turnstileToken = null;
  window.turnstileKlar = function (token) { turnstileToken = token; };
  window.turnstileForfallen = function () { turnstileToken = null; };
  window.turnstileFel = function () { turnstileToken = null; };


  /* --- 8.7 Skicka förfrågan --------------------------------------------- */

  /* ------------------------------------------------------------------
     LEVERANS AV FÖRFRÅGAN

     Formuläret bokar ingenting. Uppgifterna postas till /api/offert, en
     serverless-funktion i samma projekt, som lägger på GoHighLevel-token
     på serversidan och skapar kontakten i Linus subaccount. Därifrån
     skickar ett GHL-workflow mejlet och SMS:et till Linus.

     Token ligger i Vercels environment variables och når aldrig
     webbläsaren. Se api/offert.js.
     ------------------------------------------------------------------ */
  var OFFERT_URL = '/api/offert';

  function forfraganData() {
    var b = berakna();
    var f = S.fonster;
    var k = S.kontor;
    var d = {
      tjanst: S.tjanst,
      fornamn: $('#k-fornamn').value.trim(),
      efternamn: $('#k-efternamn').value.trim(),
      telefon: $('#k-telefon').value.trim(),
      epost: $('#k-epost').value.trim(),
      adress: $('#k-adress').value.trim(),
      meddelande: '',
      foretag: $('#k-foretag') ? $('#k-foretag').value : '',
      turnstileToken: turnstileToken,
      godkant: $('#k-gdpr').checked,
      prisKund: b.attBetala,
      prisForeRut: b.total,
      arbetstid: 'ca ' + visadTid(b.minuter),
      specifikation: b.rader.map(function (r) { return r.namn + ': ' + r.varde; }).join('\n')
    };
    if (S.tjanst === 'fonster') {
      d.antalFonster = f.antal;
      d.antalSprojs = f.sprojsAntal;
      d.karmar = f.karmar;
      d.bleck = f.bleck;
      d.sprojstvatt = f.sprojstvatt;
      d.balkong = f.balkong;
      d.behandling = f.behandling;
    } else {
      d.lokalyta = k.yta;
      d.frekvens = FREKVENSTEXT.kontor[k.frekvens];
    }
    return d;
  }

  function skickaForfragan() {
    return fetch(OFFERT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forfraganData())
    }).then(function (svar) {
      return svar.json().then(function (j) { return svar.ok && j && j.ok ? j : null; });
    }).catch(function () { return null; });
  }

  var bekraftaKnapp = $('#bekrafta-knapp');

  $('#kundform').addEventListener('submit', function (e) {
    e.preventDefault();
    doljFel('#fel-skicka');

    var allaOk = true, forstaFel = null;
    Object.keys(FALT).forEach(function (namn) {
      if (!validera(namn, true)) { allaOk = false; if (!forstaFel) forstaFel = namn; }
    });

    var gdprOk = $('#k-gdpr').checked;
    $('#gdpr-kort').classList.toggle('fel', !gdprOk);

    if (!allaOk || !gdprOk) {
      $('#fel-skicka-txt').textContent = !allaOk
        ? 'Något saknas i dina uppgifter. Gå tillbaka och komplettera.'
        : 'Du behöver godkänna köpvillkoren och integritetspolicyn.';
      visaFel('#fel-skicka');
      if (!allaOk) {
        /* Hoppa tillbaka till steget där fältet ligger */
        Object.keys(STEGFALT).forEach(function (steg) {
          if (STEGFALT[steg].indexOf(forstaFel) >= 0) visaSteg(steg);
        });
      } else {
        $('#k-gdpr').focus();
      }
      return;
    }

    /* Säkerhetskontrollen (Turnstile) hinner nästan alltid klart under de
       minuter kunden fyller i formuläret - men race:en finns, så vänta
       inte tyst om token saknas. */
    if (!turnstileToken) {
      $('#fel-skicka-txt').textContent =
        'Säkerhetskontrollen är inte klar än. Vänta någon sekund och försök igen.';
      visaFel('#fel-skicka');
      return;
    }

    bekraftaKnapp.classList.add('laddar');
    bekraftaKnapp.disabled = true;

    skickaForfragan().then(function (svar) {
      bekraftaKnapp.classList.remove('laddar');
      bekraftaKnapp.disabled = false;

      if (!svar) {
        /* Token är förbrukad (ett svar från Cloudflare gäller bara en gång) -
           nollställ widgeten så nästa försök får en giltig. */
        turnstileToken = null;
        if (window.turnstile) window.turnstile.reset('#turnstile-ruta');
        $('#fel-skicka-txt').textContent =
          'Förfrågan kunde inte skickas just nu. Försök igen om en stund, eller ring 076-217 18 33 så tar Linus den direkt.';
        visaFel('#fel-skicka');
        return;
      }

      /* Förfrågan är skickad - kunden ska landa på en egen tacksida, inte
         ett steg kvar i bokningsrutan. Detaljerna följer med som query-
         parametrar eftersom sidan laddas om helt och minnet (S) tappas. */
      var b = berakna();
      var params = new URLSearchParams();
      params.set('namn', $('#k-fornamn').value.trim());
      params.set('tjanst', S.tjanst === 'kontor' ? 'Kontorsputs' : 'Fönsterputs');
      if (svar.forfragan) params.set('ref', svar.forfragan);
      if (b) {
        params.set('pris', String(b.attBetala));
        params.set('rader', b.rader.map(function (r) { return r.namn + '|' + r.varde; }).join(';'));
      }
      window.location.href = '/tack?' + params.toString();
    });
  });


  /* --- 8.9 Uppstart ------------------------------------------------------ */
  ritaFormular();
  ritaSteg();

})();
