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
     7. BOKNINGSSYSTEMET
     ========================================================================== */

  /* --- 7.1 State (endast i minnet) ------------------------------------- */
  var STANDARD = {
    fonster: { antal: 15, sida: 'bada', sprojsAntal: 0, sprojstvatt: false,
               balkong: false, karmar: false, behandling: false, stortHus: false },
    kontor:  { yta: 120, frekvens: 'engang' }
  };

  var S = {
    steg: 1,
    tjanst: null,
    datum: null,       /* "2026-08-17" */
    tid: null,         /* minuter från midnatt */
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

  /* Spröjstvätt betalas per spröjsfönster: 30 kr inkl. RUT styck.
     Jämnt belopp ex. RUT så att halveringen alltid går jämnt ut. */
  var PER_SPROJSTVATT = 60;

  /**
   * FÖNSTERPUTS – alltid fast pris 990 kr inkl. RUT (1 980 kr ex. RUT).
   * Formulärets fält påverkar ENDAST den beräknade arbetstiden.
   */
  function beraknaFonster() {
    var f = S.fonster;
    var perFonster = f.sida === 'ut' ? 7 : 12;
    var min = 20 + f.antal * perFonster;
    /* Spröjstypen efterfrågas inte längre – 6 min per spröjsfönster är
       mittemellan fasta (4) och lösa (8) och ger samma bokningslängd i de
       fall som tidigare räknats igenom. */
    min += f.sprojsAntal * 6;
    if (f.stortHus) min += 40;
    if (f.sprojstvatt) min += f.sprojsAntal * 5;
    if (f.karmar) min += 20;
    if (f.balkong) min += 30;
    if (f.behandling) min += 25;

    /* Fast pris för själva huset. Inglasad balkong/uterum ingår INTE utan
       läggs på som ett tillägg. */
    /* Grundpris gäller ett standardhus upp till 200 m². Endast utsida är
       billigare eftersom jobbet går betydligt snabbare. */
    var BADA = 1980, ENDAST_UT = 1300;
    /* Alla belopp är ex. RUT och hålls JÄMNA – då blir halva summan exakt och
       radernas inkl-RUT-priser stämmer alltid mot totalen. */
    var BALKONG = 500, PER_SPROJS = 50, KARMAR = 300, BEHANDLING = 750, STORT_HUS = 500;

    var grund = f.sida === 'ut' ? ENDAST_UT : BADA;
    var rader = [{ namn: 'Fönsterputs, standardhus' + (f.sida === 'ut' ? ' (endast utsida)' : ''), varde: kr(grund), belopp: grund }];
    var total = grund;

    if (f.stortHus) { total += STORT_HUS; rader.push({ namn: 'Större hus, över 200 m²', varde: kr(STORT_HUS), belopp: STORT_HUS }); }
    if (f.sprojsAntal > 0) {
      var spr = f.sprojsAntal * PER_SPROJS;
      total += spr;
      rader.push({ namn: 'Spröjs (' + f.sprojsAntal + ' st × ' + (PER_SPROJS / 2) + ' kr)', varde: kr(spr), belopp: spr });
    }
    /* Utan spröjsfönster finns inget att tvätta – tillägget kan inte köpas. */
    if (f.sprojstvatt && f.sprojsAntal > 0) {
      var stv = f.sprojsAntal * PER_SPROJSTVATT;
      total += stv;
      rader.push({ namn: 'Spröjstvätt (' + f.sprojsAntal + ' st × ' + (PER_SPROJSTVATT / 2) + ' kr)', varde: kr(stv), belopp: stv });
    }
    if (f.karmar) { total += KARMAR; rader.push({ namn: 'Karmar och fönsterbleck', varde: kr(KARMAR), belopp: KARMAR }); }
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


  /* --- 7.3 Offertpanelen ------------------------------------------------ */

  function offertHtml(b) {
    var h = '';

    b.rader.forEach(function (r) {
      /* För RUT-tjänster visas kundens faktiska pris stort och priset före
         avdrag som en mindre rad under. Rabattrader halveras inte. */
      var varde = r.varde;
      if (b.harRut && typeof r.belopp === 'number' && !r.klass) {
        varde = kr(r.belopp / 2) + '<small>' + kr(r.belopp) + ' ex. RUT</small>';
      }
      h += '<div class="offert-rad ' + (r.klass || '') + '">' +
           '<span class="r-namn">' + r.namn + '</span>' +
           '<span class="r-varde">' + varde + '</span></div>';
    });

    if (b.visaOrdinarie) {
      h += '<div class="offert-rad summa"><span class="r-namn">Ordinarie pris</span>' +
           '<span class="r-varde">' + kr(b.total) + '</span></div>';
    }

    /* RUT-raden visas bara för fönsterputs – kontorsputs är en företagstjänst */
    if (b.harRut) {
      h += '<div class="offert-rad rut"><span class="r-namn">Du sparar med RUT-avdraget</span>' +
           '<span class="r-varde">−' + kr(b.rutBelopp) + '</span></div>';
    }

    h += '<div class="offert-tid"><svg aria-hidden="true"><use href="#i-klocka"/></svg>' +
         '<span>Beräknad arbetstid: ca ' + tidText(b.bokadMin) + '</span></div>';

    h += '<div class="betala-box"><span class="etik">' +
         (b.exMoms ? 'Pris per tillfälle<small>Exklusive moms</small>'
                   : 'Att betala<small>Inkl. RUT-avdrag · ' + kr(b.total) + ' ex. RUT</small>') +
         '</span><span class="betala-tal puls">' + kr(b.attBetala) + '</span></div>';

    if (b.arskostnad) {
      h += '<div class="manad-box"><span class="etik">Beräknad årskostnad<small>' +
           FREKVENSTEXT[b.tjanst][b.frekvens] + ', ex. moms</small></span>' +
           '<span class="manad-tal">ca ' + kr(b.arskostnad) + '/år</span></div>';
    }

    h += '<p class="offert-lugn"><svg aria-hidden="true"><use href="#i-skold"/></svg>' +
         '<span>Priset är en uppskattning baserad på dina uppgifter. Linus bekräftar alltid slutpriset innan arbetet påbörjas – inga överraskningar.</span></p>';

    return h;
  }

  var offertKropp = $('#offert-kropp');
  var moKropp = $('#mo-kropp');
  var moPris = $('#mo-pris');
  var offertTjanst = $('#offert-tjanst');

  function ritaOffert() {
    if (!S.tjanst) return;
    var b = berakna();
    var h = offertHtml(b);
    offertKropp.innerHTML = h;
    moKropp.innerHTML = h;
    offertTjanst.textContent = TJANSTNAMN[S.tjanst];

    /* Kort sammanfattning i mobilens fasta rad */
    if (b.harRut) {
      /* Kunden ska se sitt faktiska pris först – priset före RUT står bredvid. */
      moPris.innerHTML = 'Ditt pris: ' + kr(b.attBetala) + ' <em>· ' + kr(b.total) + ' ex. RUT</em>';
    } else {
      moPris.innerHTML = 'Ditt pris: ' + kr(b.attBetala) + ' <em>· ex. moms</em>';
    }
    return b;
  }


  /* --- 7.4 Formulärkontroller ------------------------------------------ */

  /* Håller .vald-klassen i synk på radio- och checkbox-korten */
  function synkaVald() {
    $$('.radio-kort').forEach(function (l) {
      var i = l.querySelector('input'); l.classList.toggle('vald', i.checked);
    });
    $$('.check-kort').forEach(function (l) {
      var i = l.querySelector('input'); l.classList.toggle('vald', i.checked);
    });
    var g = $('#gdpr-kort'); g.classList.toggle('vald', $('#k-gdpr').checked);
  }

  /* Gränser för stepper-fälten */
  var STEPPER = {
    'f-antal':  { min: 1, max: 60 },
    'f-sprojs': { min: 0, max: function () { return S.fonster.antal; } }
  };

  function stepperVarde(namn) {
    if (namn === 'f-antal')  return S.fonster.antal;
    if (namn === 'f-sprojs') return S.fonster.sprojsAntal;
    return 0;
  }
  function sattStepper(namn, v) {
    var g = STEPPER[namn];
    var max = typeof g.max === 'function' ? g.max() : g.max;
    v = Math.max(g.min, Math.min(max, v));
    if (namn === 'f-antal') {
      S.fonster.antal = v;
      $('#f-antal-slider').value = v;
      /* Spröjsfönster kan aldrig bli fler än totala antalet fönster */
      if (S.fonster.sprojsAntal > v) S.fonster.sprojsAntal = v;
    }
    if (namn === 'f-sprojs') { S.fonster.sprojsAntal = v; $('#f-sprojs-slider').value = v; }
    ritaFormular();
  }

  /* Uppdaterar alla synliga värden i formuläret + offerten */
  function ritaFormular() {
    $('#f-antal-varde').textContent = S.fonster.antal;
    $('#f-antal-slider').value = S.fonster.antal;
    $('#f-sprojs-varde').textContent = S.fonster.sprojsAntal;
    $('#f-sprojs-slider').value = S.fonster.sprojsAntal;
    $('#f-sprojs-slider').max = S.fonster.antal;
    $('#k-yta-varde').textContent = tal(S.kontor.yta) + ' m²';
    $('#k-yta').value = S.kontor.yta;

    /* Aktivera/inaktivera stepper-knappar vid gränsvärdena */
    $$('[data-stepper]').forEach(function (b) {
      var namn = b.getAttribute('data-stepper');
      var delta = parseInt(b.getAttribute('data-delta'), 10);
      var g = STEPPER[namn];
      var max = typeof g.max === 'function' ? g.max() : g.max;
      var v = stepperVarde(namn);
      b.disabled = delta < 0 ? v <= g.min : v >= max;
    });

    ritaSprojstvatt();
    synkaVald();
    ritaOffert();
  }

  /* Spröjstvättens pris följer antalet spröjsfönster kunden valt i
     formuläret. Är de noll göms tillägget helt ur uppsäljningen. */
  function ritaSprojstvatt() {
    var ruta = $('#f-sprojstvatt');
    var kort = ruta.closest('.check-kort');
    var n = S.fonster.sprojsAntal;
    if (n === 0 && ruta.checked) { ruta.checked = false; S.fonster.sprojstvatt = false; }
    if (kort) kort.hidden = n === 0;
    if (n === 0) return;
    var ex = n * PER_SPROJSTVATT;
    $('#f-sprojstvatt-pris').textContent = '+' + tal(ex / 2) + ' kr';
    $('#f-sprojstvatt-txt').textContent =
      'Spröjsen tvättas rena i sig, inte bara glaset. ' + n + ' spröjsfönster × ' +
      (PER_SPROJSTVATT / 2) + ' kr · ' + tal(ex) + ' kr ex. RUT';
  }

  /* Stepper-knappar */
  $$('[data-stepper]').forEach(function (b) {
    b.addEventListener('click', function () {
      var namn = b.getAttribute('data-stepper');
      sattStepper(namn, stepperVarde(namn) + parseInt(b.getAttribute('data-delta'), 10));
    });
  });

  /* Sliders */
  $('#f-antal-slider').addEventListener('input', function () { sattStepper('f-antal', parseInt(this.value, 10)); });
  $('#f-sprojs-slider').addEventListener('input', function () { sattStepper('f-sprojs', parseInt(this.value, 10)); });
  $('#k-yta').addEventListener('input', function () { S.kontor.yta = parseInt(this.value, 10); ritaFormular(); });

  /* Radioknappar */
  $$('input[name="f-sida"]').forEach(function (i) {
    i.addEventListener('change', function () { S.fonster.sida = this.value; ritaFormular(); });
  });
  $$('input[name="k-frekvens"]').forEach(function (i) {
    i.addEventListener('change', function () { S.kontor.frekvens = this.value; ritaFormular(); });
  });

  /* Checkboxar */
  function koppla(id, satt) {
    $(id).addEventListener('change', function () { satt(this.checked); ritaFormular(); });
  }
  koppla('#f-balkong', function (v) { S.fonster.balkong = v; });
  koppla('#f-karmar',  function (v) { S.fonster.karmar = v; });
  koppla('#f-behandling', function (v) { S.fonster.behandling = v; });
  koppla('#f-sprojstvatt', function (v) { S.fonster.sprojstvatt = v; });
  koppla('#f-storthus', function (v) { S.fonster.stortHus = v; });

  /* Mobilens offertrad kan fällas ut till full specifikation */
  var mobOffert = $('#mob-offert'), moToggle = $('#mo-toggle');
  moToggle.addEventListener('click', function () {
    var ut = mobOffert.classList.toggle('utfalld');
    moToggle.setAttribute('aria-expanded', ut ? 'true' : 'false');
  });


  /* --- 7.5 Kalendern ---------------------------------------------------- */

  var DAGNAMN = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];
  var MANNAMN = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];

  function nyckel(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function franNyckel(n) {
    var d = n.split('-');
    return new Date(parseInt(d[0], 10), parseInt(d[1], 10) - 1, parseInt(d[2], 10));
  }
  /** Arbetstider: vardag 07–17, lördag 09–14, söndag stängt. */
  function oppet(d) {
    var w = d.getDay();
    if (w === 0) return null;
    if (w === 6) return { start: 9 * 60, slut: 14 * 60 };
    return { start: 7 * 60, slut: 17 * 60 };
  }

  /* Deterministisk slumpgenerator så schemat är stabilt under hela sessionen */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function slumpare(fro) {
    var x = fro || 1;
    return function () {
      x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
      return x / 4294967296;
    };
  }

  /* Cache med upptagna block per dag. Egna bokningar läggs till här. */
  var schema = {};

  function upptagnaBlock(n) {
    if (schema[n]) return schema[n];
    var d = franNyckel(n), t = oppet(d), block = [];
    if (t) {
      var r = slumpare(hash('linus-' + n));
      var langder = [60, 90, 120, 150, 180];
      var pos = t.start;
      while (pos < t.slut - 30) {
        if (r() < 0.55) {
          var len = langder[Math.floor(r() * langder.length)];
          if (pos + len > t.slut) len = t.slut - pos;
          if (len >= 30) block.push({ start: pos, slut: pos + len });
          pos += len + 30 + Math.floor(r() * 3) * 30;
        } else {
          pos += 30 + Math.floor(r() * 3) * 30;
        }
      }
    }
    schema[n] = block;
    return block;
  }

  /** Genererar de kommande 14 dagarna från och med imorgon. */
  function kommandeDagar() {
    var lista = [], idag = new Date();
    idag.setHours(0, 0, 0, 0);
    for (var i = 1; i <= 14; i++) {
      var d = new Date(idag.getTime());
      d.setDate(d.getDate() + i);
      lista.push(d);
    }
    return lista;
  }

  var dagflikar = $('#dagflikar'), tidYta = $('#tid-yta');

  function ritaDagar() {
    var dagar = kommandeDagar();
    dagflikar.innerHTML = '';
    dagar.forEach(function (d) {
      var n = nyckel(d), stangt = !oppet(d);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dagflik';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', S.datum === n ? 'true' : 'false');
      b.disabled = stangt;
      b.dataset.datum = n;
      b.innerHTML = '<span class="dg">' + DAGNAMN[d.getDay()] + '</span>' +
                    '<span class="dd">' + d.getDate() + '</span>' +
                    '<span class="dm">' + (stangt ? 'Stängt' : MANNAMN[d.getMonth()]) + '</span>';
      if (!stangt) {
        b.addEventListener('click', function () {
          S.datum = n; S.tid = null;
          ritaDagar(); ritaTider(); doljFel('#fel-steg3');
        });
      }
      dagflikar.appendChild(b);
    });
  }

  function langText(d) {
    return DAGNAMN[d.getDay()] + ' ' + d.getDate() + ' ' + MANNAMN[d.getMonth()];
  }

  function ritaTider() {
    var b = berakna();
    if (!b) return;
    var dur = b.bokadMin;
    $('#jobblangd').textContent = 'ca ' + tidText(dur);

    if (!S.datum) { tidYta.innerHTML = ''; uppdateraValdTid(); return; }

    var d = franNyckel(S.datum), t = oppet(d);
    $('#dag-rubrik').textContent = 'Lediga starttider – ' + langText(d);

    if (!t) {
      tidYta.innerHTML = '<div class="stangt-ruta"><svg aria-hidden="true"><use href="#i-kalender"/></svg>' +
                         '<b>Stängt denna dag</b><span>Välj en vardag (07–17) eller lördag (09–14).</span></div>';
      return;
    }

    var block = upptagnaBlock(S.datum);
    var grid = document.createElement('div');
    grid.className = 'tid-grid';
    var antalLediga = 0;

    for (var start = t.start; start <= t.slut - 30; start += 30) {
      var slut = start + dur;

      /* Ligger starttiden inuti ett upptaget block? */
      var iBlock = block.some(function (bl) { return start >= bl.start && start < bl.slut; });
      /* Krockar hela jobbet med något block, eller sträcker det sig förbi stängning? */
      var krock = block.some(function (bl) { return start < bl.slut && slut > bl.start; });
      var passarInte = slut > t.slut || krock;

      var kn = document.createElement('button');
      kn.type = 'button';
      kn.className = 'tid-knapp';

      if (iBlock) {
        kn.classList.add('upptagen');
        kn.disabled = true;
        kn.innerHTML = '<span class="kl">' + klocka(start) + '</span><small>Upptaget</small>';
      } else if (passarInte) {
        kn.disabled = true;
        kn.innerHTML = '<span class="kl">' + klocka(start) + '</span><small>Får ej plats</small>';
      } else {
        antalLediga++;
        kn.setAttribute('aria-pressed', S.tid === start ? 'true' : 'false');
        kn.innerHTML = '<span class="kl">' + klocka(start) + '</span><small>' + klocka(slut) + '</small>';
        (function (s) {
          kn.addEventListener('click', function () {
            S.tid = s; ritaTider(); doljFel('#fel-steg3');
          });
        })(start);
      }
      grid.appendChild(kn);
    }

    tidYta.innerHTML = '';
    if (antalLediga === 0) {
      var tom = document.createElement('div');
      tom.className = 'stangt-ruta';
      tom.innerHTML = '<svg aria-hidden="true"><use href="#i-klocka"/></svg><b>Inga luckor som rymmer hela jobbet</b>' +
                      '<span>Ditt jobb tar ca ' + tidText(dur) + '. Prova en annan dag.</span>';
      tidYta.appendChild(tom);
    }
    tidYta.appendChild(grid);
    uppdateraValdTid();
  }

  function uppdateraValdTid() {
    var ruta = $('#vald-tid-ruta');
    if (S.datum && S.tid !== null) {
      var b = berakna();
      var d = franNyckel(S.datum);
      $('#vald-tid-txt').textContent = langText(d) + ', ' + klocka(S.tid) + '–' + klocka(S.tid + b.bokadMin);
      ruta.classList.add('visa');
    } else {
      ruta.classList.remove('visa');
    }
  }


  /* --- 7.6 Sammanfattning ----------------------------------------------- */

  /** Returnerar de valda alternativen som en lista med korta texter. */
  function valdaAlternativ() {
    var v = [];
    if (S.tjanst === 'fonster') {
      var f = S.fonster;
      v.push(f.antal + ' fönster');
      v.push(f.sida === 'ut' ? 'Endast utsida' : 'In- och utsida');
      if (f.stortHus) v.push('Större hus, över 200 m²');
      if (f.sprojsAntal > 0) v.push(f.sprojsAntal + ' med spröjs');
      if (f.sprojstvatt) v.push('Spröjstvätt');
      if (f.karmar) v.push('Karmar och fönsterbleck');
      if (f.balkong) v.push('Inglasad balkong/uterum');
      if (f.behandling) v.push('Vattenavvisande behandling');
    } else if (S.tjanst === 'kontor') {
      var k = S.kontor;
      v.push(tal(k.yta) + ' m²');
      v.push(FREKVENSTEXT.kontor[k.frekvens]);
    }
    return v;
  }

  function sammanfattningHtml(medKund) {
    var b = berakna();
    var d = franNyckel(S.datum);
    var h = '';

    h += '<div class="samm-grupp"><p class="samm-etik">Tjänst</p>' +
         '<div class="samm-rad"><span class="s-namn">Vald tjänst</span><span class="s-varde">' + TJANSTNAMN[S.tjanst] + '</span></div></div>';

    h += '<div class="samm-grupp"><p class="samm-etik">Dina val</p><div class="samm-val">';
    valdaAlternativ().forEach(function (t) { h += '<span>' + t + '</span>'; });
    h += '</div></div>';

    h += '<div class="samm-grupp"><p class="samm-etik">Tid</p>' +
         '<div class="samm-rad"><span class="s-namn">Datum</span><span class="s-varde">' + langText(d) + '</span></div>' +
         '<div class="samm-rad"><span class="s-namn">Klockslag</span><span class="s-varde">' + klocka(S.tid) + '–' + klocka(S.tid + b.bokadMin) + '</span></div>' +
         '<div class="samm-rad"><span class="s-namn">Beräknad arbetstid</span><span class="s-varde">ca ' + tidText(b.bokadMin) + '</span></div></div>';

    if (medKund) {
      h += '<div class="samm-grupp"><p class="samm-etik">Kontakt</p>' +
           '<div class="samm-rad"><span class="s-namn">Namn</span><span class="s-varde">' + esc($('#k-namn').value.trim()) + '</span></div>' +
           '<div class="samm-rad"><span class="s-namn">Telefon</span><span class="s-varde">' + esc($('#k-telefon').value.trim()) + '</span></div>' +
           '<div class="samm-rad"><span class="s-namn">E-post</span><span class="s-varde">' + esc($('#k-epost').value.trim()) + '</span></div>' +
           '<div class="samm-rad"><span class="s-namn">Adress</span><span class="s-varde">' + esc($('#k-adress').value.trim()) + ', ' + esc($('#k-ort').value.trim()) + '</span></div></div>';
    }

    h += '<div class="samm-grupp"><p class="samm-etik">Pris</p>';
    if (b.harRut) {
      h += '<div class="samm-rad"><span class="s-namn">Pris ex. RUT</span><span class="s-varde">' + kr(b.total) + '</span></div>';
      h += '<div class="samm-rad gron"><span class="s-namn">Du sparar med RUT-avdraget</span><span class="s-varde">−' + kr(b.rutBelopp) + '</span></div>';
    } else {
      h += '<div class="samm-rad"><span class="s-namn">Pris ex. moms</span><span class="s-varde">' + kr(b.total) + '</span></div>';
    }
    h += '<div class="samm-rad stor"><span class="s-namn">' + (b.exMoms ? 'Per tillfälle, ex. moms' : 'Att betala inkl. RUT') + '</span><span class="s-varde">' + kr(b.attBetala) + '</span></div>';
    if (b.arskostnad) {
      h += '<div class="samm-rad"><span class="s-namn">Beräknad årskostnad</span><span class="s-varde">ca ' + kr(b.arskostnad) + '/år</span></div>';
    }
    h += '</div>';

    return h;
  }

  /** Enkel HTML-escape så att kunduppgifter aldrig tolkas som markup. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }


  /* --- 7.7 Stegnavigering ----------------------------------------------- */

  var bokning = $('#bokning');
  var stegSektioner = { 1: $('#steg1'), 2: $('#steg2'), 3: $('#steg3'), 4: $('#steg4'), 5: $('#steg5') };
  var sidScroll = 0;

  function visaFel(sel) { var f = $(sel); if (f) f.classList.add('visa'); }
  function doljFel(sel) { var f = $(sel); if (f) f.classList.remove('visa'); }
  function doljAllaFel() { $$('.felruta').forEach(function (f) { f.classList.remove('visa'); }); }

  function uppdateraStegrad() {
    $$('#stegrad li').forEach(function (li) {
      var n = parseInt(li.getAttribute('data-steg'), 10);
      li.classList.toggle('aktiv', n === S.steg);
      li.classList.toggle('klar', n < S.steg || S.steg === 5);
      var boll = li.querySelector('.steg-boll');
      if (n < S.steg || S.steg === 5) boll.innerHTML = '<svg aria-hidden="true"><use href="#i-bock"/></svg>';
      else boll.textContent = n;
    });
  }

  function gaTill(n) {
    doljAllaFel();
    S.steg = n;

    Object.keys(stegSektioner).forEach(function (k) {
      stegSektioner[k].classList.toggle('aktiv', parseInt(k, 10) === n);
    });

    /* Mobilens offertrad visas endast i steg 2 */
    document.body.classList.toggle('pa-steg2', n === 2);
    mobOffert.classList.remove('utfalld');
    moToggle.setAttribute('aria-expanded', 'false');

    if (n === 2) { visaTillagg(false); ritaFormular(); }
    if (n === 3) { ritaDagar(); ritaTider(); }
    if (n === 4) $('#samm-steg4').innerHTML = sammanfattningHtml(false);

    uppdateraStegrad();
    window.scrollTo({ top: 0, behavior: mjuk ? 'smooth' : 'auto' });
  }

  /** Kontrollerar att steget innan är ifyllt innan man går vidare. */
  function farGaTill(n) {
    if (n >= 2 && !S.tjanst) { return false; }
    if (n >= 4 && (!S.datum || S.tid === null)) { visaFel('#fel-steg3'); return false; }
    return true;
  }

  function oppnaBokning(tjanst) {
    sidScroll = window.scrollY;
    stangMeny();
    document.body.classList.add('bokar');
    bokning.setAttribute('aria-hidden', 'false');

    if (tjanst) {
      valjTjanst(tjanst);
      gaTill(2);
    } else {
      gaTill(S.tjanst ? S.steg : 1);
    }
  }

  function stangBokning() {
    document.body.classList.remove('bokar', 'pa-steg2');
    bokning.setAttribute('aria-hidden', 'true');
    window.scrollTo({ top: sidScroll, behavior: 'auto' });
  }

  function valjTjanst(t) {
    S.tjanst = t;
    /* Byte av tjänst ändrar jobbets längd – tidigare vald tid nollställs */
    S.datum = null; S.tid = null;

    $$('.valj-kort').forEach(function (k) {
      k.setAttribute('aria-pressed', k.getAttribute('data-valj') === t ? 'true' : 'false');
    });
    $('#form-fonster').hidden = t !== 'fonster';
    $('#form-kontor').hidden = t !== 'kontor';
    ritaFormular();
  }

  /* Alla "Boka"-knappar på sidan */
  $$('[data-boka]').forEach(function (b) {
    b.addEventListener('click', function () { oppnaBokning(b.getAttribute('data-tjanst')); });
  });

  /* Hela tjänstekortet är tryckbart och ger samma resultat som kortets knapp.
     Knappen är kvar som den riktiga kontrollen för tangentbord och skärmläsare;
     klick direkt på knappen eller en länk hanteras av dem själva. */
  $$('.tjanst-kort').forEach(function (kort) {
    var knapp = kort.querySelector('[data-boka]');
    if (!knapp) return;
    kort.addEventListener('click', function (e) {
      if (e.target.closest('a,button')) return;
      knapp.click();
    });
  });

  /* Tjänstekorten i steg 1: ett tryck väljer tjänsten OCH går vidare,
     så det inte behövs någon extra Fortsätt-knapp. */
  $$('.valj-kort').forEach(function (k) {
    k.addEventListener('click', function () {
      valjTjanst(k.getAttribute('data-valj'));
      gaTill(2);
    });
  });

  /* Nästa / tillbaka.
     Steg 2 har ett mellanläge: första tryckningen visar tilläggen som en
     frivillig uppsäljning, andra tryckningen går vidare till kalendern.
     Kontorsputs har inga tillval och hoppar direkt vidare. */
  var tillaggVisad = false;
  var tillaggVy = $('#tillagg-vy');

  function visaTillagg(pa) {
    tillaggVisad = pa;
    if (tillaggVy) tillaggVy.hidden = !pa;
    if (S.tjanst) $('#form-' + S.tjanst).hidden = pa;
    $$('[data-nasta="3"]').forEach(function (k) {
      var e = k.querySelector('.etikett-txt') || k;
      e.textContent = pa ? 'Fortsätt till kalendern' : 'Välj tid i kalendern';
    });
    /* Rubriken ska matcha läget, annars står 'Skräddarsy ditt uppdrag'
       ovanför 'Vill du lägga till något?' */
    var r = $('#steg2-rubrik');
    if (r) {
      r.textContent = pa ? 'Nästan klart' : 'Skräddarsy ditt uppdrag';
      var p = r.parentNode.querySelector('p');
      if (p) p.textContent = pa ? 'Lägg till det du vill ha – annars går du bara vidare.' : 'Priset uppdateras direkt medan du fyller i.';
    }
    if (pa) window.scrollTo({ top: 0, behavior: mjuk ? 'smooth' : 'auto' });
  }

  $$('[data-nasta]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = parseInt(b.getAttribute('data-nasta'), 10);
      if (n === 3 && S.tjanst === 'fonster' && !tillaggVisad) { visaTillagg(true); return; }
      if (farGaTill(n)) gaTill(n);
    });
  });
  $$('[data-tillbaka]').forEach(function (b) {
    b.addEventListener('click', function () { gaTill(parseInt(b.getAttribute('data-tillbaka'), 10)); });
  });

  /* Pilen i steg 2 backar ett läge i taget: tillägg → formulär → steg 1 */
  var steg2Bak = $('#steg2-bak');
  if (steg2Bak) steg2Bak.addEventListener('click', function () {
    if (tillaggVisad) {
      visaTillagg(false);
      window.scrollTo({ top: 0, behavior: mjuk ? 'smooth' : 'auto' });
    } else {
      gaTill(1);
    }
  });

  /* Klick i stegindikatorn – går bara bakåt till avklarade steg */
  $$('#stegrad li').forEach(function (li) {
    li.querySelector('.steg-knapp').addEventListener('click', function () {
      var n = parseInt(li.getAttribute('data-steg'), 10);
      if (n < S.steg && S.steg !== 5) gaTill(n);
    });
  });

  $('#stang-bokning').addEventListener('click', stangBokning);
  $('#steg1-avbryt').addEventListener('click', stangBokning);
  $('#till-start').addEventListener('click', function () { nollstall(); stangBokning(); });
  $('#boka-till').addEventListener('click', function () { nollstall(); gaTill(1); });


  /* --- 7.8 Validering av kunduppgifter ---------------------------------- */

  var REGLER = {
    namn: function (v) {
      if (!v.trim()) return 'Ange ditt namn';
      if (v.trim().length < 2) return 'Namnet ser för kort ut';
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
      if (!v.trim()) return 'Ange din gatuadress';
      if (v.trim().length < 4) return 'Adressen ser för kort ut';
      return '';
    },
    ort: function (v) {
      if (!v.trim()) return 'Ange postort';
      if (v.trim().length < 2) return 'Postorten ser för kort ut';
      return '';
    }
  };

  var FALT = { namn: '#k-namn', telefon: '#k-telefon', epost: '#k-epost', adress: '#k-adress', ort: '#k-ort' };

  function validera(namn, visaTomt) {
    var input = $(FALT[namn]);
    var block = input.closest('.ffalt');
    var fel = REGLER[namn](input.value);

    if (fel && (visaTomt || input.value.trim() !== '')) {
      block.classList.add('fel'); block.classList.remove('ok');
      $('#fel-' + namn).textContent = fel;
      input.setAttribute('aria-invalid', 'true');
    } else if (!fel) {
      block.classList.remove('fel'); block.classList.add('ok');
      input.removeAttribute('aria-invalid');
    } else {
      block.classList.remove('fel', 'ok');
      input.removeAttribute('aria-invalid');
    }
    return !fel;
  }

  Object.keys(FALT).forEach(function (namn) {
    var input = $(FALT[namn]);
    input.addEventListener('blur', function () { validera(namn, true); });
    input.addEventListener('input', function () { validera(namn, false); });
  });

  $('#k-gdpr').addEventListener('change', function () {
    $('#gdpr-kort').classList.toggle('fel', !this.checked);
    synkaVald();
  });


  /* --- 7.9 Bekräfta bokning --------------------------------------------- */

  /* ------------------------------------------------------------------
     LEVERANS AV BOKNINGEN

     [BYT UT] Sätt BOKNING_URL till adressen dit bokningarna ska skickas –
     ett formulärskript hos webbhotellet, en e-posttjänst eller ett eget
     API. Adressen måste ligga på egen eller EU-baserad server, och avtal
     om personuppgiftsbiträde ska finnas med leverantören innan den
     används skarpt (se integritetspolicyn, punkt 5).

     Så länge BOKNING_URL är tom går bokningen INTE fram någonstans. Sidan
     är då en demo: kunden får en bekräftelse på skärmen men Linus får
     ingenting. Fyll i adressen innan sidan tas i skarp drift.
     ------------------------------------------------------------------ */
  var BOKNING_URL = '';

  function bokningsData(boknr) {
    var b = berakna();
    return {
      bokningsnummer: boknr,
      tjanst: S.tjanst === 'fonster' ? 'Fönsterputs' : 'Kontorsputs',
      datum: S.datum,
      starttid: klocka(S.tid),
      berakenadTid: tidText(b.bokadMin),
      pris: b.attBetala,
      prisForeRut: b.total,
      valutakod: 'SEK',
      detaljer: b.rader.map(function (r) { return r.namn + ': ' + r.varde; }),
      kund: {
        namn: $('#k-namn').value.trim(),
        telefon: $('#k-telefon').value.trim(),
        epost: $('#k-epost').value.trim(),
        adress: $('#k-adress').value.trim(),
        ort: $('#k-ort').value.trim(),
        meddelande: $('#k-meddelande').value.trim()
      },
      /* Dokumenteras för att kunna visa att kraven i distansavtalslagen
         och GDPR uppfyllts vid bokningstillfället. */
      godkannanden: {
        villkorOchIntegritetspolicy: true,
        begartUtforandeInomAngerfrist: true,
        tidpunkt: new Date().toISOString()
      }
    };
  }

  function skickaBokning(boknr) {
    if (!BOKNING_URL) {
      /* Demo-läge: ingen mottagare konfigurerad. */
      if (window.console && console.warn) {
        console.warn('Linus Fönsterputs: BOKNING_URL är inte satt i app.js – ' +
                     'bokningen skickas inte vidare. Se kommentaren i koden.');
      }
      return new Promise(function (ok) { setTimeout(function () { ok(true); }, 900); });
    }
    return fetch(BOKNING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bokningsData(boknr))
    }).then(function (svar) { return svar.ok; })
      .catch(function () { return false; });
  }

  var bekraftaKnapp = $('#bekrafta-knapp');

  $('#kundform').addEventListener('submit', function (e) {
    e.preventDefault();
    doljFel('#fel-steg4');

    var allaOk = true, forstaFel = null;
    Object.keys(FALT).forEach(function (namn) {
      if (!validera(namn, true)) { allaOk = false; if (!forstaFel) forstaFel = $(FALT[namn]); }
    });

    /* Två separata godkännanden krävs: köpvillkor/integritetspolicy, och
       den uttryckliga begäran som distansavtalslagen kräver för att arbetet
       ska få påbörjas inom ångerfristen. De får inte slås ihop till en ruta. */
    var gdprOk = $('#k-gdpr').checked;
    var angerOk = $('#k-anger').checked;
    $('#gdpr-kort').classList.toggle('fel', !gdprOk);
    $('#anger-kort').classList.toggle('fel', !angerOk);

    if (!allaOk || !gdprOk || !angerOk) {
      $('#fel-steg4-txt').textContent =
        !allaOk ? 'Kontrollera de rödmarkerade fälten innan du bekräftar.'
        : !gdprOk ? 'Du behöver godkänna köpvillkoren och integritetspolicyn.'
        : 'Kryssa i att arbetet får påbörjas på den tid du valt.';
      visaFel('#fel-steg4');
      var mal = forstaFel || (!gdprOk ? $('#k-gdpr') : $('#k-anger'));
      if (mal.focus) mal.focus();
      return;
    }

    bekraftaKnapp.classList.add('laddar');
    bekraftaKnapp.disabled = true;

    var boknr = 'LF-' + String(Math.floor(1000 + Math.random() * 9000));

    skickaBokning(boknr).then(function (levererad) {
      bekraftaKnapp.classList.remove('laddar');
      bekraftaKnapp.disabled = false;

      if (!levererad) {
        $('#fel-steg4-txt').textContent =
          'Bokningen kunde inte skickas just nu. Försök igen om en stund, eller ring 076-217 18 33 så tar Linus den direkt.';
        visaFel('#fel-steg4');
        return;
      }

      var b = berakna();

      /* Den bokade tiden blir upptagen i kalendern under resten av sessionen */
      upptagnaBlock(S.datum).push({ start: S.tid, slut: S.tid + b.bokadMin });

      var fornamn = $('#k-namn').value.trim().split(/\s+/)[0];
      $('#bekr-rubrik').textContent = 'Tack ' + fornamn + '! Din bokning är mottagen.';
      $('#boknr').textContent = boknr;
      $('#samm-bekr').innerHTML = sammanfattningHtml(true);

      gaTill(5);
    });
  });


  /* --- 7.10 Nollställning ------------------------------------------------ */

  function nollstall() {
    S.tjanst = null; S.datum = null; S.tid = null;
    S.fonster = Object.assign({}, STANDARD.fonster);
    S.kontor  = Object.assign({}, STANDARD.kontor);

    /* Återställ formulärkontroller */
    $('#f-antal-slider').value = 15;
    $('input[name="f-sida"][value="bada"]').checked = true;
    $('input[name="k-frekvens"][value="engang"]').checked = true;
    ['#f-balkong', '#f-karmar', '#f-behandling', '#f-sprojstvatt', '#f-storthus'].forEach(function (id) { $(id).checked = false; });
    $('#f-sprojs-slider').value = 0;
    $('#k-yta').value = 120;

    $$('.valj-kort').forEach(function (k) { k.setAttribute('aria-pressed', 'false'); });
    $('#form-fonster').hidden = true;
    $('#form-kontor').hidden = true;

    /* Töm kundformuläret */
    $('#kundform').reset();
    $('#k-ort').value = 'Uppsala';
    $$('.ffalt').forEach(function (f) { f.classList.remove('ok', 'fel'); });
    $('#gdpr-kort').classList.remove('fel');
    $('#anger-kort').classList.remove('fel');

    synkaVald();
    doljAllaFel();
  }


  /* --- 7.11 Uppstart ----------------------------------------------------- */
  synkaVald();
  uppdateraStegrad();

})();
