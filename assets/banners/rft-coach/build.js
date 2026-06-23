/* Builds a self-contained 1080x1350 Instagram poster (fonts embedded, photo via file://). */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const FONTS = path.join(DIR, 'fonts');
const PHOTO = 'file://' + path.join(DIR, 'src', 'coach-2x.jpg');

const b64 = p => fs.readFileSync(p).toString('base64');
const face = (fam, wght, file) =>
  `@font-face{font-family:'${fam}';font-style:normal;font-weight:${wght};font-display:block;` +
  `src:url(data:font/woff2;base64,${b64(path.join(FONTS, file))}) format('woff2');}`;

const FONTCSS = [
  face('Oswald', 500, 'oswald-500.woff2'),
  face('Oswald', 600, 'oswald-600.woff2'),
  face('Oswald', 700, 'oswald-700.woff2'),
  face('Inter', 400, 'inter-400.woff2'),
  face('Inter', 500, 'inter-500.woff2'),
  face('Inter', 600, 'inter-600.woff2'),
  face('Inter', 700, 'inter-700.woff2'),
].join('\n');

// editable content ------------------------------------------------------------
const C = {
  brandTop: 'RFT BRASIL',
  brandSub: 'RENOVAÇÃO FIGHT TEAM',
  city: 'RIO DE JANEIRO · BRASIL',
  eyebrow: 'TREINAMENTO PARTICULAR · AULAS 1 A 1',
  h1: 'TREINAMENTO PARTICULAR',
  disc: ['BOXE', 'MUAY THAI', 'KICKBOXING', 'MMA'],
  sub: 'Aulas personalizadas para todos os níveis.',
  sub2: 'Técnica · Condicionamento · Defesa pessoal',
  coachName: 'CAIO ITALO',
  coachRole: 'Lutador profissional de MMA · RFT Brasil, Rio de Janeiro.',
  forwho: ['Iniciantes', 'Defesa pessoal', 'Condicionamento', 'Lutadores am. e prof.'],
  cta: 'AGENDE PELO DIRECT',
  alt: 'ou WhatsApp (21) 97033-9422',
};

const chip = t => `<span class="chip">${t}</span>`;
const disc = C.disc.map(d => `<span>${d}</span>`).join('<i>·</i>');

