/**
 * Harfler arasındaki gerçek yürüme rotalarını bir kere hesaplayıp src/data/routes.json'a yazar.
 * Site çalışırken hiçbir rota servisine istek atmaz.
 *
 *   npm run routes      (letters.ts'te koordinat değişince yeniden çalıştır)
 *
 * Kaynak: FOSSGIS OSRM yaya profili (routing.openstreetmap.de), OpenStreetMap verisi.
 */
import { writeFileSync } from 'node:fs'
import { LETTERS } from '../src/data/letters.ts'

const ENDPOINT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot'
const round = (n: number) => Math.round(n * 1e5) / 1e5

type Route = { coords: [number, number][]; distance: number; duration: number }
const out: Record<string, Route> = {}

for (let i = 0; i < LETTERS.length; i++) {
  for (let j = i + 1; j < LETTERS.length; j++) {
    const a = LETTERS[i]
    const b = LETTERS[j]
    const url = `${ENDPOINT}/${a.coords[1]},${a.coords[0]};${b.coords[1]},${b.coords[0]}?overview=full&geometries=geojson`
    const res = await fetch(url, { headers: { 'User-Agent': 'losev-izinde-route-builder' } })
    const json = (await res.json()) as { code: string; routes: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[] }
    if (json.code !== 'Ok') throw new Error(`${a.id}-${b.id}: ${json.code}`)
    const r = json.routes[0]
    out[`${a.id}-${b.id}`] = {
      coords: r.geometry.coordinates.map(([lng, lat]) => [round(lat), round(lng)]),
      distance: Math.round(r.distance),
      duration: Math.round(r.duration),
    }
    console.log(`${a.char} → ${b.char}: ${Math.round(r.distance)} m, ${Math.round(r.duration / 60)} dk`)
    await new Promise((r) => setTimeout(r, 400)) // sunucuya nazik ol
  }
}

writeFileSync(new URL('../src/data/routes.json', import.meta.url), JSON.stringify(out) + '\n')
console.log('✓ src/data/routes.json yazıldı')
