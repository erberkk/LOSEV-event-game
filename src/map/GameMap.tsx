import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from './maplibre'
import type { GeoJSONSource, Map as MLMap, Marker } from 'maplibre-gl'
import { AnimatePresence, motion } from 'motion/react'
import { LETTER_BY_ID, LETTERS, MAP_CENTER, type LetterId } from '../data/letters'
import type { WalkRoute } from '../data/routes'
import { cn } from '../lib/fx'
import { Icon } from '../components/ui'
import { losevStyle } from './style'
import { bearing, circle, distance, ll, makeAlong, offset as offsetFor, searchArea, supportsWebGL, type LatLng } from './geo'
import { letterPin, meDot, mysteryPin } from './markers'
import MapFallback from './MapFallback'

/**
 * Oyun haritası — kademeli keşif:
 *  - bulunan harfler: pin + ✓
 *  - sıradaki harf: tam yer yerine ~170 m'lik "arama alanı" halkası
 *  - "Rotayı göster" sonrası: tam pin + son harften ışıklı yürüme rotası
 *  - diğer harfler: haritada yok
 */

type Props = {
  found: Partial<Record<LetterId, unknown>>
  next?: LetterId
  revealed?: boolean
  route?: WalkRoute
  focus?: { id: LetterId; n: number }
  onPinClick?: (id: LetterId) => void
  className?: string
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

function heat(m: number) {
  if (m < 40) return { t: 'Tam buradasın!', c: '#ED1C24' }
  if (m < 150) return { t: 'Çok sıcak', c: '#FF6A13' }
  if (m < 400) return { t: 'Sıcak', c: '#FFC21A' }
  if (m < 900) return { t: 'Ilık', c: '#9BD3A0' }
  return { t: 'Soğuk', c: '#00AEEF' }
}
const fmtM = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m / 10) * 10} m`)

export default function GameMap({ found, next, revealed, route, focus, onPinClick, className }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<MLMap | null>(null)
  const markers = useRef<Marker[]>([])
  const me = useRef<Marker | null>(null)
  const [ready, setReady] = useState(false)
  const [pitched, setPitched] = useState(true)
  const [pos, setPos] = useState<LatLng | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const watch = useRef<number | null>(null)
  const webgl = useMemo(supportsWebGL, [])
  const coarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])

  const foundKey = LETTERS.filter((l) => found[l.id]).map((l) => l.id).join('')
  const showExact = !!next && (revealed || (next === 'L' && !foundKey))

  // ——— harita kurulumu
  useEffect(() => {
    if (!webgl || !box.current) return
    const m = new maplibregl.Map({
      container: box.current,
      style: losevStyle(),
      center: ll(MAP_CENTER),
      zoom: 14.6,
      pitch: 50,
      bearing: -12,
      maxPitch: 70,
      attributionControl: { compact: true },
      cooperativeGestures: coarse,
      locale: {
        'CooperativeGesturesHandler.MobileHelpText': 'Haritayı hareket ettirmek için iki parmağını kullan',
        'CooperativeGesturesHandler.WindowsHelpText': 'Yakınlaştırmak için Ctrl + kaydırma',
        'CooperativeGesturesHandler.MacHelpText': 'Yakınlaştırmak için ⌘ + kaydırma',
      },
    })
    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: !coarse }), 'bottom-right')
    m.on('load', () => {
      m.addSource('search', { type: 'geojson', data: EMPTY })
      m.addLayer({ id: 'search-fill', type: 'fill', source: 'search', paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0.16 } })
      m.addLayer({ id: 'search-line', type: 'line', source: 'search', paint: { 'line-color': ['get', 'c'], 'line-width': 3, 'line-dasharray': [1.5, 1.5] } })

      m.addSource('route', { type: 'geojson', data: EMPTY, lineMetrics: true })
      m.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'c'], 'line-width': 18, 'line-blur': 10, 'line-opacity': 0.55 } })
      m.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 10 } })
      m.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-width': 6, 'line-gradient': ['interpolate', ['linear'], ['line-progress'], 0, '#14110F', 1, '#14110F'] } })

      m.addSource('comet', { type: 'geojson', data: EMPTY })
      m.addLayer({ id: 'comet-glow', type: 'circle', source: 'comet', paint: { 'circle-radius': 16, 'circle-color': '#FFFFFF', 'circle-blur': 1, 'circle-opacity': 0.9 } })
      m.addLayer({ id: 'comet-core', type: 'circle', source: 'comet', paint: { 'circle-radius': 5.5, 'circle-color': '#FFFFFF', 'circle-stroke-color': '#14110F', 'circle-stroke-width': 2 } })
      setReady(true)
    })
    map.current = m
    return () => {
      m.remove()
      map.current = null
    }
  }, [webgl, coarse])

  // ——— işaretler + arama halkası
  useEffect(() => {
    const m = map.current
    if (!m || !ready) return
    markers.current.forEach((mk) => mk.remove())
    markers.current = []
    const add = (el: HTMLElement, at: LatLng, anchor: 'bottom' | 'center' = 'bottom') => markers.current.push(new maplibregl.Marker({ element: el, anchor }).setLngLat(ll(at)).addTo(m))

    for (const l of LETTERS) {
      if (found[l.id]) add(letterPin(l, { found: true, onClick: () => onPinClick?.(l.id) }), l.coords)
    }
    const search = m.getSource('search') as GeoJSONSource
    if (next) {
      const l = LETTER_BY_ID[next]
      if (showExact) {
        add(letterPin(l, { target: true, label: l.short, onClick: () => onPinClick?.(l.id) }), l.coords)
        search.setData(EMPTY)
      } else {
        const a = searchArea(next)
        search.setData({ type: 'FeatureCollection', features: [{ ...circle(a.center, a.radius), properties: { c: l.color } }] })
        add(mysteryPin(l.color, `“${l.char}” burada bir yerde`), a.center, 'center')
      }
    } else search.setData(EMPTY)
  }, [ready, foundKey, next, showExact, found, onPinClick])

  // ——— kamera: içerik değişince çerçevele
  useEffect(() => {
    const m = map.current
    if (!m || !ready) return
    const pts: LatLng[] = LETTERS.filter((l) => found[l.id]).map((l) => l.coords)
    if (next) {
      if (showExact) pts.push(LETTER_BY_ID[next].coords)
      else {
        const a = searchArea(next)
        for (const b of [0, 90, 180, 270]) pts.push(offsetFor(a.center, a.radius, b))
      }
    }
    if (route && revealed) return // rota efekti kendi kamerasını yönetiyor
    if (!pts.length) return
    const bounds = pts.reduce((b, p) => b.extend(ll(p)), new maplibregl.LngLatBounds(ll(pts[0]), ll(pts[0])))
    const cam = m.cameraForBounds(bounds, { padding: 70, maxZoom: 16.6 })
    if (cam) m.flyTo({ ...cam, pitch: pitched ? 50 : 0, bearing: -12, duration: reduced() ? 0 : 1400 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, foundKey, next, showExact])

  // ——— rota: çizilerek gelir, sonra üzerinde ışık akar
  useEffect(() => {
    const m = map.current
    if (!m || !ready) return
    const src = m.getSource('route') as GeoJSONSource
    const comet = m.getSource('comet') as GeoJSONSource
    if (!route || !revealed || !next) {
      src.setData(EMPTY)
      comet.setData(EMPTY)
      return
    }
    const to = LETTER_BY_ID[next]
    const fromId = (Object.keys(found) as LetterId[]).sort((a, b) => ((found[b] as { at: number }).at ?? 0) - ((found[a] as { at: number }).at ?? 0))[0]
    const from = fromId ? LETTER_BY_ID[fromId] : to
    m.setPaintProperty('route-line', 'line-gradient', ['interpolate', ['linear'], ['line-progress'], 0, from.color, 1, to.color])
    m.setPaintProperty('route-glow', 'line-color', to.color)

    const along = makeAlong(route.coords)
    const line = (c: LatLng[]): GeoJSON.Feature => ({ type: 'Feature', properties: { c: to.color }, geometry: { type: 'LineString', coordinates: c.map(ll) } })

    // kamera rota boyunca, yürüme yönüne bakar
    const b = route.coords.reduce((acc, p) => acc.extend(ll(p)), new maplibregl.LngLatBounds(ll(route.coords[0]), ll(route.coords[0])))
    const brg = bearing(route.coords[0], route.coords[route.coords.length - 1])
    const cam = m.cameraForBounds(b, { padding: { top: 90, bottom: 60, left: 50, right: 50 }, bearing: brg, maxZoom: 17.2 })
    if (cam) m.flyTo({ ...cam, bearing: brg, pitch: pitched ? 58 : 0, duration: reduced() ? 0 : 1600 })

    let raf = 0
    const start = performance.now() + (reduced() ? 0 : 900)
    const DRAW = reduced() ? 0 : 1500
    const LOOP = Math.max(2600, along.total * 4.5) // uzun rotada ışık daha uzun sürer
    const tick = (now: number) => {
      const t = now - start
      if (t < 0) src.setData(line(along.slice(0)))
      else if (t < DRAW) {
        const k = 1 - Math.pow(1 - t / DRAW, 3)
        src.setData(line(along.slice(k)))
        comet.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ll(along.at(k)) } })
      } else {
        src.setData(line(route.coords))
        if (reduced()) {
          comet.setData(EMPTY)
          return
        }
        const k = ((t - DRAW) % LOOP) / LOOP
        comet.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ll(along.at(k)) } })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, route, revealed, next])

  // ——— dışarıdan odak (liste tıklaması)
  useEffect(() => {
    const m = map.current
    if (!m || !ready || !focus) return
    m.flyTo({ center: ll(LETTER_BY_ID[focus.id].coords), zoom: 17.3, pitch: pitched ? 60 : 0, bearing: m.getBearing() + 30, duration: reduced() ? 0 : 1500 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.n, ready])

  // ——— konum
  useEffect(() => () => void (watch.current !== null && navigator.geolocation.clearWatch(watch.current)), [])
  useEffect(() => {
    const m = map.current
    if (!m || !pos) return
    if (!me.current) {
      me.current = new maplibregl.Marker({ element: meDot() }).setLngLat(ll(pos)).addTo(m)
      const target = next ? LETTER_BY_ID[next].coords : undefined
      const pts = target ? [pos, showExact ? target : searchArea(next!).center] : [pos]
      const bounds = pts.reduce((b, p) => b.extend(ll(p)), new maplibregl.LngLatBounds(ll(pts[0]), ll(pts[0])))
      const cam = m.cameraForBounds(bounds, { padding: 80, maxZoom: 17 })
      if (cam) m.flyTo({ ...cam, pitch: pitched ? 50 : 0, duration: 1200 })
    } else me.current.setLngLat(ll(pos))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  const locate = () => {
    if (pos && map.current) return map.current.flyTo({ center: ll(pos), zoom: 17, duration: 900 })
    if (!('geolocation' in navigator)) return setGeoError('Cihazın konum özelliğini desteklemiyor.')
    watch.current = navigator.geolocation.watchPosition(
      (p) => {
        setGeoError(null)
        setPos([p.coords.latitude, p.coords.longitude])
      },
      () => setGeoError('Konum izni verilmedi. Tarayıcı ayarlarından açabilirsin.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
  }

  const togglePitch = () => {
    const m = map.current
    if (!m) return
    const p = !pitched
    setPitched(p)
    m.easeTo({ pitch: p ? 55 : 0, bearing: p ? m.getBearing() : 0, duration: 800 })
  }

  if (!webgl) return <MapFallback className={className} text="Harita bu cihazda açılamadı. İpuçlarını ve “Yol tarifi” butonunu kullanabilirsin." />

  const away = pos && next ? distance(pos, LETTER_BY_ID[next].coords) : null
  const h = away !== null ? heat(away) : null

  return (
    <div className={cn('relative isolate overflow-hidden rounded-[1.75rem] border-2 border-ink bg-[#F4ECDF] shadow-[6px_6px_0_0_var(--color-ink)]', className)}>
      <div className="absolute inset-0">
        <div ref={box} className="size-full" />
      </div>
      {!ready && <div className="absolute inset-0 animate-pulse bg-paper-2" />}

      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
        <button onClick={locate} className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]">
          <Icon name="locate" className={cn('size-4', pos && 'text-blue')} /> {pos ? 'Konumum' : 'Konumumu göster'}
        </button>
        <AnimatePresence>
          {(h || geoError) && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn('flex max-w-60 items-center gap-2 rounded-2xl border-2 border-ink bg-white px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]', geoError && 'bg-sun')}
            >
              {geoError ?? (
                <>
                  <span className="size-3 shrink-0 rounded-full border-2 border-ink" style={{ background: h!.c }} />
                  <span>
                    {h!.t} · “{LETTER_BY_ID[next!].char}” ~{fmtM(away!)}
                  </span>
                </>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={togglePitch}
        className="absolute top-3 right-3 z-10 grid h-10 min-w-10 place-items-center rounded-full border-2 border-ink bg-paper px-3 font-display text-sm font-extrabold shadow-[2px_2px_0_0_var(--color-ink)]"
        aria-label={pitched ? 'Düz görünüm' : '3D görünüm'}
      >
        {pitched ? '2D' : '3D'}
      </button>
    </div>
  )
}

