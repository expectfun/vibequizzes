const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('south-america-paths.json', 'utf8'));

const neighbors = {
  "Argentina": ["Chile", "Bolivia", "Paraguay", "Brazil", "Uruguay"],
  "Bolivia": ["Peru", "Brazil", "Paraguay", "Argentina", "Chile"],
  "Brazil": ["Venezuela", "Guyana", "Suriname", "French Guiana", "Colombia", "Peru", "Bolivia", "Paraguay", "Argentina", "Uruguay"],
  "Chile": ["Peru", "Bolivia", "Argentina"],
  "Colombia": ["Venezuela", "Brazil", "Peru", "Ecuador"],
  "Ecuador": ["Colombia", "Peru"],
  "French Guiana": ["Brazil", "Suriname"],
  "Guyana": ["Venezuela", "Brazil", "Suriname"],
  "Paraguay": ["Bolivia", "Brazil", "Argentina"],
  "Peru": ["Ecuador", "Colombia", "Brazil", "Bolivia", "Chile"],
  "Suriname": ["Guyana", "Brazil", "French Guiana"],
  "Uruguay": ["Brazil", "Argentina"],
  "Venezuela": ["Colombia", "Brazil", "Guyana"]
};

const COUNTRY_ALIASES = {
  "argentina": "Argentina", "аргентина": "Argentina",
  "bolivia": "Bolivia", "боливия": "Bolivia",
  "brazil": "Brazil", "brasil": "Brazil", "бразилия": "Brazil",
  "chile": "Chile", "чили": "Chile",
  "colombia": "Colombia", "колумбия": "Colombia",
  "ecuador": "Ecuador", "эквадор": "Ecuador",
  "french guiana": "French Guiana", "guyane": "French Guiana", "гвиана": "French Guiana", "французская гвиана": "French Guiana",
  "guyana": "Guyana", "гайана": "Guyana",
  "paraguay": "Paraguay", "парагвай": "Paraguay",
  "peru": "Peru", "перу": "Peru",
  "suriname": "Suriname", "суринам": "Suriname",
  "uruguay": "Uruguay", "уругвай": "Uruguay",
  "venezuela": "Venezuela", "венесуэла": "Venezuela"
};

