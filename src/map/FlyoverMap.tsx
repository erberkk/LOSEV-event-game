import { useEffect, useRef } from 'react'
import maplibregl from './maplibre'
import type { Map as MLMap } from 'maplibre-gl'
import type { MotionValue } from 'motion/react'
import { LETTER_BY_ID, LETTERS } from '../data/letters'
import { losevStyle } from './style'
import { circle, ll, searchArea, type LatLng } from './geo'
import { letterPin, mysteryPin } from './markers'

/** Ana sayfa: kaydırmayla Kadıköy üzerinde kamera uçuşu. Etkileşimsiz; kamerayı scroll sürer. */

type Key = { at: number; c: LatLng; z: number; p: number; b: number }

const area = (id: 'O' | 'S' | 'E' | 'V') => searchArea(id).center
const mid = (a: LatLng, b: LatLng): LatLng => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

export const KEYS: Key[] = [
  { at: 0, c: [40.9866, 29.0262], z: 14.1, p: 0, b: 0 },
  { at: 0.2, c: LETTER_BY_ID.L.coords, z: 17.2, p: 62, b: -28 },
  { at: 0.42, c: mid(area('O'), area('S')), z: 16.3, p: 58, b: 12 },
  { at: 0.6, c: area('E'), z: 16.5, p: 60, b: 38 },
  { at: 0.8, c: area('V'), z: 16.2, p: 60, b: -14 },
  { at: 1, c: [40.9866, 29.0262], z: 14.9, p: 42, b: 0 },
]

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function cameraAt(p: number) {
  const i = Math.max(0, KEYS.findIndex((k) => k.at > p) - 1)
  const a = KEYS[i]
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)]
  const t = b.at === a.at ? 1 : ease(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))))
  return {
    center: ll([lerp(a.c[0], b.c[0], t), lerp(a.c[1], b.c[1], t)]),
    zoom: lerp(a.z, b.z, t),
    pitch: lerp(a.p, b.p, t),
    bearing: lerp(a.b, b.b, t),
  }
}

export default function FlyoverMap({ progress }: { progress: MotionValue<number> }) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)

  useEffect(() => {
    const m = new maplibregl.Map({
      container: box.current!,
      style: losevStyle(),
      ...cameraAt(progress.get()),
      interactive: false,
      attributionControl: false,
      maxPitch: 70,
      fadeDuration: 0,
    })
    map.current = m
    // alttaki bilgi kartıyla çakışmasın
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right')
    m.on('load', () => {
      // 4 gizli harfin arama alanları
      const hidden = LETTERS.filter((l) => l.id !== 'L')
      m.addSource('areas', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: hidden.map((l) => ({ ...circle(searchArea(l.id).center, searchArea(l.id).radius), properties: { c: l.color } })) },
      })
      m.addLayer({ id: 'areas-fill', type: 'fill', source: 'areas', paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0.14 } })
      m.addLayer({ id: 'areas-line', type: 'line', source: 'areas', paint: { 'line-color': ['get', 'c'], 'line-width': 2.5, 'line-dasharray': [1.5, 1.5] } })

      new maplibregl.Marker({ element: letterPin(LETTER_BY_ID.L, { target: true, label: 'Başlangıç · İskele' }), anchor: 'bottom' }).setLngLat(ll(LETTER_BY_ID.L.coords)).addTo(m)
      hidden.forEach((l) => new maplibregl.Marker({ element: mysteryPin(l.color), anchor: 'center' }).setLngLat(ll(searchArea(l.id).center)).addTo(m))
    })
    const off = progress.on('change', (p) => m.jumpTo(cameraAt(p)))
    return () => {
      off()
      m.remove()
    }
  }, [progress])

  // maplibre konteynere position:relative verir → mutlak konumlu sarmalayıcı + tam boy iç kutu
  return (
    <div className="absolute inset-0">
      <div ref={box} className="size-full" />
    </div>
  )
}
