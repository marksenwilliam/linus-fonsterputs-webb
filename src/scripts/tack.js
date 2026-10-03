(function () {
  'use strict';

  /* Allt som kommer via query-strängen är obekräftat – sidan kan nås
     direkt med vilken länk som helst. Därför sätts bara textContent,
     aldrig innerHTML, på värden som härstammar härifrån. */
  var p = new URLSearchParams(location.search);
  var namn = (p.get('namn') || '').slice(0, 60);
  var tjanst = p.get('tjanst');
  var ref = (p.get('ref') || '').slice(0, 20);
  var pris = (p.get('pris') || '').slice(0, 20);
  var rader = p.get('rader') || '';

  if (namn) {
    document.getElementById('tack-rubrik').textContent = 'Tack, ' + namn + '!';
  }
  document.getElementById('tack-tjanst').textContent =
    tjanst === 'Kontorsputs' ? 'din kontorsputs' : 'din fönsterputs';

  if (ref) {
    document.getElementById('tack-ref').textContent = ref;
    document.getElementById('tack-boknr').hidden = false;
  }

  if (rader) {
    var behallare = document.getElementById('tack-sam-rader');
    rader.split(';').forEach(function (post) {
      if (!post) return;
      var delar = post.split('|');
      var rad = document.createElement('div');
      rad.className = 'pris-rad';
      var etikett = document.createElement('span');
      etikett.textContent = delar[0] || '';
      var varde = document.createElement('span');
      varde.textContent = delar[1] || '';
      rad.appendChild(etikett);
      rad.appendChild(varde);
      behallare.appendChild(rad);
    });
    if (pris) {
      var summa = document.createElement('div');
      summa.className = 'pris-rad summa';
      var s1 = document.createElement('span');
      s1.textContent = 'Uppskattat pris';
      var s2 = document.createElement('span');
      s2.textContent = pris + ' kr';
      summa.appendChild(s1);
      summa.appendChild(s2);
      behallare.appendChild(summa);
    }
    if (behallare.children.length) {
      document.getElementById('tack-sammanfattning').hidden = false;
    }
  }

  /* Mobilmenyns burgarknapp. Sidan laddar inte app.js (det förutsätter
     bokningsformuläret som inte finns här), så samma beteende byggs
     upp separat i miniatyr: samma klassnamn som övriga sidor använder. */
  var burgare = document.getElementById('burgare');
  var mobmeny = document.getElementById('mobmeny');
  var topp = document.getElementById('topp');
  var menyBakgrund = [];

  function menyFokus() {
    return [burgare].concat(Array.prototype.slice.call(mobmeny.querySelectorAll('a[href], button:not([disabled])')))
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
    menyBakgrund = Array.prototype.slice.call(document.querySelectorAll('main, .footer, .mob-cta')).map(function (el) {
      var post = { el: el, varInert: el.hasAttribute('inert') };
      el.setAttribute('inert', '');
      return post;
    });
    var fokus = menyFokus();
    (fokus[1] || burgare).focus();
  }
  if (burgare && mobmeny && topp) {
    burgare.addEventListener('click', vaxlaMeny);
    Array.prototype.slice.call(mobmeny.querySelectorAll('a')).forEach(function (a) {
      a.addEventListener('click', stangMeny);
    });
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
    window.addEventListener('resize', function () {
      if (window.innerWidth < 1200 || !mobmeny.classList.contains('oppen')) return;
      var flyttaFokus = mobmeny.contains(document.activeElement) || document.activeElement === burgare;
      stangMeny();
      if (flyttaFokus) {
        var lank = topp.querySelector('.nav a');
        if (lank) lank.focus();
      }
    });
  }
})();
