import type { LetterId } from '../data/letters'
import { LETTER_BY_ID } from '../data/letters'

export type LatLng = [number, number]
/** MapLibre [lng, lat] bekler; verimiz [lat, lng] */
export const ll = ([lat, lng]: LatLng): [number, number] => [lng, lat]

const R = 6371e3
const rad = Math.PI / 180

export function offset([lat, lng]: LatLng, meters: number, bearingDeg: number): LatLng {
  const d = meters / R
  const b = bearingDeg * rad
  const la = Math.asin(Math.sin(lat * rad) * Math.cos(d) + Math.cos(lat * rad) * Math.sin(d) * Math.cos(b))
  const lo = lng * rad + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat * rad), Math.cos(d) - Math.sin(lat * rad) * Math.sin(la))
  return [la / rad, lo / rad]
}

export function bearing([a1, o1]: LatLng, [a2, o2]: LatLng) {
  const y = Math.sin((o2 - o1) * rad) * Math.cos(a2 * rad)
  const x = Math.cos(a1 * rad) * Math.sin(a2 * rad) - Math.sin(a1 * rad) * Math.cos(a2 * rad) * Math.cos((o2 - o1) * rad)
  return (Math.atan2(y, x) / rad + 360) % 360
}

export function distance([a1, o1]: LatLng, [a2, o2]: LatLng) {
  const h = Math.sin(((a2 - a1) * rad) / 2) ** 2 + Math.cos(a1 * rad) * Math.cos(a2 * rad) * Math.sin(((o2 - o1) * rad) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Arama alanı: harfin tam yerini vermeden ~170 m'lik halka.
 * Merkez harften kaydırılmış (her harf için sabit yön), yani halkanın ortası cevap değil.
 */
const SEARCH_BEARING: Record<LetterId, number> = { L: 40, O: 210, S: 300, E: 120, V: 20 }
export const SEARCH_RADIUS = 170
export function searchArea(id: LetterId) {
  return { center: offset(LETTER_BY_ID[id].coords, 85, SEARCH_BEARING[id]), radius: SEARCH_RADIUS }
}

export function circle(center: LatLng, meters: number, steps = 72): GeoJSON.Feature<GeoJSON.Polygon> {
  const ring = Array.from({ length: steps + 1 }, (_, i) => ll(offset(center, meters, (i / steps) * 360)))
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }
}

/** Çizgi üzerinde 0..1 arasındaki noktayı bul (kuyruklu yıldız animasyonu için) */
export function makeAlong(coords: LatLng[]) {
  const cum = [0]
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + distance(coords[i - 1], coords[i]))
  const total = cum[cum.length - 1] || 1
  return {
    total,
    at(t: number): LatLng {
      const d = Math.min(Math.max(t, 0), 1) * total
      let i = 1
      while (i < cum.length - 1 && cum[i] < d) i++
      const seg = cum[i] - cum[i - 1] || 1
      const k = (d - cum[i - 1]) / seg
      const [a1, o1] = coords[i - 1]
      const [a2, o2] = coords[i]
      return [a1 + (a2 - a1) * k, o1 + (o2 - o1) * k]
    },
    /** 0..t arasını kesen alt çizgi (çizilerek gelme animasyonu için) */
    slice(t: number): LatLng[] {
      const d = Math.min(Math.max(t, 0), 1) * total
      const out: LatLng[] = [coords[0]]
      for (let i = 1; i < coords.length; i++) {
        if (cum[i] <= d) out.push(coords[i])
        else {
          const k = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
          const [a1, o1] = coords[i - 1]
          const [a2, o2] = coords[i]
          out.push([a1 + (a2 - a1) * k, o1 + (o2 - o1) * k])
          break
        }
      }
      return out.length > 1 ? out : [coords[0], coords[0]]
    },
  }
}

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
