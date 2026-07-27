<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import mapData from '@/assets/huqiu-map-data'

const { t } = useI18n()

// AMap URI coordinates use GCJ-02; the local OSM drawing is aligned to WGS 84 at generation time.
const venueMapUrl = `https://uri.amap.com/marker?position=${mapData.b3.gcj02.lon},${mapData.b3.gcj02.lat}&name=${encodeURIComponent('虎丘婚纱城 B3')}`
const sourceMonth = mapData.source.snapshot.slice(0, 7).replace('-', '.')
</script>

<template>
  <div class="huqiu-map-shell h-full self-stretch bg-white">
    <div
      id="huqiu-map"
      class="huqiu-map relative min-h-[360px] overflow-hidden bg-white text-black"
    >
      <a
        :href="venueMapUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="huqiu-map__canvas block h-full w-full"
        :aria-label="t('info.gisOpenMap')"
      >
        <svg
          class="h-full w-full"
          :viewBox="mapData.viewBox"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          :aria-label="t('info.gisMapAria')"
        >
          <title>{{ t('info.gisMapAria') }}</title>
          <defs>
            <clipPath id="huqiu-plot-clip">
              <rect
                :x="mapData.plot.x"
                :y="mapData.plot.y"
                :width="mapData.plot.width"
                :height="mapData.plot.height"
              />
            </clipPath>
          </defs>

          <rect width="440" height="520" fill="#ffffff" />

          <g class="map-header">
            <text x="30" y="39" class="map-title">{{ t('info.gisTitle') }}</text>
            <rect x="30" y="56" width="5" height="5" fill="#000226" />
            <text x="45" y="62" class="map-status">{{ t('info.gisStatus') }}</text>
            <line x1="30" y1="80.5" x2="410" y2="80.5" class="map-rule" />
          </g>

          <g clip-path="url(#huqiu-plot-clip)">
            <rect
              :x="mapData.plot.x"
              :y="mapData.plot.y"
              :width="mapData.plot.width"
              :height="mapData.plot.height"
              fill="#ffffff"
            />

            <path :d="mapData.paths.landuse" class="map-area map-area--landuse" />
            <path :d="mapData.paths.green" class="map-area map-area--green" />
            <path :d="mapData.paths.scenic" class="map-area map-area--scenic" />
            <path :d="mapData.paths.water" class="map-area map-area--water" />
            <path :d="mapData.paths.weddingCity" class="map-area map-area--venue" />
            <path :d="mapData.paths.buildings" class="map-buildings" />
            <path :d="mapData.paths.waterway" class="map-waterway" />

            <g class="map-transport">
              <path :d="mapData.paths.railway" class="map-rail map-rail--base" />
              <path :d="mapData.paths.railway" class="map-rail map-rail--track" />
              <path :d="mapData.paths.subway" class="map-subway" />

              <path :d="mapData.paths.roadMinor" class="map-road map-road--minor" />
              <path :d="mapData.paths.footways" class="map-road map-road--footway" />

              <path
                :d="mapData.paths.roadTertiary"
                class="map-road map-road-casing map-road-casing--tertiary"
              />
              <path :d="mapData.paths.roadTertiary" class="map-road map-road--tertiary" />

              <path
                :d="mapData.paths.roadSecondary"
                class="map-road map-road-casing map-road-casing--secondary"
              />
              <path :d="mapData.paths.roadSecondary" class="map-road map-road--secondary" />

              <path
                :d="mapData.paths.roadPrimary"
                class="map-road map-road-casing map-road-casing--primary"
              />
              <path :d="mapData.paths.roadPrimary" class="map-road map-road--primary" />

              <path
                :d="mapData.paths.roadTrunk"
                class="map-road map-road-casing map-road-casing--trunk"
              />
              <path :d="mapData.paths.roadTrunk" class="map-road map-road--trunk" />
            </g>

            <g class="map-road-labels">
              <text
                :x="mapData.labels.huchiRoad.x"
                :y="mapData.labels.huchiRoad.y"
                :transform="`rotate(${mapData.labels.huchiRoad.rotate} ${mapData.labels.huchiRoad.x} ${mapData.labels.huchiRoad.y})`"
              >
                {{ t('info.gisHuchiRoad') }}
              </text>
              <text
                :x="mapData.labels.hujinRoad.x"
                :y="mapData.labels.hujinRoad.y"
                :transform="`rotate(${mapData.labels.hujinRoad.rotate} ${mapData.labels.hujinRoad.x} ${mapData.labels.hujinRoad.y})`"
              >
                {{ t('info.gisHujinRoad') }}
              </text>
              <text
                :x="mapData.labels.huqiuWestRoad.x"
                :y="mapData.labels.huqiuWestRoad.y"
                :transform="`rotate(${mapData.labels.huqiuWestRoad.rotate} ${mapData.labels.huqiuWestRoad.x} ${mapData.labels.huqiuWestRoad.y})`"
              >
                {{ t('info.gisHuqiuWestRoad') }}
              </text>
              <text
                :x="mapData.labels.northRingWestRoad.x"
                :y="mapData.labels.northRingWestRoad.y"
                text-anchor="middle"
                :transform="`rotate(${mapData.labels.northRingWestRoad.rotate} ${mapData.labels.northRingWestRoad.x} ${mapData.labels.northRingWestRoad.y})`"
              >
                {{ t('info.gisNorthRingWestRoad') }}
              </text>
            </g>

            <g class="map-poi map-poi--station">
              <circle
                :cx="mapData.points.jinjidunStation.x"
                :cy="mapData.points.jinjidunStation.y"
                r="4.5"
              />
              <circle
                :cx="mapData.points.jinjidunStation.x"
                :cy="mapData.points.jinjidunStation.y"
                r="1.5"
                class="map-poi-cutout"
              />
              <text
                :x="mapData.points.jinjidunStation.x + 10"
                :y="mapData.points.jinjidunStation.y - 6"
              >
                {{ t('info.gisJinjidunStation') }}
              </text>
            </g>

            <g class="map-poi map-poi--station">
              <circle
                :cx="mapData.points.huqiuStation.x"
                :cy="mapData.points.huqiuStation.y"
                r="4.5"
              />
              <circle
                :cx="mapData.points.huqiuStation.x"
                :cy="mapData.points.huqiuStation.y"
                r="1.5"
                class="map-poi-cutout"
              />
              <text :x="mapData.points.huqiuStation.x + 10" :y="mapData.points.huqiuStation.y - 6">
                {{ t('info.gisHuqiuStation') }}
              </text>
            </g>

            <g class="map-scenic-label">
              <text :x="mapData.points.scenicArea.x + 30" y="119" text-anchor="end">
                {{ t('info.gisScenicArea') }}
              </text>
              <rect
                :x="mapData.points.tower.x - 3.5"
                :y="mapData.points.tower.y - 3.5"
                width="7"
                height="7"
              />
              <text
                :x="mapData.points.tower.x - 10"
                :y="mapData.points.tower.y + 4"
                text-anchor="end"
              >
                {{ t('info.gisTower') }}
              </text>
            </g>

            <g class="map-aoi-label">
              <text
                :x="mapData.points.weddingCity.x - 12"
                :y="mapData.points.weddingCity.y - 25"
                text-anchor="middle"
              >
                {{ t('info.gisWeddingCity') }}
              </text>
            </g>

            <g class="map-destination">
              <circle
                :cx="mapData.points.b3.x"
                :cy="mapData.points.b3.y"
                r="18"
                class="map-destination-ring"
              />
              <circle
                :cx="mapData.points.b3.x"
                :cy="mapData.points.b3.y"
                r="7"
                class="map-destination-dot"
              />
              <circle
                :cx="mapData.points.b3.x"
                :cy="mapData.points.b3.y"
                r="2"
                class="map-destination-core"
              />
              <path
                :d="`M${mapData.points.b3.x + 7} ${mapData.points.b3.y + 7}L${mapData.points.b3.x + 22} ${mapData.points.b3.y + 22}H${mapData.points.b3.x + 70}`"
                class="map-destination-leader"
              />
              <text
                :x="mapData.points.b3.x + 27"
                :y="mapData.points.b3.y + 19"
                class="map-destination-label"
              >
                B3
              </text>
            </g>

            <g class="map-north" aria-hidden="true">
              <text x="409" y="100" text-anchor="middle">N</text>
              <path d="M409 106V129M404 112L409 106L414 112" />
            </g>

            <g class="map-scale" aria-hidden="true">
              <path
                :d="`M30 418V413M30 416H${30 + mapData.scaleBar.pixels}M${30 + mapData.scaleBar.pixels} 418V413`"
              />
              <text :x="30 + mapData.scaleBar.pixels / 2" y="409" text-anchor="middle">
                {{ t('info.gisScale') }}
              </text>
            </g>
          </g>

          <line x1="30" y1="439.5" x2="410" y2="439.5" class="map-rule" />
          <g class="map-footer">
            <text x="30" y="466" class="map-location">{{ t('info.gisLocation') }}</text>
            <text x="30" y="488" class="map-open-label">{{ t('info.gisOpenMap') }}</text>
            <text x="410" y="488" class="map-open-icon" text-anchor="end">↗</text>
            <text x="410" y="506" class="map-source-date" text-anchor="end">
              OSM · {{ sourceMonth }}
            </text>
          </g>
        </svg>
      </a>

      <a
        :href="mapData.source.attributionUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="map-attribution absolute bottom-[10px] left-[30px] z-10"
      >
        {{ mapData.source.attribution }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.huqiu-map {
  aspect-ratio: 440 / 520;
  isolation: isolate;
}

.huqiu-map::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  border: 1px solid rgba(0, 2, 38, 0.08);
  transition: border-color 240ms ease;
}

