import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl'

/**
 * Markaya özel Kadıköy haritası. Kaynak: OpenFreeMap (OpenMapTiles şeması, OSM verisi, API anahtarı yok).
 * Prod'da yoğun trafik için kendi karo sunucusu / ücretli sağlayıcı: VITE_MAP_TILES ile değiştirilebilir.
 */

const TILES = (import.meta.env.VITE_MAP_TILES as string | undefined) || 'https://tiles.openfreemap.org/planet'
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

export const C = {
  land: '#F4ECDF',
  residential: '#EFE5D4',
  park: '#CBE3B1',
  wood: '#B9D99E',
  sand: '#F2E2BC',
  water: '#7FD2F2',
  waterDeep: '#56C2EC',
  waterLabel: '#1E6F96',
  road: '#FFFFFF',
  roadCasing: '#E3D5C0',
  roadMajor: '#FFE2A6',
  roadMajorCasing: '#E9BE6E',
  pedestrian: '#FBF5EC',
  rail: '#CDBDA5',
  building: '#E9DDCB',
  buildingTop: '#E2D2BB',
  label: '#6B6259',
  ink: '#14110F',
}

const name: ExpressionSpecification = ['coalesce', ['get', 'name:tr'], ['get', 'name']]
const notBridgeTunnel: ExpressionSpecification = ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true]
const cls = (...c: string[]): ExpressionSpecification => ['match', ['get', 'class'], c, true, false]
const w = (...stops: number[]): ExpressionSpecification => ['interpolate', ['exponential', 1.4], ['zoom'], ...stops]

export function losevStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: GLYPHS,
    sources: {
      omt: {
        type: 'vector',
        url: TILES,
        attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Veri: <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': C.land } },
      { id: 'residential', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: cls('residential', 'suburb', 'neighbourhood'), paint: { 'fill-color': C.residential } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park } },
      { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: cls('grass', 'farmland'), paint: { 'fill-color': C.park } },
      { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: cls('wood'), paint: { 'fill-color': C.wood } },
      { id: 'sand', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: cls('sand'), paint: { 'fill-color': C.sand } },
      { id: 'pitch', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: cls('pitch', 'stadium', 'school'), paint: { 'fill-color': '#E6E7C4' } },
      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        filter: ['!=', ['get', 'brunnel'], 'tunnel'],
        paint: { 'fill-color': ['interpolate', ['linear'], ['zoom'], 12, C.waterDeep, 16, C.water] },
      },
      // kıyı çizgisi: suya hafif koyu kenar
      { id: 'water-edge', type: 'line', source: 'omt', 'source-layer': 'water', paint: { 'line-color': C.waterDeep, 'line-width': w(12, 0.5, 18, 3), 'line-blur': 1 } },

      { id: 'pedestrian-area', type: 'fill', source: 'omt', 'source-layer': 'transportation', filter: ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false], paint: { 'fill-color': C.pedestrian } },

      // yollar — kılıf
      { id: 'road-minor-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 14, filter: ['all', notBridgeTunnel, cls('minor', 'service')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.roadCasing, 'line-width': w(14, 3, 18, 20) } },
      { id: 'road-major-casing', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['all', notBridgeTunnel, cls('secondary', 'tertiary', 'primary', 'trunk')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.roadMajorCasing, 'line-width': w(12, 1.5, 18, 28) } },
      // yollar — dolgu
      { id: 'path', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 15, filter: ['all', ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false], cls('path', 'pedestrian')], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': w(15, 1.5, 18, 6), 'line-opacity': 0.95 } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 13.5, filter: ['all', notBridgeTunnel, cls('minor', 'service')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.road, 'line-width': w(13.5, 0.5, 14, 2, 18, 16) } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['all', notBridgeTunnel, cls('secondary', 'tertiary', 'primary', 'trunk')], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': C.roadMajor, 'line-width': w(12, 1, 18, 24) } },
      { id: 'bridge', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['all', ['==', ['get', 'brunnel'], 'bridge'], cls('minor', 'secondary', 'tertiary', 'primary', 'trunk', 'pedestrian', 'path')], layout: { 'line-cap': 'round' }, paint: { 'line-color': C.road, 'line-width': w(14, 2, 18, 16) } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: ['all', notBridgeTunnel, cls('rail', 'transit')], paint: { 'line-color': C.rail, 'line-width': w(13, 0.6, 18, 3) } },
      // vapur hatları — Kadıköy'ün imzası
      { id: 'ferry', type: 'line', source: 'omt', 'source-layer': 'transportation', filter: cls('ferry'), paint: { 'line-color': '#FFFFFF', 'line-width': 1.4, 'line-dasharray': [2, 3], 'line-opacity': 0.85 } },

      { id: 'building-flat', type: 'fill', source: 'omt', 'source-layer': 'building', maxzoom: 14.5, paint: { 'fill-color': C.building } },
      {
        id: 'building-3d',
        type: 'fill-extrusion',
        source: 'omt',
        'source-layer': 'building',
        minzoom: 14.5,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 8], 0, C.building, 40, C.buildingTop],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 15.2, ['coalesce', ['get', 'render_height'], 8]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.93,
          'fill-extrusion-vertical-gradient': true,
        },
      },

      // etiketler
      {
        id: 'water-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'water_name',
        layout: { 'text-field': name, 'text-font': ['Noto Sans Italic'], 'text-size': 13, 'text-letter-spacing': 0.15, 'text-max-width': 6 },
        paint: { 'text-color': C.waterLabel, 'text-halo-color': 'rgba(255,255,255,0.6)', 'text-halo-width': 1.2 },
      },
      {
        id: 'street-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'transportation_name',
        minzoom: 15,
        layout: { 'symbol-placement': 'line', 'text-field': name, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10.5, 18, 13], 'text-rotation-alignment': 'map', 'text-pitch-alignment': 'viewport' },
        paint: { 'text-color': C.label, 'text-halo-color': C.land, 'text-halo-width': 1.4 },
      },
      {
        id: 'place-name',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        filter: cls('suburb', 'neighbourhood', 'quarter'),
        layout: { 'text-field': name, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 12, 11, 16, 14], 'text-transform': 'uppercase', 'text-letter-spacing': 0.18, 'text-max-width': 8 },
        paint: { 'text-color': 'rgba(20,17,15,0.55)', 'text-halo-color': C.land, 'text-halo-width': 1.6 },
      },
    ],
  }
}
