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

  function stangMeny() {
    mobmeny.classList.remove('oppen');
    burgare.setAttribute('aria-expanded', 'false');
    burgare.setAttribute('aria-label', 'Öppna meny');
    topp.classList.remove('meny-oppen');
    document.body.classList.remove('laast');
  }
  function vaxlaMeny() {
    var oppen = mobmeny.classList.toggle('oppen');
    burgare.setAttribute('aria-expanded', oppen ? 'true' : 'false');
    burgare.setAttribute('aria-label', oppen ? 'Stäng meny' : 'Öppna meny');
    topp.classList.toggle('meny-oppen', oppen);
    document.body.classList.toggle('laast', oppen);
  }
  burgare.addEventListener('click', vaxlaMeny);

  /* Menyn stängs när man klickar på vilken länk som helst i den – inte bara
     navlänkarna, utan även genvägen till tjänsterna och telefonnumret. */
  $$('#mobmeny a').forEach(function (a) { a.addEventListener('click', stangMeny); });

  /* Escape stänger menyn */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobmeny.classList.contains('oppen')) { stangMeny(); burgare.focus(); }
  });


  /* ------------------------------------------------------------------------
     3. Scroll-in-animationer (IntersectionObserver)
     ------------------------------------------------------------------------ */
  if ('IntersectionObserver' in window && mjuk) {
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
    knapp.addEventListener('click', function () {
      var post = knapp.closest('.faq-post');
      var svar = document.getElementById(knapp.getAttribute('aria-controls'));
      var oppen = knapp.getAttribute('aria-expanded') === 'true';

      /* Stäng alla först */
      faqKnappar.forEach(function (k) {
        k.setAttribute('aria-expanded', 'false');
        k.closest('.faq-post').classList.remove('oppen');
        document.getElementById(k.getAttribute('aria-controls')).style.maxHeight = null;
      });

      /* Öppna den klickade om den var stängd */
      if (!oppen) {
        knapp.setAttribute('aria-expanded', 'true');
        post.classList.add('oppen');
        svar.style.maxHeight = svar.scrollHeight + 'px';
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
      p.setAttribute('role', 'tab');
      p.setAttribute('aria-label', 'Jämförelse ' + (k + 1) + ': ' + s.getAttribute('data-scen'));
      p.addEventListener('click', function () { visa(k); });
      punkter.appendChild(p);
    });

    function visa(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, m) { s.classList.toggle('aktiv', m === i); });
      $$('.fe-punkt', punkter).forEach(function (p, m) {
        p.setAttribute('aria-selected', m === i ? 'true' : 'false');
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


  /* ==========================================================================
     7. OFFERTFÖRFRÅGAN
     ========================================================================== */

  /* --- 7.1 State (endast i minnet) ------------------------------------- */
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


  /* --- 7.2 Prisberäkning ------------------------------------------------ */

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


  /* --- 7.3 Prisrutan ---------------------------------------------------- */

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

  /* Sammanfattningen i tack-steget, samma beräkning som prisrutan men utan
     specifikationsknappen – kunden ska se allt direkt. */
  function ritaTackSammanfattning() {
    var b = berakna();
    var rader = $('#tack-sam-rader');
    if (!rader || !b) return;

    var h = '';
    b.rader.forEach(function (r) {
      h += '<div class="pris-rad"><span>' + r.namn + '</span><span>' + r.varde + '</span></div>';
    });
    h += '<div class="pris-rad summa"><span>Uppskattat pris' + (b.harRut ? ', efter RUT' : '') + '</span><span>' + kr(b.attBetala) + '</span></div>';
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


  /* --- 7.4 Formulärkontroller ------------------------------------------ */

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


  /* --- 7.5 Stegnavigering ----------------------------------------------- */

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
  $('#till-start').addEventListener('click', function () { nollstall(); stangBokning(); });
  $('#boka-till').addEventListener('click', function () { nollstall(); gaTill(0); });


  /* --- 7.6 Validering av kunduppgifter ---------------------------------- */

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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ange en giltig e-postadress';
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


  /* --- 7.7 Skicka förfrågan --------------------------------------------- */

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

    bekraftaKnapp.classList.add('laddar');
    bekraftaKnapp.disabled = true;

    skickaForfragan().then(function (svar) {
      bekraftaKnapp.classList.remove('laddar');
      bekraftaKnapp.disabled = false;

      if (!svar) {
        $('#fel-skicka-txt').textContent =
          'Förfrågan kunde inte skickas just nu. Försök igen om en stund, eller ring 076-217 18 33 så tar Linus den direkt.';
        visaFel('#fel-skicka');
        return;
      }

      $('#bekr-rubrik').textContent = 'Tack ' + $('#k-fornamn').value.trim() + '! Din förfrågan är skickad.';
      $('#boknr').textContent = svar.forfragan || '–';
      ritaTackSammanfattning();
      visaSteg('tack');
    });
  });


  /* --- 7.8 Nollställning ------------------------------------------------- */

  function nollstall() {
    S.tjanst = null;
    S.fonster = Object.assign({}, STANDARD.fonster);
    S.kontor  = Object.assign({}, STANDARD.kontor);

    $('#f-antal-slider').value = 15;
    $('#f-sprojs-slider').value = 0;
    $('#k-yta').value = 120;
    $('input[name="k-frekvens"][value="engang"]').checked = true;
    ['#f-balkong', '#f-karmar', '#f-bleck', '#f-behandling', '#f-sprojstvatt'].forEach(function (id) { $(id).checked = false; });

    $('#kundform').reset();
    $$('.ffalt').forEach(function (f) { f.classList.remove('ok', 'fel'); });
    $('#gdpr-kort').classList.remove('fel');
    $$('.faltfel').forEach(function (p) { p.textContent = ''; });

    ritaFormular();
    doljAllaFel();
  }


  /* --- 7.9 Uppstart ------------------------------------------------------ */
  ritaFormular();
  ritaSteg();

})();
