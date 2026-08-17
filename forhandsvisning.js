/* Slår på eller av förhandsvisningsläge.
   node forhandsvisning.js pa   – noindex + förhandsvisningsbanner
   node forhandsvisning.js av   – tillbaka till skarpt läge

   Syftet är att sidan kan ligga öppet för att visas upp, utan att den
   framstår som en verksamhet i drift och utan att hamna i sökresultat. */
const fs = require('fs');
const ROT = 'c:/Users/user/Desktop/Vibe websites/Linus fönsterputs v2';
const PA = (process.argv[2] || 'pa') === 'pa';

const SIDOR = fs.readdirSync(ROT).filter(f => f.endsWith('.html'));

const META = '<meta name="robots" content="noindex,nofollow">\n';
const BANNER = `<!-- FÖRHANDSVISNING – tas bort med: node forhandsvisning.js av -->
<div class="forhandsvisning" role="note">
  <div class="wrap">
    <b>Förhandsvisning.</b> Sidan visas upp för granskning och är inte i drift.
    Omdömen och företagsuppgifter är exempelinnehåll, och bokningar tas inte emot.
  </div>
</div>

`;

/* Omdömena är påhittade OCH tillskrivna Google. Under förhandsvisningen
   märks avsnittet ut på plats, där det falska intrycket annars uppstår.
   Layouten lämnas orörd så att designen fortfarande går att bedöma. */
const OMD_ANKARE = '    <div class="betyg-topp in">';
const OMD_MARKE = `    <p class="exempelmarke in"><svg aria-hidden="true"><use href="#i-varning"/></svg>
      <span><b>Exempelomdömen.</b> Texterna, betyget och antalet är påhittade och
      kommer inte från Google. De ersätts med riktiga kundomdömen innan sidan tas i drift.</span></p>

`;

let n = 0;
SIDOR.forEach(f => {
  let h = fs.readFileSync(ROT + '/' + f, 'utf8');
  const fore = h;

  /* 404-sidan har redan noindex och ska inte få två */
  const harEgenNoindex = /<meta name="robots" content="noindex,follow">/.test(h);

  if (PA) {
    if (!h.includes(META.trim()) && !harEgenNoindex) {
      h = h.replace('<meta name="theme-color"', () => META + '<meta name="theme-color"');
    }
    if (!h.includes('class="forhandsvisning"')) {
      h = h.replace('<div id="hemsida">\n', () => '<div id="hemsida">\n\n' + BANNER);
    }
    if (h.includes(OMD_ANKARE) && !h.includes('class="exempelmarke in"')) {
      h = h.replace(OMD_ANKARE, () => OMD_MARKE + OMD_ANKARE);
    }
  } else {
    h = h.split(OMD_MARKE).join('');
    h = h.split(META).join('');
    const i = h.indexOf('<!-- FÖRHANDSVISNING');
    if (i >= 0) {
      const j = h.indexOf('</div>\n\n', h.indexOf('</div>', i) + 1);
      h = h.slice(0, i) + h.slice(j + 8);
    }
  }

  if (h !== fore) { fs.writeFileSync(ROT + '/' + f, h); n++; }
});
console.log('  ' + n + ' sidor ' + (PA ? 'satta i förhandsvisning' : 'återställda'));

/* ---- robots.txt -------------------------------------------------------- */
fs.writeFileSync(ROT + '/robots.txt', PA
? `# FÖRHANDSVISNING – sidan ska inte indexeras medan den granskas.
# Återställs med: node forhandsvisning.js av
User-agent: *
Disallow: /
`
: `# Linus Fönsterputs
User-agent: *
Allow: /
Disallow: /404.html

Sitemap: https://linusfonsterputs.se/sitemap.xml
`);
console.log('  robots.txt ' + (PA ? 'blockerar alla robotar' : 'återställd'));

/* ---- vercel.json ------------------------------------------------------- */
/* X-Robots-Tag som svarshuvud fångar även det som inte är HTML, och gäller
   även om en robot struntar i robots.txt. */
if (PA) {
  fs.writeFileSync(ROT + '/vercel.json', JSON.stringify({
    $schema: 'https://openapi.vercel.sh/vercel.json',
    headers: [{
      source: '/(.*)',
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' }]
    }]
  }, null, 2) + '\n');
  console.log('  vercel.json skriven med X-Robots-Tag');
} else if (fs.existsSync(ROT + '/vercel.json')) {
  fs.unlinkSync(ROT + '/vercel.json');
  console.log('  vercel.json borttagen');
}

/* ---- CSS --------------------------------------------------------------- */
let css = fs.readFileSync(ROT + '/stil.css', 'utf8');
const CSS_START = '\n/* ==========================================================================\n   26. FÖRHANDSVISNINGSBANNER';
if (PA && !css.includes(CSS_START)) {
  css += `${CSS_START}
   Ligger i sidflödet, inte fastklistrad – syns vid inläsning på varje sida
   och rullar sedan undan, så att den inte stör granskningen av designen.
   ========================================================================== */
.forhandsvisning{
  background:#78350F;color:#FEF3C7;
  font-size:.8rem;line-height:1.5;padding:9px 0;
  border-bottom:2px solid #B45309;
}
.forhandsvisning .wrap{display:block;}
.forhandsvisning b{color:#FDE68A;}
@media(min-width:1024px){.forhandsvisning{font-size:.85rem;text-align:center;}}

/* Märkning direkt på omdömesavsnittet, där intrycket annars uppstår */
.exempelmarke{
  display:flex;gap:11px;align-items:flex-start;
  max-width:720px;margin:0 auto 22px;
  background:#FEF3C7;border:1px solid #FCD34D;border-radius:var(--radie-s);
  padding:13px 16px;font-size:.86rem;line-height:1.55;color:#78350F;text-align:left;
}
.exempelmarke svg{
  width:19px;height:19px;flex:none;margin-top:1px;
  stroke:#B45309;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;
}
.exempelmarke b{color:#78350F;}
`;
  fs.writeFileSync(ROT + '/stil.css', css);
  console.log('  CSS för bannern tillagd');
} else if (!PA && css.includes(CSS_START)) {
  css = css.slice(0, css.indexOf(CSS_START));
  fs.writeFileSync(ROT + '/stil.css', css);
  console.log('  CSS för bannern borttagen');
}
