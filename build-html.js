const fs = require('fs');
const paths = JSON.parse(fs.readFileSync('africa-paths.json', 'utf8'));

// Neighbors: country -> array of neighbor names (land borders, Africa only)
const neighbors = {
  "Algeria": ["Tunisia", "Libya", "Niger", "Mali", "Mauritania", "Western Sahara", "Morocco"],
  "Angola": ["Republic of the Congo", "Democratic Republic of the Congo", "Zambia", "Namibia"],
  "Benin": ["Togo", "Nigeria", "Burkina Faso", "Niger"],
  "Botswana": ["South Africa", "Namibia", "Zambia", "Zimbabwe"],
  "Burkina Faso": ["Mali", "Niger", "Benin", "Togo", "Ghana", "Ivory Coast"],
  "Burundi": ["Rwanda", "United Republic of Tanzania", "Democratic Republic of the Congo"],
  "Cameroon": ["Nigeria", "Chad", "Central African Republic", "Republic of the Congo", "Equatorial Guinea", "Gabon"],
  "Central African Republic": ["Chad", "Sudan", "South Sudan", "Democratic Republic of the Congo", "Republic of the Congo", "Cameroon"],
  "Chad": ["Libya", "Sudan", "Central African Republic", "Cameroon", "Nigeria", "Niger"],
  "Democratic Republic of the Congo": ["Republic of the Congo", "Central African Republic", "South Sudan", "Uganda", "Rwanda", "Burundi", "United Republic of Tanzania", "Zambia", "Angola"],
  "Djibouti": ["Eritrea", "Ethiopia", "Somalia"],
  "Egypt": ["Libya", "Sudan"],
  "Equatorial Guinea": ["Cameroon", "Gabon"],
  "Eritrea": ["Sudan", "Ethiopia", "Djibouti"],
  "Ethiopia": ["Eritrea", "Djibouti", "Somalia", "Kenya", "South Sudan", "Sudan"],
  "Gabon": ["Equatorial Guinea", "Cameroon", "Republic of the Congo"],
  "Gambia": ["Senegal"],
  "Ghana": ["Ivory Coast", "Burkina Faso", "Togo"],
  "Guinea": ["Guinea-Bissau", "Senegal", "Mali", "Ivory Coast", "Liberia", "Sierra Leone"],
  "Guinea-Bissau": ["Senegal", "Guinea"],
  "Ivory Coast": ["Liberia", "Guinea", "Mali", "Burkina Faso", "Ghana"],
  "Kenya": ["Ethiopia", "Somalia", "United Republic of Tanzania", "Uganda", "South Sudan"],
  "Lesotho": ["South Africa"],
  "Liberia": ["Sierra Leone", "Guinea", "Ivory Coast"],
  "Libya": ["Tunisia", "Algeria", "Niger", "Chad", "Sudan", "Egypt"],
  "Madagascar": [],
  "Malawi": ["United Republic of Tanzania", "Mozambique", "Zambia"],
  "Mali": ["Algeria", "Niger", "Burkina Faso", "Ivory Coast", "Guinea", "Senegal", "Mauritania"],
  "Mauritania": ["Western Sahara", "Algeria", "Mali", "Senegal"],
  "Morocco": ["Algeria", "Western Sahara"],
  "Mozambique": ["United Republic of Tanzania", "Malawi", "Zambia", "Zimbabwe", "South Africa", "eSwatini"],
  "Namibia": ["Angola", "Zambia", "Botswana", "South Africa"],
  "Niger": ["Algeria", "Libya", "Chad", "Nigeria", "Benin", "Burkina Faso", "Mali"],
  "Nigeria": ["Niger", "Chad", "Cameroon", "Benin"],
  "Republic of the Congo": ["Cameroon", "Central African Republic", "Democratic Republic of the Congo", "Angola", "Gabon"],
  "Rwanda": ["Uganda", "United Republic of Tanzania", "Burundi", "Democratic Republic of the Congo"],
  "Senegal": ["Mauritania", "Mali", "Guinea", "Guinea-Bissau", "Gambia"],
  "Sierra Leone": ["Guinea", "Liberia"],
  "Somalia": ["Djibouti", "Ethiopia", "Kenya"],
  "Somaliland": ["Djibouti", "Ethiopia", "Kenya"],
  "South Africa": ["Namibia", "Botswana", "Zimbabwe", "Mozambique", "eSwatini", "Lesotho"],
  "South Sudan": ["Sudan", "Ethiopia", "Kenya", "Uganda", "Democratic Republic of the Congo", "Central African Republic"],
  "Sudan": ["Egypt", "Eritrea", "Ethiopia", "South Sudan", "Central African Republic", "Chad", "Libya"],
  "Togo": ["Burkina Faso", "Benin", "Ghana"],
  "Tunisia": ["Libya", "Algeria"],
  "Uganda": ["South Sudan", "Kenya", "United Republic of Tanzania", "Rwanda", "Democratic Republic of the Congo"],
  "United Republic of Tanzania": ["Kenya", "Uganda", "Rwanda", "Burundi", "Democratic Republic of the Congo", "Zambia", "Malawi", "Mozambique"],
  "Western Sahara": ["Morocco", "Mauritania", "Algeria"],
  "Zambia": ["Democratic Republic of the Congo", "United Republic of Tanzania", "Malawi", "Mozambique", "Zimbabwe", "Botswana", "Namibia", "Angola"],
  "Zimbabwe": ["Zambia", "South Africa", "Botswana", "Mozambique"],
  "eSwatini": ["South Africa", "Mozambique"]
};

