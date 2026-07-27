import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MAP_BOUNDS = {
  west: 120.5585,
  south: 31.326,
  east: 120.579,
  north: 31.34,
}

const EXTRACT_BOUNDS = {
  west: 120.557,
  south: 31.326,
  east: 120.579,
  north: 31.34,
}

const OVERPASS_QUERY = `[out:json][timeout:90][maxsize:268435456];
(
  way["highway"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["building"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["landuse"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["natural"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["leisure"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["water"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  way["waterway"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
  nwr["name"](${EXTRACT_BOUNDS.south},${EXTRACT_BOUNDS.west},${EXTRACT_BOUNDS.north},${EXTRACT_BOUNDS.east});
);
out geom;`

const PLOT = { x: 0, y: 82, width: 440, height: 350 }
const B3_GCJ02 = { lon: 120.569443, lat: 31.330254 }
const WEDDING_CITY_OSM_ID = 743529574

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const defaultOutput = path.resolve(scriptDirectory, '../src/assets/huqiu-map-data.ts')
const inputPath = process.argv[2]
const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : defaultOutput

if (!inputPath) {
  throw new Error('Usage: node scripts/generate-huqiu-map.mjs <overpass-json> [output-ts]')
}

const overpass = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'))
const elements = overpass.elements ?? []
const elementById = new Map(elements.map((element) => [`${element.type}/${element.id}`, element]))

function transformLatitude(x, y) {
  let value = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y
  value += 0.2 * Math.sqrt(Math.abs(x))
  value += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  value += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3
  value += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3
  return value
}

function transformLongitude(x, y) {
  let value = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y
  value += 0.1 * Math.sqrt(Math.abs(x))
  value += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3
  value += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3
  value += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3
  return value
}

function wgs84ToGcj02(lon, lat) {
  const axis = 6378245
  const eccentricity = 0.006693421622965943
  const deltaLat = transformLatitude(lon - 105, lat - 35)
  const deltaLon = transformLongitude(lon - 105, lat - 35)
  const latitudeRadians = (lat / 180) * Math.PI
  const magic = 1 - eccentricity * Math.sin(latitudeRadians) ** 2
  const sqrtMagic = Math.sqrt(magic)
  const adjustedLat =
    (deltaLat * 180) / (((axis * (1 - eccentricity)) / (magic * sqrtMagic)) * Math.PI)
  const adjustedLon = (deltaLon * 180) / ((axis / sqrtMagic) * Math.cos(latitudeRadians) * Math.PI)
  return { lon: lon + adjustedLon, lat: lat + adjustedLat }
}

function gcj02ToWgs84(lon, lat) {
  let estimate = { lon, lat }
  for (let iteration = 0; iteration < 8; iteration += 1) {
    const converted = wgs84ToGcj02(estimate.lon, estimate.lat)
    estimate = {
      lon: estimate.lon + lon - converted.lon,
      lat: estimate.lat + lat - converted.lat,
    }
  }
  return estimate
}

const b3Wgs84 = gcj02ToWgs84(B3_GCJ02.lon, B3_GCJ02.lat)

function mercator(lon, lat) {
  const latitude = Math.min(85.05112878, Math.max(-85.05112878, lat))
  return {
    x: (lon * Math.PI) / 180,
    y: Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)),
  }
}

const projectedSouthWest = mercator(MAP_BOUNDS.west, MAP_BOUNDS.south)
const projectedNorthEast = mercator(MAP_BOUNDS.east, MAP_BOUNDS.north)

function round(value, precision = 1) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function project(point) {
  const projected = mercator(point.lon, point.lat)
  return {
    x: round(
      PLOT.x +
        ((projected.x - projectedSouthWest.x) / (projectedNorthEast.x - projectedSouthWest.x)) *
          PLOT.width,
    ),
    y: round(
      PLOT.y +
        ((projectedNorthEast.y - projected.y) / (projectedNorthEast.y - projectedSouthWest.y)) *
          PLOT.height,
    ),
  }
}

function geometryBounds(geometry) {
  const longitudes = geometry.map((point) => point.lon)
  const latitudes = geometry.map((point) => point.lat)
  return {
    minlon: Math.min(...longitudes),
    minlat: Math.min(...latitudes),
    maxlon: Math.max(...longitudes),
    maxlat: Math.max(...latitudes),
  }
}

function intersectsViewport(bounds) {
  return (
    bounds &&
    bounds.minlon <= MAP_BOUNDS.east &&
    bounds.maxlon >= MAP_BOUNDS.west &&
    bounds.minlat <= MAP_BOUNDS.north &&
    bounds.maxlat >= MAP_BOUNDS.south
  )
}

