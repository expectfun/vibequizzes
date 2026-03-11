const fs = require('fs');
const data = JSON.parse(fs.readFileSync('ne_110m_admin_0_countries.geojson', 'utf8'));

const southAmerica = data.features.filter(f => f.properties.CONTINENT === 'South America');
// Исключаем Фолклендские о-ва для квиза по странам; bbox: lon -82..-34, lat -56..13
const xMin = -82, xMax = -34, yMin = -56, yMax = 13;
const yRange = yMax - yMin;
const scale = 602 / yRange;
const width = Math.round((xMax - xMin) * scale), height = 602;

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
    return geom.coordinates.map((ring) => ringToPath(ring)).join(' ');
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map(poly => poly.map(ring => ringToPath(ring)).join(' ')).join(' ');
  }
  return '';
}

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

// Французская Гвиана — часть геометрии Франции (второй полигон в MultiPolygon)
function extractFrenchGuiana() {
  const fr = data.features.find(f => f.properties.ADMIN === 'France');
  if (!fr || fr.geometry.type !== 'MultiPolygon') return null;
  const polys = fr.geometry.coordinates;
  for (let i = 0; i < polys.length; i++) {
    const ring = polys[i][0];
    const lons = ring.map(p => p[0]), lats = ring.map(p => p[1]);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons), minLat = Math.min(...lats), maxLat = Math.max(...lats);
    if (minLon > -60 && maxLon < -50 && minLat > 0 && maxLat < 10) {
      const geom = { type: 'Polygon', coordinates: polys[i] };
      const pathD = geomToPath(geom);
      const [labelX, labelY] = project((minLon + maxLon) / 2, (minLat + maxLat) / 2);
      return { name: 'French Guiana', pathD, labelX, labelY, area: geomArea(geom) };
    }
  }
  return null;
}

const exclude = ['Falkland Islands'];
let out = southAmerica
  .filter(f => !exclude.includes(f.properties.ADMIN))
  .map(f => {
    const name = f.properties.ADMIN;
    const pathD = geomToPath(f.geometry);
    const lon = f.properties.LABEL_X != null ? f.properties.LABEL_X : firstRingCenter(f.geometry)[0];
    const lat = f.properties.LABEL_Y != null ? f.properties.LABEL_Y : firstRingCenter(f.geometry)[1];
    const [labelX, labelY] = project(lon, lat);
    const area = geomArea(f.geometry);
    return { name, pathD, labelX, labelY, area };
  });

const fg = extractFrenchGuiana();
if (fg) out.push(fg);

console.log(JSON.stringify(out, null, 0));