const GRAIN = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${FONTCSS}
:root{
  --ink:#0A0A0B; --white:#fff;
  --red:#B11226; --red2:#7E0C18; --redhi:#E11D2E;
  --muted:rgba(245,244,242,.62); --muted2:rgba(245,244,242,.44);
  --line:rgba(245,244,242,.14);
  --disp:'Oswald','DIN Condensed',Impact,sans-serif;
  --body:'Inter',-apple-system,Helvetica,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;background:#000;overflow:hidden}
.poster{position:relative;width:1080px;height:1350px;background:var(--ink);
  font-family:var(--body);-webkit-font-smoothing:antialiased;overflow:hidden}
.edge{position:absolute;top:0;left:0;width:1080px;height:6px;
  background:linear-gradient(90deg,var(--red2),var(--red) 50%,var(--red2));z-index:9}

/* ---------- HERO PHOTO (big & clean) ---------- */
.hero{position:absolute;top:0;left:0;width:1080px;height:838px;overflow:hidden;background:#050505}
.hero__img{position:absolute;inset:0;
  background-image:url('${PHOTO}');background-size:134%;background-position:55% 18%;
  filter:grayscale(.14) contrast(1.08) brightness(1.0) saturate(.9)}
.hero__grade{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 13%),
  radial-gradient(135% 105% at 58% 36%,rgba(0,0,0,0) 60%,rgba(0,0,0,.32) 100%),
  linear-gradient(180deg,rgba(10,10,11,0) 64%,rgba(10,10,11,.72) 90%,var(--ink) 100%)}

/* top bar */
.bar{position:absolute;top:0;left:0;width:1080px;display:flex;justify-content:space-between;
  align-items:center;padding:34px 56px 0;z-index:6}
.lock{display:flex;align-items:center;gap:14px}
.mark{width:48px;height:48px;background:var(--red);display:flex;align-items:center;justify-content:center;
  font-family:var(--disp);font-weight:700;font-size:21px;color:#fff;letter-spacing:.02em;
  box-shadow:0 0 0 1px rgba(255,255,255,.12) inset}
.lock b{font-family:var(--disp);font-weight:600;font-size:19px;letter-spacing:.12em;color:#fff;line-height:1}
.lock small{display:block;font-family:var(--body);font-weight:500;font-size:10px;letter-spacing:.22em;
  color:rgba(255,255,255,.72);margin-top:5px}
.city{font-family:var(--body);font-weight:600;font-size:12px;letter-spacing:.24em;color:rgba(255,255,255,.85);
  text-transform:uppercase;display:flex;align-items:center;gap:9px}
.city::before{content:"";width:7px;height:7px;border:1.5px solid var(--red);transform:rotate(45deg)}

/* ---------- BODY PANEL (lean) ---------- */
.panel{position:absolute;top:838px;left:0;width:1080px;height:512px;background:var(--ink);
  padding:30px 56px 40px;display:flex;flex-direction:column}

.eyebrow{display:flex;align-items:center;gap:13px;font-family:var(--disp);font-weight:600;
  font-size:13.5px;letter-spacing:.22em;color:var(--redhi);text-transform:uppercase}
.eyebrow::before{content:"";width:26px;height:3px;background:var(--red)}

.h1{font-family:var(--disp);font-weight:700;text-transform:uppercase;color:var(--white);
  font-size:56px;line-height:.96;letter-spacing:-.004em;margin-top:12px}
.disc{font-family:var(--disp);font-weight:700;text-transform:uppercase;color:#fff;
  font-size:30px;letter-spacing:.015em;margin-top:7px;display:flex;align-items:center;flex-wrap:wrap;gap:0 4px}
.disc i{font-style:normal;color:var(--redhi);margin:0 9px}
.sub{font-family:var(--body);font-weight:400;font-size:20px;color:var(--muted);margin-top:14px}
.sub2{font-family:var(--disp);font-weight:500;font-size:14px;letter-spacing:.12em;color:var(--muted2);
  text-transform:uppercase;margin-top:7px}

.rule{height:1px;background:var(--line);margin:22px 0 20px}

.cols{display:flex;gap:44px}
.col{flex:1}
.lab{font-family:var(--disp);font-weight:600;font-size:12.5px;letter-spacing:.2em;color:var(--muted2);
  text-transform:uppercase;margin-bottom:11px;display:flex;align-items:center;gap:9px}
.lab::before{content:"";width:14px;height:2px;background:var(--red)}
.name{font-family:var(--disp);font-weight:700;font-size:27px;letter-spacing:.03em;color:#fff;
  text-transform:uppercase;line-height:1;margin-bottom:8px}
.role{font-family:var(--body);font-weight:400;font-size:15.5px;line-height:1.45;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-family:var(--body);font-weight:500;font-size:13.5px;color:rgba(245,244,242,.92);
  border:1px solid var(--line);padding:7px 12px;letter-spacing:.01em;background:rgba(255,255,255,.02)}

/* CTA */
.cta{margin-top:auto;padding-top:22px;border-top:1px solid var(--line)}
.btn{position:relative;width:100%;height:72px;background:linear-gradient(180deg,var(--redhi),var(--red) 55%,var(--red2));
  display:flex;align-items:center;justify-content:center;gap:15px;
  font-family:var(--disp);font-weight:700;font-size:26px;letter-spacing:.07em;color:#fff;text-transform:uppercase;
  box-shadow:0 14px 40px -12px rgba(177,18,38,.7),0 0 0 1px rgba(255,255,255,.08) inset}
.btn svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.9}
.alt{text-align:center;margin-top:13px;font-family:var(--body);font-weight:600;font-size:15px;
  letter-spacing:.04em;color:rgba(245,244,242,.66);text-transform:uppercase}

.grain{position:absolute;inset:0;background-image:url("${GRAIN}");background-size:200px;
  opacity:.05;mix-blend-mode:overlay;pointer-events:none;z-index:8}
</style></head><body>
<div class="poster">
  <div class="edge"></div>

  <div class="hero">
    <div class="hero__img"></div>
    <div class="hero__grade"></div>
  </div>

  <div class="bar">
    <div class="lock">
      <div class="mark">RFT</div>
      <div><b>${C.brandTop}</b><small>${C.brandSub}</small></div>
    </div>
    <div class="city">${C.city}</div>
  </div>

  <div class="panel">
    <div class="eyebrow">${C.eyebrow}</div>
    <h1 class="h1">${C.h1}</h1>
    <div class="disc">${disc}</div>
    <p class="sub">${C.sub}</p>
    <div class="sub2">${C.sub2}</div>

    <div class="rule"></div>

    <div class="cols">
      <div class="col">
        <div class="lab">SEU TREINADOR</div>
        <div class="name">${C.coachName}</div>
        <div class="role">${C.coachRole}</div>
      </div>
      <div class="col">
        <div class="lab">PARA QUEM É</div>
        <div class="chips">${C.forwho.map(chip).join('')}</div>
      </div>
    </div>

    <div class="cta">
      <div class="btn"><svg viewBox="0 0 24 24"><path d="M22 3 11 14"/><path d="M22 3l-7 18-4-8-8-4 19-6z"/></svg>${C.cta}</div>
      <div class="alt">${C.alt}</div>
    </div>
  </div>

  <div class="grain"></div>
</div>
</body></html>`;

fs.mkdirSync(path.join(DIR, 'slides'), { recursive: true });
fs.writeFileSync(path.join(DIR, 'slides', 'poster.html'), html);
console.log('wrote slides/poster.html  (' + (html.length / 1024).toFixed(0) + ' KB)');
