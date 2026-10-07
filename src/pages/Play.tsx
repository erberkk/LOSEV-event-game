import { lazy, Suspense, useCallback, useState } from 'react'
import { Link, Navigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Glyph, Icon, Page, ProgressWord } from '../components/ui'
import { MapFallback } from '../sections/RouteSection'
import { LETTERS, nextUnfound, type LetterId } from '../data/letters'
import { game, useGame } from '../lib/game'
import { cn, EASE } from '../lib/fx'

const RouteMap = lazy(() => import('../components/RouteMap'))
const Scanner = lazy(() => import('../components/Scanner'))

export function useNextLetter() {
  const { found } = useGame()
  const last = (Object.entries(found) as [LetterId, { at: number }][]).sort((a, b) => b[1].at - a[1].at)[0]?.[0]
  return nextUnfound(found, last)
}

export default function Play() {
  const { player, found, count, done } = useGame()
  const next = useNextLetter()
  const [scan, setScan] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [active, setActive] = useState<LetterId | undefined>()
  const closeScan = useCallback(() => setScan(false), [])

  if (!player) return <Navigate to="/katil" replace />
  const first = player.name.split(' ')[0]

  return (
    <Page className="min-h-svh pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+7rem)]">
      <div className="container-x max-w-3xl">
        <motion.p className="eyebrow text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Merhaba {first}
        </motion.p>
        <motion.h1
          className="mt-2 text-[clamp(2rem,9vw,3.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {done ? 'Kelime tamam!' : count === 0 ? 'İz seni bekliyor.' : `${5 - count} harf kaldı.`}
        </motion.h1>

        <div className="card mt-6 overflow-hidden p-5 pt-7 sm:p-8">
          <ProgressWord found={found} className="text-[clamp(4rem,19vw,8.5rem)]" />
          <div className="mt-6 flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-paper-2">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ED1C24,#FF6A13,#00AEEF,#FFC21A,#1A2B6D)] bg-[length:100vw_100%]"
                initial={{ width: 0 }}
                animate={{ width: `${(count / 5) * 100}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.3 }}
              />
            </div>
            <span className="font-display text-lg font-extrabold tabular-nums">{count}/5</span>
          </div>
        </div>

        {done ? (
          <motion.div
            className="card mt-6 bg-sun p-6 sm:p-8"
            initial={{ opacity: 0, y: 20, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 14, delay: 0.2 }}
          >
            <p className="eyebrow">Tebrikler</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Sertifikan hazır.</h2>
            <p className="mt-2 text-ink/75">Çekiliş hakkın da tanımlandı. Sertifikanı indir, paylaş, farkındalığı yay.</p>
            <Link to="/sertifika" className="btn btn-ink btn-lg mt-5">
              Sertifikamı Gör <Icon name="arrow" />
            </Link>
          </motion.div>
        ) : (
          next && (
            <motion.section
              key={next.id}
              className="card relative mt-6 overflow-hidden p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              aria-label="Sıradaki ipucu"
            >
              <span className="pointer-events-none absolute -top-6 -right-3 text-[9rem] opacity-90 sm:text-[11rem]" aria-hidden>
                <Glyph letter={next} ghost />
              </span>
              <p className="eyebrow relative" style={{ color: next.color === '#FFC21A' ? '#B98300' : next.color }}>
                {count === 0 ? 'İlk ipucun' : 'Sıradaki ipucu'} · “{next.char}” harfi
              </p>
              <p className="relative mt-3 max-w-[85%] font-display text-[clamp(1.35rem,5vw,1.9rem)] leading-snug font-bold tracking-tight">“{next.clue}”</p>

              <AnimatePresence initial={false} mode="wait">
                {reveal ? (
                  <motion.button
                    key="place"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActive(next.id)}
                    className="relative mt-5 flex items-center gap-2 rounded-2xl border-2 border-ink bg-white px-4 py-3 text-left font-bold"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink" style={{ background: next.color, color: next.ink }}>
                      <Icon name="pin" className="size-4" />
                    </span>
                    <span>
                      {next.place}
                      <span className="block text-sm font-medium text-muted">{next.street} · haritada göster</span>
                    </span>
                  </motion.button>
                ) : (
                  <motion.button key="btn" exit={{ opacity: 0 }} onClick={() => setReveal(true)} className="relative mt-5 text-sm font-bold underline decoration-2 underline-offset-4">
                    Bulamadın mı? Konumu göster
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.section>
          )
        )}

        <div className="mt-6">
          <Suspense fallback={<MapFallback className="h-[46svh] min-h-72" />}>
            <RouteMap className="h-[46svh] min-h-72" found={found} activeId={active} onSelect={setActive} />
          </Suspense>
        </div>

        <ul className="mt-6 grid gap-2.5">
          {LETTERS.map((l) => {
            const f = found[l.id]
            return (
              <li key={l.id}>
                <button
                  onClick={() => setActive(l.id)}
                  className={cn('flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-colors', f ? 'border-ink bg-white' : 'border-dashed border-ink/30')}
                >
                  <span className="grid size-12 place-items-center text-4xl">
                    <Glyph letter={l} ghost={!f} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{f ? l.place : 'Henüz bulunmadı'}</span>
                    <span className="block text-sm text-muted">
                      {f ? `${new Date(f.at).toLocaleString('tr-TR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })} · ${f.method === 'quiz' ? 'bulmaca' : 'fotoğraf'}` : 'İpuçlarını takip et'}
                    </span>
                  </span>
                  {f && (
                    <span className="grid size-8 place-items-center rounded-full border-2 border-ink" style={{ background: l.color, color: l.ink }}>
                      <Icon name="check" className="size-4" />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <button
          onClick={() => confirm('Tüm ilerlemen ve kaydın bu cihazdan silinecek. Emin misin?') && game.reset()}
          className="mx-auto mt-10 block text-xs font-semibold text-muted underline underline-offset-4"
        >
          Bu cihazdaki oyunu sıfırla
        </button>
      </div>

      {/* sabit QR butonu */}
      {!done && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-paper via-paper/90 to-transparent px-4 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button onClick={() => setScan(true)} className="btn btn-ink btn-lg mx-auto flex w-full max-w-md">
            <Icon name="qr" /> QR Okut
          </button>
        </div>
      )}

      <AnimatePresence>
        {scan && (
          <Suspense>
            <Scanner onClose={closeScan} />
          </Suspense>
        )}
      </AnimatePresence>
    </Page>
  )
}
