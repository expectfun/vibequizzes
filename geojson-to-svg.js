const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ne_110m_admin_0_countries.geojson', 'utf8'));

const africa = data.features.filter(f => f.properties.CONTINENT === 'Africa');

// Africa bbox: lon -18 to 52 (70), lat -35 to 37 (72) — один масштаб по осям, чтобы не растягивать
const xMin = -18, xMax = 52, yMin = -35, yMax = 37;
const xRange = xMax - xMin, yRange = yMax - yMin;
const scale = 520 / yRange; // высота 520, ширина по пропорции
const width = Math.round(xRange * scale), height = 520;

function project(lon, lat) {
  const x = (lon - xMin) * scale;
  const y = height - (lat - yMin) * scale;
  return [x, y];
}

function ringToPath(ring) {
  return ring.map((p, i) => (i === 0 ? 'M' : 'L') + project(p[0], p[1]).join(',')).join(' ') + ' Z';
}

function geomToPath(geom) {
  if (geom.type === 'Polygon') {
    return geom.coordinates.map((ring, i) => ringToPath(ring)).join(' ');
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map(poly => poly.map(ring => ringToPath(ring)).join(' ')).join(' ');
  }
  return '';
}

// Shoelace area from projected ring (first ring only for simplicity)
function ringArea(ring) {
  let area = 0;
  const n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = project(ring[i][0], ring[i][1]);
    const [x1, y1] = project(ring[(i + 1) % n][0], ring[(i + 1) % n][1]);
    area += x0 * y1 - x1 * y0;
  }
  return Math.abs(area) / 2;
}

function geomArea(geom) {
  if (geom.type === 'Polygon') return ringArea(geom.coordinates[0]);
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.reduce((sum, poly) => sum + ringArea(poly[0]), 0);
  }
  return 0;
}

function firstRingCenter(geom) {
  let ring;
  if (geom.type === 'Polygon') ring = geom.coordinates[0];
  else if (geom.type === 'MultiPolygon') ring = geom.coordinates[0][0];
  else return [0, 0];
  let sx = 0, sy = 0, n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return [sx / n, sy / n];
}

const out = africa.map(f => {
  const name = f.properties.ADMIN;
  const pathD = geomToPath(f.geometry);
  const props = f.properties;
  const lon = props.LABEL_X != null ? props.LABEL_X : firstRingCenter(f.geometry)[0];
  const lat = props.LABEL_Y != null ? props.LABEL_Y : firstRingCenter(f.geometry)[1];
  const [labelX, labelY] = project(lon, lat);
  const area = geomArea(f.geometry);
  return { name, pathD, labelX, labelY, area };
});

console.log(JSON.stringify(out, null, 0));
