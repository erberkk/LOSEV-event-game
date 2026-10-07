import { lazy, Suspense, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useInView, useMotionValueEvent } from 'motion/react'
import { useProgress } from '../lib/useProgress'
import { useGame } from '../lib/game'
import { LETTERS } from '../data/letters'
import { EASE, cn } from '../lib/fx'
import { Glyph, Icon } from '../components/ui'
import { supportsWebGL } from '../map/geo'
import ErrorBoundary from '../components/ErrorBoundary'

const FlyoverMap = lazy(() => import('../map/FlyoverMap'))

const STAGES = [
  { until: 0.14, eyebrow: 'Oyun alanı', title: 'Kadıköy, 2–8 Kasım.', text: 'İskele’den Moda sahiline uzanan sokaklar bir hafta boyunca oyun alanı.' },
  { until: 0.34, eyebrow: 'Başlangıç', title: 'Her şey İskele’de başlıyor.', text: 'İlk harf vapurların selam verdiği meydanda seni bekliyor.' },
  { until: 0.86, eyebrow: '4 harf gizli', title: 'Gerisi bu sokaklarda saklanıyor.', text: 'Haritada yalnızca arama alanlarını görürsün. Tam yeri ipuçları söyler; her harfi bulunca sıradakinin ipucu açılır.' },
  { until: 1.01, eyebrow: 'Rota senin', title: 'İzi sür, kelimeyi tamamla.', text: 'Bulamazsan “Rotayı göster” her zaman yanında.' },
]

export default function Flyover() {
  const section = useRef<HTMLElement>(null)
  const near = useInView(section, { margin: '800px 0px', once: true })
  const p = useProgress(section, ['start start', 'end end'])
  const [stage, setStage] = useState(0)
  const { player, count } = useGame()
  const webgl = useRef(supportsWebGL()).current

  useMotionValueEvent(p, 'change', (v) => setStage(STAGES.findIndex((s) => v < s.until)))
  const s = STAGES[Math.max(0, stage)]

  return (
    <section id="rota" ref={section} className="relative h-[420svh]" aria-label="Rota">
      <div className="sticky top-0 h-svh overflow-hidden bg-[#F4ECDF]">
        {webgl && near && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <FlyoverMap progress={p} />
            </Suspense>
          </ErrorBoundary>
        )}
        {/* kenarları kâğıda erit */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-paper via-paper/80 to-transparent sm:h-48" />

        {/* ilerleme */}
        <div className="absolute top-[calc(env(safe-area-inset-top)+5.25rem)] left-1/2 flex -translate-x-1/2 gap-1.5 sm:top-[calc(env(safe-area-inset-top)+6rem)]">
          {STAGES.map((_, i) => (
            <span key={i} className={cn('h-1.5 rounded-full border border-ink transition-all duration-500', i === stage ? 'w-8 bg-ink' : i < stage ? 'w-3 bg-ink' : 'w-3 bg-paper')} />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] px-4 sm:bottom-12">
          <div className="container-x !px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="card max-w-md bg-paper/95 p-5 backdrop-blur-sm sm:p-7"
              >
                <p className="eyebrow text-red">{s.eyebrow}</p>
                <h2 className="mt-2 text-[clamp(1.6rem,6.5vw,2.6rem)] leading-[1] font-extrabold tracking-[-0.03em]">{s.title}</h2>
                <p className="mt-3 text-muted sm:text-lg">{s.text}</p>
                {stage === 1 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-5xl">
                      <Glyph letter={LETTERS[0]} />
                    </span>
                    <span className="text-sm font-bold">Kadıköy İskele Meydanı</span>
                  </div>
                )}
                {stage === 2 && (
                  <div className="mt-4 flex gap-2">
                    {LETTERS.slice(1).map((l) => (
                      <span key={l.id} className="grid size-11 place-items-center rounded-full border-2 border-ink bg-ink font-display text-lg font-extrabold text-paper" style={{ boxShadow: `0 0 0 3px ${l.color}` }}>
                        ?
                      </span>
                    ))}
                  </div>
                )}
                {stage === 3 && (
                  <Link to={player ? '/oyun' : '/katil'} className="btn btn-red mt-5">
                    {player ? `Oyuna dön · ${count}/5` : 'Oyuna Katıl'} <Icon name="arrow" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