const COUNTRY_ALIASES = {
  "drc": "Democratic Republic of the Congo",
  "congo kinshasa": "Democratic Republic of the Congo",
  "congo (kinshasa)": "Democratic Republic of the Congo",
  "drc congo": "Democratic Republic of the Congo",
  "tanzania": "United Republic of Tanzania",
  "congo": "Republic of the Congo",
  "congo brazzaville": "Republic of the Congo",
  "republic of congo": "Republic of the Congo",
  "ivory coast": "Ivory Coast",
  "cote divoire": "Ivory Coast",
  "côte d'ivoire": "Ivory Coast",
  "swaziland": "eSwatini",
  "eswatini": "eSwatini",
  "gambia": "Gambia",
  "the gambia": "Gambia",
  "car": "Central African Republic",
  "central african rep": "Central African Republic",
  "eq guinea": "Equatorial Guinea",
  "equatorial guinea": "Equatorial Guinea",
  "guinea bissau": "Guinea-Bissau",
  "guinea-bissau": "Guinea-Bissau",
  "south sudan": "South Sudan",
  "western sahara": "Western Sahara",
  "sahara": "Western Sahara"
};

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slug(s) {
  return 'path-' + s.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// Short labels for long names (shown on map to fit small countries)
const SHORT_LABELS = {
  'Democratic Republic of the Congo': 'D.R. Congo',
  'United Republic of Tanzania': 'Tanzania',
  'Central African Republic': 'C.A.R.',
  'Equatorial Guinea': 'Eq. Guinea',
  'Western Sahara': 'W. Sahara',
  'Guinea-Bissau': 'G.-Bissau',
  'eSwatini': 'Eswatini'
};

const areas = paths.map(p => p.area);
const minA = Math.min(...areas), maxA = Math.max(...areas);
function fontSize(area) {
  if (maxA === minA) return 8;
  const t = (area - minA) / (maxA - minA);
  return Math.round(6 + t * 4); // 6–10
}

const svgPaths = paths.map(p => {
  const id = slug(p.name);
  const label = SHORT_LABELS[p.name] || p.name;
  const fs = fontSize(p.area);
  return `<path id="${escapeHtml(id)}" class="country" data-country="${escapeHtml(p.name)}" d="${escapeHtml(p.pathD)}"/><text id="label-${escapeHtml(id)}" class="country-label" data-country="${escapeHtml(p.name)}" x="${p.labelX}" y="${p.labelY}" font-size="${fs}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(label)}</text>`;
}).join('\n    ');

const countriesList = paths.map(p => p.name);
const countriesJson = JSON.stringify(countriesList);
const aliasesJson = JSON.stringify(COUNTRY_ALIASES);
const neighborsJson = JSON.stringify(neighbors);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Africa Countries Quiz</title>
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
    .modes {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }
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
    .country-label.named { fill: var(--neon-named); }
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
  <h1>Africa Countries</h1>
  <div class="modes" role="group" aria-label="Game mode">
    <button type="button" data-mode="1" class="active">By outline</button>
    <button type="button" data-mode="2">Blind</button>
    <button type="button" data-mode="3">Neighbor chain</button>
  </div>
  <label for="country-input" class="sr-only">Country name</label>
  <div class="input-row">
    <input type="text" id="country-input" autocomplete="off" placeholder="Enter country..." />
    <button type="button" id="submit-btn">Check</button>
    <button type="button" id="giveup-btn">Give up</button>
  </div>
  <div class="message" id="message" aria-live="polite"></div>
  <div class="score" aria-live="polite">0 / ${paths.length}</div>
  <div class="map-wrap">
    <svg viewBox="-4 -8 514 536" preserveAspectRatio="xMidYMid meet" aria-label="Africa map">
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
    setMessage(mode === 3 ? 'Name any African country to start' : '');
    input.focus();
  }

  function submit() {
    const raw = input.value.trim();
    if (!raw) return;
    const country = findCountry(raw);
    if (!country) {
      setMessage('Wrong or unknown country', true);
      return;
    }
    if (state.mode === 3) {
      if (state.named.size === 0) {
        state.named.add(country);
        state.lastNamed = country;
        setMessage('Now name a country that borders ' + country);
      } else {
        const adj = NEIGHBORS[state.lastNamed];
        if (!adj || !adj.includes(country)) {
          setMessage('Must border ' + state.lastNamed, true);
          return;
        }
        if (state.named.has(country)) {
          setMessage('Already named', true);
          return;
        }
        state.named.add(country);
        state.lastNamed = country;
        setMessage('Correct! Next must border ' + country);
      }
    } else {
      if (state.named.has(country)) {
        setMessage('Already named', true);
        return;
      }
      state.named.add(country);
      state.lastNamed = country;
      setMessage('Correct!');
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
    setMessage('All countries revealed');
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

fs.writeFileSync('index.html', html, 'utf8');
console.log('Wrote index.html');