.huqiu-map:hover::after,
.huqiu-map:focus-within::after {
  border-color: rgba(0, 2, 38, 0.35);
}

.huqiu-map__canvas:focus-visible {
  outline: 2px solid #000226;
  outline-offset: -2px;
}

.huqiu-map svg {
  font-family: 'JetBrains Mono', 'Noto Sans SC', sans-serif;
}

.map-title {
  fill: #000226;
  font-family: 'Bodoni Moda', 'Playfair Display', serif;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 2px;
}

.map-status {
  fill: rgba(0, 2, 38, 0.58);
  font-size: 8.5px;
  letter-spacing: 1.8px;
}

.map-rule {
  stroke: rgba(0, 2, 38, 0.1);
  stroke-width: 1;
}

.map-area,
.map-buildings,
.map-road,
.map-rail,
.map-subway,
.map-waterway {
  vector-effect: non-scaling-stroke;
}

.map-area--landuse {
  fill: rgba(0, 2, 38, 0.018);
  stroke: rgba(0, 2, 38, 0.04);
  stroke-width: 0.55;
}

.map-area--green {
  fill: rgba(0, 2, 38, 0.034);
  stroke: rgba(0, 2, 38, 0.06);
  stroke-width: 0.55;
}

.map-area--scenic {
  fill: rgba(0, 2, 38, 0.045);
  stroke: rgba(0, 2, 38, 0.13);
  stroke-width: 0.75;
}

