import { lazy, Suspense, useState } from 'react'
import { motion } from 'motion/react'
import { LETTERS, type LetterId } from '../data/letters'
import { cn } from '../lib/fx'
import { Glyph, Icon, SectionTitle } from '../components/ui'

const RouteMap = lazy(() => import('../components/RouteMap'))

export function MapFallback({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[1.75rem] border-2 border-ink bg-paper-2', className)} />
}

export default function RouteSection() {
  const [active, setActive] = useState<LetterId | undefined>()

  return (
    <section id="rota" className="relative py-20 sm:py-28" aria-label="Rota">
      <div className="container-x">
        <SectionTitle eyebrow="Rota" title={<>İskele’den Moda’ya<br />beş durak.</>} />
        <p className="mt-5 max-w-xl text-lg text-muted">
          Harfler, yoğun yaya akışı ve güvenlik gözetilerek Kadıköy’ün ikonik ve korunaklı noktalarına yerleştiriliyor. İstediğin harften başlayabilirsin.
        </p>
      </div>

      <div className="container-x mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<MapFallback className="h-[58svh] min-h-80 lg:h-[34rem]" />}>
            <RouteMap className="h-[58svh] min-h-80 lg:h-[34rem]" activeId={active} onSelect={setActive} />
          </Suspense>
        </motion.div>

        {/* duraklar: mobilde yatay kaydırma, masaüstünde liste */}
        <ol className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {LETTERS.map((l, i) => (
            <motion.li
              key={l.id}
              className="w-[86%] shrink-0 snap-center sm:w-[46%] lg:w-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <button
                onClick={() => setActive(l.id)}
                aria-pressed={active === l.id}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-3xl border-2 border-ink p-3 pr-4 text-left transition-all duration-200',
                  active === l.id ? 'translate-x-[-2px] translate-y-[-2px] bg-white shadow-[5px_5px_0_0_var(--color-ink)]' : 'bg-paper hover:bg-white',
                )}
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl border-2 border-ink text-5xl" style={{ background: `${l.color}1f` }}>
                  <Glyph letter={l} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="eyebrow text-[10px] text-muted">Durak {i + 1}</span>
                  <span className="line-clamp-2 block font-display text-lg leading-tight font-extrabold">{l.place}</span>
                  <span className="block truncate text-sm text-muted">{l.note}</span>
                </span>
                <Icon name="pin" className="text-ink/40 transition-colors group-hover:text-ink" />
              </button>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