const RUSSIAN_LABELS = {
  "Argentina": "Аргентина", "Bolivia": "Боливия", "Brazil": "Бразилия", "Chile": "Чили",
  "Colombia": "Колумбия", "Ecuador": "Эквадор", "French Guiana": "Гвиана", "Guyana": "Гайана",
  "Paraguay": "Парагвай", "Peru": "Перу", "Suriname": "Суринам", "Uruguay": "Уругвай", "Venezuela": "Венесуэла"
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slug(s) {
  return 'path-' + s.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

const areas = paths.map(p => p.area);
const minA = Math.min(...areas), maxA = Math.max(...areas);
function fontSize(area) {
  if (maxA === minA) return 8;
  const t = (area - minA) / (maxA - minA);
  return Math.round(6 + t * 4);
}

const svgPaths = paths.map(p => {
  const id = slug(p.name);
  const label = RUSSIAN_LABELS[p.name] || p.name;
  const fs = fontSize(p.area);
  return `<path id="${escapeHtml(id)}" class="country" data-country="${escapeHtml(p.name)}" d="${escapeHtml(p.pathD)}"/><text id="label-${escapeHtml(id)}" class="country-label" data-country="${escapeHtml(p.name)}" x="${p.labelX}" y="${p.labelY}" font-size="${fs}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(label)}</text>`;
}).join('\n    ');

const countriesList = paths.map(p => p.name);
const countriesJson = JSON.stringify(countriesList);
const aliasesJson = JSON.stringify(COUNTRY_ALIASES);
const neighborsJson = JSON.stringify(neighbors);

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Квиз: страны Южной Америки</title>
  <style>
    :root {
      --bg: #0a0a0f;
      --bg-soft: #12121a;
      --neon-named: #00f5ff;
      --neon-named-fill: rgba(0, 245, 255, 0.18);
      --neon-last: #ff00aa;
      --neon-last-fill: rgba(255, 0, 170, 0.25);
      --border-visible: rgba(255, 255, 255, 0.2);
      --text: #e0e0e8;
      --text-dim: #808098;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      max-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: 'Segoe UI', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      overflow: hidden;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; font-weight: 600; }
    .modes { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; justify-content: center; }
    .modes button {
      padding: 0.5rem 1rem;
      background: var(--bg-soft);
      border: 1px solid var(--border-visible);
      color: var(--text);
      cursor: pointer;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .modes button:hover { border-color: var(--neon-named); color: var(--neon-named); }
    .modes button.active {
      border-color: var(--neon-named);
      color: var(--neon-named);
      box-shadow: 0 0 12px rgba(0, 245, 255, 0.3);
    }
    .map-wrap {
      width: 100%;
      max-width: 900px;
      flex: 1 1 0;
      min-height: 0;
      background: var(--bg);
      border-radius: 12px;
      padding: 0.5rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .map-wrap svg {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      display: block;
    }
    .country {
      fill: var(--bg);
      stroke: none;
      transition: stroke 0.25s, filter 0.25s, fill 0.25s;
    }
    body.mode-1 .country { stroke: var(--border-visible); stroke-width: 0.5; }
    body.mode-2 .country { stroke: transparent; stroke-width: 0.5; }
    body.mode-2 .country.named { stroke: var(--neon-named); }
    body.mode-3 .country { stroke: var(--border-visible); stroke-width: 0.5; }
    .country.named {
      fill: var(--neon-named-fill);
      stroke: var(--neon-named);
      stroke-width: 1;
      filter: drop-shadow(0 0 6px var(--neon-named));
    }
    .country.last-named {
      fill: var(--neon-last-fill);
      stroke: var(--neon-last);
      stroke-width: 1.5;
      filter: drop-shadow(0 0 10px var(--neon-last)) drop-shadow(0 0 20px rgba(255, 0, 170, 0.4));
    }
    .country-label {
      display: none;
      pointer-events: none;
      fill: var(--neon-named);
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-weight: 600;
      transition: fill 0.2s;
    }
    .country-label.named { display: block; }
    .country-label.last-named { fill: var(--neon-last); }
    .input-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      max-width: 400px;
      width: 100%;
    }
    .input-row input {
      flex: 1;
      padding: 0.6rem 0.8rem;
      background: var(--bg-soft);
      border: 1px solid var(--border-visible);
      border-radius: 6px;
      color: var(--text);
      font-size: 1rem;
    }
    .input-row input:focus {
      outline: none;
      border-color: var(--neon-named);
      box-shadow: 0 0 8px rgba(0, 245, 255, 0.2);
    }
    .input-row button {
      padding: 0.6rem 1.2rem;
      background: var(--neon-named);
      color: var(--bg);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .input-row button:hover { filter: brightness(1.1); }
    #giveup-btn { background: transparent; color: var(--text-dim); border: 1px solid var(--border-visible); }
    #giveup-btn:hover { color: var(--neon-last); border-color: var(--neon-last); }
    .score { font-size: 1.1rem; margin-bottom: 0.25rem; color: var(--text-dim); }
    .message { min-height: 1.5em; color: var(--neon-named); font-size: 0.95rem; margin-top: 0.25rem; }
    .message.error { color: #ff6b6b; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  </style>
</head>
<body>
  <h1>Страны Южной Америки</h1>
  <div class="modes" role="group" aria-label="Режим игры">
    <button type="button" data-mode="1" class="active">По контуру</button>
    <button type="button" data-mode="2">Вслепую</button>
    <button type="button" data-mode="3">Цепочка соседей</button>
  </div>
  <label for="country-input" class="sr-only">Название страны</label>
  <div class="input-row">
    <input type="text" id="country-input" autocomplete="off" placeholder="Введите страну..." />
    <button type="button" id="submit-btn">Проверить</button>
    <button type="button" id="giveup-btn">Сдаться</button>
  </div>
  <div class="message" id="message" aria-live="polite"></div>
  <div class="score" aria-live="polite">0 / ${paths.length}</div>
  <div class="map-wrap">
    <svg viewBox="0 0 418 602" preserveAspectRatio="xMidYMid meet" aria-label="Карта Южной Америки">
    ${svgPaths}
    </svg>
  </div>
  <script>
(function() {
  const COUNTRIES = ${countriesJson};
  const ALIASES = ${aliasesJson};
  const NEIGHBORS = ${neighborsJson};

  function normalize(s) {
    return (s || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
  }

  function findCountry(input) {
    const n = normalize(input);
    if (!n) return null;
    if (ALIASES[n]) return ALIASES[n];
    const exact = COUNTRIES.find(c => normalize(c) === n);
    if (exact) return exact;
    return COUNTRIES.find(c => normalize(c).indexOf(n) === 0 || n.indexOf(normalize(c)) === 0) || null;
  }

  let state = { named: new Set(), lastNamed: null, mode: 1 };

  const body = document.body;
  const input = document.getElementById('country-input');
  const submitBtn = document.getElementById('submit-btn');
  const giveupBtn = document.getElementById('giveup-btn');
  const scoreEl = document.querySelector('.score');
  const messageEl = document.getElementById('message');

  function setMessage(text, isError) {
    messageEl.textContent = text;
    messageEl.classList.toggle('error', !!isError);
  }

  function pathId(name) {
    return 'path-' + name.replace(/\\s+/g, '-').replace(/[^\\w-]/g, '');
  }

  function updateMap() {
    COUNTRIES.forEach(name => {
      const pid = pathId(name);
      const el = document.getElementById(pid);
      const labelEl = document.getElementById('label-' + pid);
      if (el) {
        el.classList.remove('named', 'last-named');
        if (state.named.has(name)) {
          el.classList.add('named');
          if (name === state.lastNamed) el.classList.add('last-named');
        }
      }
      if (labelEl) {
        labelEl.classList.remove('named', 'last-named');
        if (state.named.has(name)) {
          labelEl.classList.add('named');
          if (name === state.lastNamed) labelEl.classList.add('last-named');
        }
      }
    });
    const total = COUNTRIES.length;
    scoreEl.textContent = state.named.size + ' / ' + total;
  }

  function setMode(mode) {
    state.mode = mode;
    state.named = new Set();
    state.lastNamed = null;
    body.className = 'mode-' + mode;
    document.querySelectorAll('.modes button').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.mode, 10) === mode);
    });
    updateMap();
    setMessage(mode === 3 ? 'Назовите любую страну Южной Америки для старта' : '');
    input.focus();
  }

  function submit() {
    const raw = input.value.trim();
    if (!raw) return;
    const country = findCountry(raw);
    if (!country) {
      setMessage('Неверная или неизвестная страна', true);
      return;
    }
    if (state.mode === 3) {
      if (state.named.size === 0) {
        state.named.add(country);
        state.lastNamed = country;
        setMessage('Теперь назовите страну, граничащую с ' + country);
      } else {
        const adj = NEIGHBORS[state.lastNamed];
        if (!adj || !adj.includes(country)) {
          setMessage('Должна граничить с ' + state.lastNamed, true);
          return;
        }
        if (state.named.has(country)) {
          setMessage('Уже названа', true);
          return;
        }
        state.named.add(country);
        state.lastNamed = country;
        setMessage('Верно! Следующая должна граничить с ' + country);
      }
    } else {
      if (state.named.has(country)) {
        setMessage('Уже названа', true);
        return;
      }
      state.named.add(country);
      state.lastNamed = country;
      setMessage('Верно!');
    }
    input.value = '';
    updateMap();
    input.focus();
  }

  document.querySelectorAll('.modes button').forEach(btn => {
    btn.addEventListener('click', () => setMode(parseInt(btn.dataset.mode, 10)));
  });
  submitBtn.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
  giveupBtn.addEventListener('click', function giveUp() {
    state.named = new Set(COUNTRIES);
    state.lastNamed = null;
    updateMap();
    setMessage('Все страны открыты');
    input.disabled = true;
    submitBtn.disabled = true;
    giveupBtn.disabled = true;
  });

  body.className = 'mode-1';
  updateMap();
})();
  </script>
</body>
</html>
`;

fs.writeFileSync('south-america.html', html, 'utf8');
console.log('Wrote south-america.html');