.map-area--water {
  fill: #f5f5f7;
  stroke: rgba(0, 2, 38, 0.14);
  stroke-width: 0.6;
}

.map-area--venue {
  fill: rgba(0, 2, 38, 0.055);
  stroke: rgba(0, 2, 38, 0.52);
  stroke-width: 1.15;
  stroke-dasharray: 4 3;
}

.map-buildings {
  fill: rgba(0, 2, 38, 0.105);
  stroke: rgba(0, 2, 38, 0.15);
  stroke-width: 0.45;
}

.map-waterway {
  fill: none;
  stroke: rgba(0, 2, 38, 0.13);
  stroke-linecap: round;
  stroke-width: 2.2;
}

.map-road,
.map-rail,
.map-subway {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-road-casing {
  stroke: #ffffff;
}

.map-road-casing--trunk {
  stroke-width: 8.5;
}

.map-road-casing--primary {
  stroke-width: 7;
}

.map-road-casing--secondary {
  stroke-width: 5.8;
}

.map-road-casing--tertiary {
  stroke-width: 4.5;
}

.map-road--trunk {
  stroke: rgba(0, 2, 38, 0.68);
  stroke-width: 2.7;
}

.map-road--primary {
  stroke: rgba(0, 2, 38, 0.54);
  stroke-width: 2.1;
}

.map-road--secondary {
  stroke: rgba(0, 2, 38, 0.43);
  stroke-width: 1.55;
}

.map-road--tertiary {
  stroke: rgba(0, 2, 38, 0.31);
  stroke-width: 1.05;
}

.map-road--minor {
  stroke: rgba(0, 2, 38, 0.15);
  stroke-width: 0.8;
}

.map-road--footway {
  stroke: rgba(0, 2, 38, 0.13);
  stroke-width: 0.65;
  stroke-dasharray: 1.5 2;
}

.map-rail--base {
  stroke: #ffffff;
  stroke-width: 4;
}

.map-rail--track {
  stroke: rgba(0, 2, 38, 0.48);
  stroke-width: 1.45;
  stroke-dasharray: 5 2;
}

.map-subway {
  stroke: rgba(0, 2, 38, 0.28);
  stroke-width: 1.25;
  stroke-dasharray: 2 3;
}

.map-road-labels text,
.map-poi text,
.map-scenic-label text,
.map-aoi-label text {
  paint-order: stroke;
  stroke: #ffffff;
  stroke-linejoin: round;
  stroke-width: 3px;
}

.map-road-labels text {
  fill: rgba(0, 2, 38, 0.55);
  font-size: 8.5px;
  letter-spacing: 0.8px;
}

.map-poi circle,
.map-scenic-label rect {
  fill: #000226;
}

.map-poi .map-poi-cutout {
  fill: #ffffff;
}

.map-poi text,
.map-scenic-label text {
  fill: rgba(0, 2, 38, 0.74);
  font-size: 8.5px;
  letter-spacing: 0.4px;
}

.map-aoi-label text {
  fill: #000226;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.7px;
}

.map-destination-ring,
.map-destination-dot,
.map-destination-leader {
  vector-effect: non-scaling-stroke;
}

.map-destination-ring {
  fill: none;
  stroke: rgba(0, 2, 38, 0.28);
  stroke-width: 1;
}

.map-destination-dot {
  fill: #000226;
}

.map-destination-core {
  fill: #ffffff;
}

.map-destination-leader {
  fill: none;
  stroke: #000226;
  stroke-width: 1;
}

.map-destination-label {
  paint-order: stroke;
  stroke: #ffffff;
  stroke-linejoin: round;
  stroke-width: 3px;
}

.map-destination-label {
  fill: #000226;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
}

.map-north text,
.map-scale text {
  fill: rgba(0, 2, 38, 0.65);
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.6px;
}

.map-north path,
.map-scale path {
  fill: none;
  stroke: rgba(0, 2, 38, 0.62);
  stroke-linecap: square;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.map-location {
  fill: #000226;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.map-open-label {
  fill: rgba(0, 2, 38, 0.58);
  font-size: 8.5px;
  letter-spacing: 1.3px;
}

.map-open-icon {
  fill: #000226;
  font-family: Arial, sans-serif;
  font-size: 20px;
}

.map-source-date {
  fill: rgba(0, 2, 38, 0.35);
  font-size: 7px;
  letter-spacing: 0.8px;
}

.map-attribution {
  color: rgba(0, 2, 38, 0.5);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
}

.map-attribution:hover,
.map-attribution:focus-visible {
  color: #000226;
  text-decoration: underline;
}

@media (max-width: 767px) {
  .map-title {
    font-size: 21px;
  }
}
</style>
