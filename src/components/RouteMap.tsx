import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LETTERS, MAP_CENTER, type LetterId } from '../data/letters'
import { cn } from '../lib/fx'
import { Icon } from './ui'

// Prod'da yoğun trafik için anahtarlı bir sağlayıcı önerilir (MapTiler, Stadia vb.) → .env
const TILE_URL = (import.meta.env.VITE_TILE_URL as string | undefined) || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const TILE_ATTR = (import.meta.env.VITE_TILE_ATTRIBUTION as string | undefined) || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

type Props = {
  activeId?: LetterId
  onSelect?: (id: LetterId) => void
  /** Verilirse bulunmayan harfler kesik çizgili "hayalet" pin olur */
  found?: Partial<Record<LetterId, unknown>>
  className?: string
}

function pinIcon(id: LetterId, active: boolean, ghost: boolean) {
  const l = LETTERS.find((x) => x.id === id)!
  return L.divIcon({
    className: '',
    html: `<div class="pin ${active ? 'is-active' : ''} ${ghost ? 'is-ghost' : ''}" style="background:${l.color}"><span style="color:${l.ink}">${l.char}</span></div>`,
    iconSize: [46, 46],
    // -45° dönmüş damla: sivri uç, merkezin köşegen yarısı kadar altında
    iconAnchor: [23, 56],
  })
}

function Controller({ activeId, interactive }: { activeId?: LetterId; interactive: boolean }) {
  const map = useMap()
  useEffect(() => {
    const handlers = [map.dragging, map.touchZoom, map.doubleClickZoom, map.boxZoom, map.keyboard]
    handlers.forEach((h) => (interactive ? h.enable() : h.disable()))
  }, [interactive, map])
  useEffect(() => {
    if (!activeId) return
    const l = LETTERS.find((x) => x.id === activeId)!
    map.flyTo(l.coords, 17, { duration: 0.9 })
  }, [activeId, map])
  return null
}

export default function RouteMap({ activeId, onSelect, found, className }: Props) {
  const coarse = useMemo(() => window.matchMedia('(pointer: coarse)').matches, [])
  const [interactive, setInteractive] = useState(!coarse)
  const bounds = useMemo(() => L.latLngBounds(LETTERS.map((l) => l.coords)).pad(0.18), [])

  return (
    <div className={cn('relative isolate overflow-hidden rounded-[1.75rem] border-2 border-ink shadow-[6px_6px_0_0_var(--color-ink)]', className)}>
      <MapContainer
        center={MAP_CENTER}
        bounds={bounds}
        zoom={15}
        scrollWheelZoom={false}
        zoomControl={!coarse}
        className="map-warm size-full"
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} maxZoom={19} />
        <Polyline
          positions={LETTERS.map((l) => l.coords)}
          pathOptions={{ color: '#14110F', weight: 4, lineCap: 'round', className: 'route-line' }}
        />
        {LETTERS.map((l) => (
          <Marker
            key={l.id + String(activeId === l.id) + String(!!found?.[l.id])}
            position={l.coords}
            icon={pinIcon(l.id, activeId === l.id, !!found && !found[l.id])}
            eventHandlers={{ click: () => onSelect?.(l.id) }}
            keyboard
            title={`${l.char} · ${l.place}`}
            zIndexOffset={activeId === l.id ? 1000 : 0}
          />
        ))}
        <Controller activeId={activeId} interactive={interactive} />
      </MapContainer>

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
