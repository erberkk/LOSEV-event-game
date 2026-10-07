import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { AnimatePresence, motion } from 'motion/react'
import { LETTERS, LETTER_BY_ID, MAP_CENTER, type LetterId } from '../data/letters'
import { haversine, TOUR, type WalkRoute } from '../data/routes'
import { cn } from '../lib/fx'
import { Icon } from './ui'

// Prod'da yoğun trafik için anahtarlı bir sağlayıcı önerilir (MapTiler, Stadia vb.) → .env
const TILE_URL = (import.meta.env.VITE_TILE_URL as string | undefined) || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTR = (import.meta.env.VITE_TILE_ATTRIBUTION as string | undefined) || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

type LatLng = [number, number]

type Props = {
  activeId?: LetterId
  onSelect?: (id: LetterId) => void
  /** Verilirse bulunmayan harfler kesik çizgili "hayalet" pin olur */
  found?: Partial<Record<LetterId, unknown>>
  /** Vurgulanacak yürüme bacağı (son bulunan → sıradaki harf) */
  leg?: { to: LetterId; route?: WalkRoute }
  /** "Konumum" butonu ve canlı konum */
  locate?: boolean
  className?: string
}

function pinIcon(id: LetterId, active: boolean, ghost: boolean) {
  const l = LETTER_BY_ID[id]
  return L.divIcon({
    className: '',
    html: `<div class="pin ${active ? 'is-active' : ''} ${ghost ? 'is-ghost' : ''}" style="background:${l.color}"><span style="color:${l.ink}">${l.char}</span></div>`,
    iconSize: [46, 46],
    // -45° dönmüş damla: sivri uç, merkezin köşegen yarısı kadar altında
    iconAnchor: [23, 56],
  })
}

const meIcon = L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [22, 22], iconAnchor: [11, 11] })

function Controller({ activeId, interactive, leg, me, follow }: { activeId?: LetterId; interactive: boolean; leg?: Props['leg']; me: LatLng | null; follow: number }) {
  const map = useMap()
  useEffect(() => {
    const handlers = [map.dragging, map.touchZoom, map.doubleClickZoom, map.boxZoom, map.keyboard]
    handlers.forEach((h) => (interactive ? h.enable() : h.disable()))
  }, [interactive, map])
  useEffect(() => {
    if (!activeId) return
    map.flyTo(LETTER_BY_ID[activeId].coords, 17, { duration: 0.9 })
  }, [activeId, map])
  // yeni bacak çizilince ona odaklan
  useEffect(() => {
    if (!leg?.route) return
    map.flyToBounds(L.latLngBounds(leg.route.coords), { padding: [56, 56], maxZoom: 17, duration: 1 })
  }, [leg?.route, map])
  // konum ilk alındığında: ben + hedef birlikte görünsün
  const lastFollow = useRef(0)
  useEffect(() => {
    if (!me || follow === lastFollow.current) return
    lastFollow.current = follow
    const target = leg ? LETTER_BY_ID[leg.to].coords : undefined
    if (target) map.flyToBounds(L.latLngBounds([me, target]), { padding: [64, 64], maxZoom: 17, duration: 1 })
    else map.flyTo(me, 17, { duration: 1 })
  }, [me, follow, leg, map])
  return null
}

