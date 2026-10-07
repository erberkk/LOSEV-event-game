import ROUTES from './routes.json'
import { LETTERS, type LetterId } from './letters'

/** Önceden hesaplanmış yürüme rotası (npm run routes). coords: [lat, lng] */
export type WalkRoute = { coords: [number, number][]; distance: number; duration: number }

const table = ROUTES as unknown as Record<string, WalkRoute>
const idx = (id: LetterId) => LETTERS.findIndex((l) => l.id === id)

/** a → b yönünde rota (tabloda tek yön tutuluyor, gerekirse ters çevrilir) */
export function walkRoute(a: LetterId, b: LetterId): WalkRoute | undefined {
  if (a === b) return undefined
  const forward = idx(a) < idx(b)
  const r = table[forward ? `${a}-${b}` : `${b}-${a}`]
  if (!r) return undefined
  if (forward) return r
  // aynı nesneyi döndür: harita, rota kimliği değişince yeniden odaklanıyor
  const key = `${a}-${b}`
  return (reversed[key] ??= { ...r, coords: [...r.coords].reverse() })
}
const reversed: Record<string, WalkRoute> = {}

/** Ana tur: L → Ö → S → E → V, gerçek sokaklar üzerinden */
export const TOUR: [number, number][] = LETTERS.slice(1).flatMap((l, i) => walkRoute(LETTERS[i].id, l.id)?.coords ?? [])

export const formatWalk = (r: Pick<WalkRoute, 'distance' | 'duration'>) => {
  const min = Math.max(1, Math.round(r.duration / 60))
  const dist = r.distance >= 1000 ? `${(r.distance / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(r.distance / 10) * 10} m`
  return `${min} dk · ${dist}`
}

/**
 * Sıradaki önerilen harf: son bulunan harften yürüyerek en yakın, henüz bulunmamış harf.
 * Hiç harf bulunmadıysa rotanın başlangıcı (L).
 */
export function nextLetter(found: Partial<Record<LetterId, { at: number }>>) {
  const unfound = LETTERS.filter((l) => !found[l.id])
  if (!unfound.length) return { letter: undefined, from: undefined, route: undefined }
  const last = (Object.entries(found) as [LetterId, { at: number }][]).sort((a, b) => b[1].at - a[1].at)[0]?.[0]
  if (!last) return { letter: unfound[0], from: undefined, route: undefined }
  const letter = unfound.reduce((best, l) => ((walkRoute(last, l.id)?.distance ?? Infinity) < (walkRoute(last, best.id)?.distance ?? Infinity) ? l : best))
  return { letter, from: last, route: walkRoute(last, letter.id) }
}

/** Telefonun harita uygulamasında yürüyüş yol tarifi */
export function directionsUrl([lat, lng]: [number, number]) {
  const apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)
  return apple ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w` : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
}

/** Kuş uçuşu mesafe (m) */
export function haversine([a1, o1]: [number, number], [a2, o2]: [number, number]) {
  const R = 6371e3
  const r = Math.PI / 180
  const h = Math.sin(((a2 - a1) * r) / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(((o2 - o1) * r) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