function clipPolygon(points) {
  const edges = [
    {
      inside: (point) => point.lon >= MAP_BOUNDS.west,
      intersect: (start, end) => {
        const ratio = (MAP_BOUNDS.west - start.lon) / (end.lon - start.lon)
        return { lon: MAP_BOUNDS.west, lat: start.lat + ratio * (end.lat - start.lat) }
      },
    },
    {
      inside: (point) => point.lon <= MAP_BOUNDS.east,
      intersect: (start, end) => {
        const ratio = (MAP_BOUNDS.east - start.lon) / (end.lon - start.lon)
        return { lon: MAP_BOUNDS.east, lat: start.lat + ratio * (end.lat - start.lat) }
      },
    },
    {
      inside: (point) => point.lat >= MAP_BOUNDS.south,
      intersect: (start, end) => {
        const ratio = (MAP_BOUNDS.south - start.lat) / (end.lat - start.lat)
        return { lon: start.lon + ratio * (end.lon - start.lon), lat: MAP_BOUNDS.south }
      },
    },
    {
      inside: (point) => point.lat <= MAP_BOUNDS.north,
      intersect: (start, end) => {
        const ratio = (MAP_BOUNDS.north - start.lat) / (end.lat - start.lat)
        return { lon: start.lon + ratio * (end.lon - start.lon), lat: MAP_BOUNDS.north }
      },
    },
  ]

  let output = points
  for (const edge of edges) {
    const input = output
    output = []
    if (!input.length) break

    let start = input.at(-1)
    for (const end of input) {
      if (edge.inside(end)) {
        if (!edge.inside(start)) output.push(edge.intersect(start, end))
        output.push(end)
      } else if (edge.inside(start)) {
        output.push(edge.intersect(start, end))
      }
      start = end
    }
  }
  return output
}

function clipSegment(start, end) {
  const deltaLon = end.lon - start.lon
  const deltaLat = end.lat - start.lat
  const p = [-deltaLon, deltaLon, -deltaLat, deltaLat]
  const q = [
    start.lon - MAP_BOUNDS.west,
    MAP_BOUNDS.east - start.lon,
    start.lat - MAP_BOUNDS.south,
    MAP_BOUNDS.north - start.lat,
  ]
  let minimum = 0
  let maximum = 1

  for (let index = 0; index < 4; index += 1) {
    if (p[index] === 0 && q[index] < 0) return null
    if (p[index] === 0) continue
    const ratio = q[index] / p[index]
    if (p[index] < 0) minimum = Math.max(minimum, ratio)
    else maximum = Math.min(maximum, ratio)
    if (minimum > maximum) return null
  }

  return [
    { lon: start.lon + minimum * deltaLon, lat: start.lat + minimum * deltaLat },
    { lon: start.lon + maximum * deltaLon, lat: start.lat + maximum * deltaLat },
  ]
}

function clipLineString(points) {
  const paths = []
  let current = []

  for (let index = 1; index < points.length; index += 1) {
    const segment = clipSegment(points[index - 1], points[index])
    if (!segment) {
      if (current.length > 1) paths.push(current)
      current = []
      continue
    }

    const [start, end] = segment
    const previous = current.at(-1)
    if (
      !previous ||
      Math.abs(previous.lon - start.lon) > 1e-9 ||
      Math.abs(previous.lat - start.lat) > 1e-9
    ) {
      if (current.length > 1) paths.push(current)
      current = [start]
    }
    current.push(end)
  }
  if (current.length > 1) paths.push(current)
  return paths
}

function polygonPath(geometry) {
  const clipped = clipPolygon(geometry)
  if (clipped.length < 3) return ''
  const projected = clipped.map(project)
  return `${projected
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join('')}Z`
}

function linePath(geometry) {
  return clipLineString(geometry)
    .map((line) =>
      line
        .map((point, index) => {
          const projected = project(point)
          return `${index === 0 ? 'M' : 'L'}${projected.x} ${projected.y}`
        })
        .join(''),
    )
    .join('')
}

function centroid(geometry) {
  const points = geometry.at(0)?.lon === geometry.at(-1)?.lon ? geometry.slice(0, -1) : geometry
  const sum = points.reduce(
    (result, point) => ({ lon: result.lon + point.lon, lat: result.lat + point.lat }),
    { lon: 0, lat: 0 },
  )
  return { lon: sum.lon / points.length, lat: sum.lat / points.length }
}