export default function RouteMap({ activeId, onSelect, found, leg, locate, className }: Props) {
  const coarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])
  const [interactive, setInteractive] = useState(!coarse)
  const bounds = useMemo(() => L.latLngBounds(LETTERS.map((l) => l.coords)).pad(0.28), [])

  const [me, setMe] = useState<LatLng | null>(null)
  const [follow, setFollow] = useState(0)
  const [geoError, setGeoError] = useState<string | null>(null)
  const watch = useRef<number | null>(null)
  useEffect(() => () => void (watch.current !== null && navigator.geolocation.clearWatch(watch.current)), [])

  const startLocate = () => {
    setInteractive(true)
    if (me) return setFollow((f) => f + 1)
    if (!('geolocation' in navigator)) return setGeoError('Cihazın konum özelliğini desteklemiyor.')
    watch.current = navigator.geolocation.watchPosition(
      (p) => {
        setGeoError(null)
        setMe((prev) => {
          if (!prev) setFollow((f) => f + 1)
          return [p.coords.latitude, p.coords.longitude]
        })
      },
      () => setGeoError('Konum izni verilmedi. Tarayıcı ayarlarından açabilirsin.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )
  }

  const target = leg ? LETTER_BY_ID[leg.to] : undefined
  const away = me && target ? haversine(me, target.coords) : null

  return (
    <div className={cn('relative isolate overflow-hidden rounded-[1.75rem] border-2 border-ink shadow-[6px_6px_0_0_var(--color-ink)]', className)}>
      <MapContainer center={MAP_CENTER} bounds={bounds} zoom={15} scrollWheelZoom={false} zoomControl={!coarse} className="map-warm size-full" attributionControl>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />

        {/* ana tur — gerçek sokaklar */}
        <Polyline positions={TOUR} pathOptions={{ color: '#14110F', weight: 4, opacity: leg?.route ? 0.35 : 1, lineCap: 'round', className: 'route-line' }} />

        {/* sıradaki bacak: beyaz kılıf + renkli çizgi (çizilerek gelir) + akan noktalar */}
        {leg?.route && target && (
          <>
            <Polyline key={`c-${leg.to}`} positions={leg.route.coords} pathOptions={{ color: '#FFFFFF', weight: 12, lineCap: 'round', lineJoin: 'round', className: 'route-leg-draw' }} />
            <Polyline key={`l-${leg.to}`} positions={leg.route.coords} pathOptions={{ color: target.color, weight: 7, lineCap: 'round', lineJoin: 'round', className: 'route-leg-draw' }} />
            <Polyline key={`d-${leg.to}`} positions={leg.route.coords} pathOptions={{ color: target.ink === '#FFFFFF' ? '#FFFFFF' : '#14110F', weight: 2.5, lineCap: 'round', className: 'route-leg-flow' }} />
          </>
        )}

        {LETTERS.map((l) => (
          <Marker
            key={l.id + String(activeId === l.id || leg?.to === l.id) + String(!!found?.[l.id])}
            position={l.coords}
            icon={pinIcon(l.id, activeId === l.id || leg?.to === l.id, !!found && !found[l.id] && leg?.to !== l.id)}
            eventHandlers={{ click: () => onSelect?.(l.id) }}
            keyboard
            title={`${l.char} · ${l.place}`}
            zIndexOffset={activeId === l.id || leg?.to === l.id ? 1000 : 0}
          />
        ))}

        {me && <Marker position={me} icon={meIcon} zIndexOffset={2000} interactive={false} />}
        <Controller activeId={activeId} interactive={interactive} leg={leg} me={me} follow={follow} />
      </MapContainer>

      {locate && (
        <div className="absolute top-3 left-3 z-[500] flex flex-col items-start gap-2">
          <button
            onClick={startLocate}
            className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3.5 py-2 text-sm font-bold shadow-[2px_2px_0_0_var(--color-ink)]"
          >
            <Icon name="locate" className={cn('size-4', me && 'text-blue')} /> {me ? 'Konumum' : 'Konumumu göster'}
          </button>
          <AnimatePresence>
            {(away !== null || geoError) && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn('max-w-56 rounded-2xl border-2 border-ink px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0_0_var(--color-ink)]', geoError ? 'bg-sun' : 'bg-white')}
              >
                {geoError ??
                  (away! < 40
                    ? `“${target!.char}” harfinin yanındasın!`
                    : `“${target!.char}” harfine kuş uçuşu ~${away! >= 1000 ? `${(away! / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(away! / 10) * 10} m`}`)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {coarse && !interactive && (
        <button
          onClick={() => setInteractive(true)}
          className="absolute inset-x-0 bottom-3 z-[500] mx-auto flex w-max items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0_var(--color-ink)]"
        >
          <Icon name="map" className="size-4" /> Haritayı kullanmak için dokun
        </button>
      )}
      {coarse && interactive && (
        <button
          onClick={() => setInteractive(false)}
          className="absolute top-3 right-3 z-[500] grid size-10 place-items-center rounded-full border-2 border-ink bg-paper shadow-[2px_2px_0_0_var(--color-ink)]"
          aria-label="Haritayı kilitle"
        >
          <Icon name="lock" className="size-4" />
        </button>
      )}
    </div>
  )
}