function pointInPolygon(point, polygon) {
  let inside = false
  for (
    let current = 0, previous = polygon.length - 1;
    current < polygon.length;
    previous = current, current += 1
  ) {
    const a = polygon[current]
    const b = polygon[previous]
    const crosses =
      a.lat > point.lat !== b.lat > point.lat &&
      point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon
    if (crosses) inside = !inside
  }
  return inside
}

function distanceInMeters(first, second) {
  const radians = (degrees) => (degrees * Math.PI) / 180
  const meanLatitude = radians((first.lat + second.lat) / 2)
  const x = radians(second.lon - first.lon) * Math.cos(meanLatitude)
  const y = radians(second.lat - first.lat)
  return Math.sqrt(x * x + y * y) * 6371008.8
}

const layerPaths = {
  landuse: [],
  green: [],
  scenic: [],
  water: [],
  buildings: [],
  weddingCity: [],
  roadTrunk: [],
  roadPrimary: [],
  roadSecondary: [],
  roadTertiary: [],
  roadMinor: [],
  footways: [],
  railway: [],
  subway: [],
  waterway: [],
}

const layerIds = Object.fromEntries(Object.keys(layerPaths).map((key) => [key, new Set()]))

function addPath(layer, element, pathData) {
  if (!pathData) return
  layerPaths[layer].push(pathData)
  layerIds[layer].add(element.id)
}

function roadLayer(highway) {
  if (['motorway', 'trunk', 'trunk_link', 'motorway_link'].includes(highway)) return 'roadTrunk'
  if (['primary', 'primary_link'].includes(highway)) return 'roadPrimary'
  if (['secondary', 'secondary_link'].includes(highway)) return 'roadSecondary'
  if (['tertiary', 'tertiary_link'].includes(highway)) return 'roadTertiary'
  if (['footway', 'path', 'pedestrian', 'steps'].includes(highway)) return 'footways'
  return 'roadMinor'
}

for (const element of elements) {
  if (element.type !== 'way' || !element.geometry?.length) continue
  const bounds = element.bounds ?? geometryBounds(element.geometry)
  if (!intersectsViewport(bounds)) continue

  const tags = element.tags ?? {}
  const closed =
    element.geometry.length > 3 &&
    element.geometry[0].lon === element.geometry.at(-1).lon &&
    element.geometry[0].lat === element.geometry.at(-1).lat

  if (closed) {
    const pathData = polygonPath(element.geometry)
    if (element.id === WEDDING_CITY_OSM_ID) addPath('weddingCity', element, pathData)
    else if (tags.building) addPath('buildings', element, pathData)
    else if (tags.natural === 'water' || tags.water) addPath('water', element, pathData)
    else if (tags.tourism === 'attraction' || tags.name === '虎丘山风景区') {
      addPath('scenic', element, pathData)
    } else if (
      ['park', 'garden', 'nature_reserve'].includes(tags.leisure) ||
      ['forest', 'grass', 'meadow', 'recreation_ground'].includes(tags.landuse) ||
      ['wood', 'scrub', 'grassland'].includes(tags.natural)
    ) {
      addPath('green', element, pathData)
    } else if (tags.landuse || tags.leisure || tags.natural) {
      addPath('landuse', element, pathData)
    }
  }

  if (tags.highway) addPath(roadLayer(tags.highway), element, linePath(element.geometry))
  if (tags.railway === 'subway') addPath('subway', element, linePath(element.geometry))
  else if (tags.railway) addPath('railway', element, linePath(element.geometry))
  if (tags.waterway) addPath('waterway', element, linePath(element.geometry))
}

const weddingCity = elementById.get(`way/${WEDDING_CITY_OSM_ID}`)
const scenicArea = elementById.get('way/161416532')
const tower = elementById.get('way/206069300')
const huqiuStation = elementById.get('node/6172569926')
const jinjidunStation = elementById.get('node/12074652910')

for (const [label, element] of [
  ['虎丘婚纱城', weddingCity],
  ['虎丘山风景区', scenicArea],
  ['虎丘塔', tower],
  ['虎丘站', huqiuStation],
  ['金鸡墩站', jinjidunStation],
]) {
  if (!element) throw new Error(`Required OSM anchor missing: ${label}`)
}

const buildingElements = elements.filter(
  (element) => element.type === 'way' && element.tags?.building && element.geometry?.length,
)
const containingBuildings = buildingElements.filter((element) =>
  pointInPolygon(b3Wgs84, element.geometry),
)
const nearestBuilding = buildingElements
  .map((element) => ({
    id: element.id,
    distance: distanceInMeters(b3Wgs84, centroid(element.geometry)),
  }))
  .sort((first, second) => first.distance - second.distance)[0]

const weddingCityCenter = centroid(weddingCity.geometry)
const scenicAreaCenter = centroid(scenicArea.geometry)
const towerCenter = centroid(tower.geometry)

const mapData = {
  viewBox: '0 0 440 520',
  plot: PLOT,
  bounds: MAP_BOUNDS,
  source: {
    dataset: 'OpenStreetMap',
    license: 'ODbL 1.0',
    attribution: '© OpenStreetMap contributors',
    attributionUrl: 'https://www.openstreetmap.org/copyright',
    snapshot: overpass.osm3s?.timestamp_osm_base ?? 'unknown',
    extractBounds: EXTRACT_BOUNDS,
    query: OVERPASS_QUERY,
    crs: 'EPSG:4326 (WGS 84)',
    projection: 'Web Mercator fitted to the local viewport',
    method: 'Overpass API vector extract rendered as a local static SVG',
    featureCounts: Object.fromEntries(
      Object.entries(layerIds).map(([key, identifiers]) => [key, identifiers.size]),
    ),
  },
  b3: {
    gcj02: { lon: B3_GCJ02.lon, lat: B3_GCJ02.lat },
    wgs84: { lon: round(b3Wgs84.lon, 7), lat: round(b3Wgs84.lat, 7) },
    conversion: 'Iterative GCJ-02 to WGS 84 alignment for the OSM geometry',
    withinWeddingCityAoi: pointInPolygon(b3Wgs84, weddingCity.geometry),
    containingBuildingIds: containingBuildings.map((element) => element.id),
    nearestBuilding: nearestBuilding
      ? { id: nearestBuilding.id, centroidDistanceMeters: round(nearestBuilding.distance) }
      : null,
  },
  paths: Object.fromEntries(
    Object.entries(layerPaths).map(([key, paths]) => [key, paths.join('')]),
  ),
  points: {
    b3: { ...project(b3Wgs84), source: 'verified GCJ-02 POI coordinate' },
    weddingCity: {
      ...project(weddingCityCenter),
      source: `OpenStreetMap way/${WEDDING_CITY_OSM_ID}`,
    },
    scenicArea: { ...project(scenicAreaCenter), source: 'OpenStreetMap way/161416532' },
    tower: { ...project(towerCenter), source: 'OpenStreetMap way/206069300' },
    huqiuStation: {
      ...project({ lon: huqiuStation.lon, lat: huqiuStation.lat }),
      source: 'OpenStreetMap node/6172569926',
    },
    jinjidunStation: {
      ...project({ lon: jinjidunStation.lon, lat: jinjidunStation.lat }),
      source: 'OpenStreetMap node/12074652910',
    },
  },
  labels: {
    huchiRoad: { ...project({ lon: 120.5714, lat: 31.33182 }), rotate: -2 },
    hujinRoad: { ...project({ lon: 120.57012, lat: 31.33515 }), rotate: -79 },
    huqiuWestRoad: { ...project({ lon: 120.5682, lat: 31.33455 }), rotate: -1 },
    northRingWestRoad: { ...project({ lon: 120.5741, lat: 31.32715 }), rotate: -7 },
    shantangStreet: { ...project({ lon: 120.57345, lat: 31.33665 }), rotate: -78 },
  },
  scaleBar: {
    meters: 250,
    pixels: round(
      (250 /
        distanceInMeters(
          { lon: MAP_BOUNDS.west, lat: (MAP_BOUNDS.south + MAP_BOUNDS.north) / 2 },
          { lon: MAP_BOUNDS.east, lat: (MAP_BOUNDS.south + MAP_BOUNDS.north) / 2 },
        )) *
        PLOT.width,
    ),
  },
}

const output = `// Generated from an OpenStreetMap Overpass extract. Run scripts/generate-huqiu-map.mjs to refresh.\n\nconst huqiuMapData = ${JSON.stringify(mapData, null, 2)} as const\n\nexport default huqiuMapData\n`
fs.writeFileSync(outputPath, output, 'utf8')

console.log(`Generated ${path.relative(process.cwd(), outputPath)}`)
console.log(`OSM snapshot: ${mapData.source.snapshot}`)
console.log(`B3 WGS 84: ${mapData.b3.wgs84.lon}, ${mapData.b3.wgs84.lat}`)
console.log(`B3 inside wedding-city AOI: ${mapData.b3.withinWeddingCityAoi}`)
console.log(`B3 containing OSM buildings: ${mapData.b3.containingBuildingIds.join(', ') || 'none'}`)
console.log(
  `Nearest mapped building centroid: way/${mapData.b3.nearestBuilding?.id ?? 'none'} (${mapData.b3.nearestBuilding?.centroidDistanceMeters ?? 'n/a'} m)`,
)
