import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import JoinForm from '../components/JoinForm'
import { Glyph, Icon, Page, ProgressWord } from '../components/ui'
import { letterByToken, type Letter } from '../data/letters'
import { formatWalk, nextLetter } from '../data/routes'
import { game, useGame } from '../lib/game'
import { celebrate, cn, EASE } from '../lib/fx'
import NotFound from './NotFound'

type Stage = 'reveal' | 'verify' | 'done' | 'already'

function Rays({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-25"
      style={{ background: `repeating-conic-gradient(from 0deg, ${color} 0deg 8deg, transparent 8deg 22deg)` }}
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      aria-hidden
    />
  )
}

function Quiz({ letter, onSolved }: { letter: Letter; onSolved: () => void }) {
  const [picked, setPicked] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number[]>([])
  const [scope, animate] = useAnimate()

  const pick = (i: number) => {
    if (picked === letter.quiz.answer) return
    setPicked(i)
    if (i === letter.quiz.answer) {
      setTimeout(onSolved, 650)
    } else {
      setWrong((w) => [...w, i])
      navigator.vibrate?.(80)
      animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 })
    }
  }

  return (
    <div ref={scope}>
      <p className="font-display text-2xl leading-tight font-extrabold tracking-tight">{letter.quiz.question}</p>
      <div className="mt-5 grid gap-2.5">
        {letter.quiz.options.map((o, i) => {
          const isRight = picked === letter.quiz.answer && i === letter.quiz.answer
          const isWrong = wrong.includes(i)
          return (
            <motion.button
              key={o}
              onClick={() => pick(i)}
              disabled={isWrong}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex min-h-14 items-center justify-between rounded-2xl border-2 border-ink px-4 py-3 text-left text-lg font-bold transition-colors',
                isRight ? 'text-white' : isWrong ? 'bg-paper-2 text-muted line-through decoration-2' : 'bg-white hover:bg-paper',
              )}
              style={isRight ? { background: letter.color, color: letter.ink } : undefined}
            >
              {o}
              {isRight && (
                <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
                  <Icon name="check" className="size-6" />
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {wrong.length > 0 && picked !== letter.quiz.answer && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 rounded-2xl bg-sun/40 p-3 text-sm font-semibold">
            İpucu: {letter.quiz.hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Photo({ letter, onDone }: { letter: Letter; onDone: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url])

  return (
    <div>
      <p className="font-display text-2xl leading-tight font-extrabold tracking-tight">“{letter.char}” harfiyle bir fotoğraf çek.</p>
      <p className="mt-2 text-muted">Harf karede görünsün yeter. Selfie de olur.</p>
      {/* TODO(backend): fotoğraf yükleme. Şimdilik yalnızca cihazda önizlenir. */}
      <input ref={input} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.target.files?.[0] && setUrl(URL.createObjectURL(e.target.files[0]))} />
      {url ? (
        <motion.div initial={{ opacity: 0, scale: 0.95, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} className="mt-5 overflow-hidden rounded-2xl border-2 border-ink bg-white p-2 pb-8 shadow-[4px_4px_0_0_var(--color-ink)]">
          <img src={url} alt="Çektiğin fotoğraf" className="aspect-[4/3] w-full rounded-lg object-cover" />
        </motion.div>
      ) : (
        <button onClick={() => input.current?.click()} className="mt-5 grid aspect-[4/3] w-full place-items-center rounded-2xl border-2 border-dashed border-ink/40 bg-white text-muted">
          <span className="flex flex-col items-center gap-2 font-bold">
            <Icon name="camera" className="size-10" />
            Kamerayı aç
          </span>
        </button>
      )}
      {url && (
        <div className="mt-6 flex gap-3">
          <button onClick={() => input.current?.click()} className="btn btn-paper flex-1">
            Yeniden çek
          </button>
          <button onClick={onDone} className="btn btn-ink flex-1">
            Onayla <Icon name="check" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function Found() {
  const { token = '' } = useParams()
  const letter = letterByToken(token)
  const { player, found, count, done } = useGame()
  const [stage, setStage] = useState<Stage>(() => (letter && found[letter.id] ? 'already' : 'reveal'))
  const [mode, setMode] = useState<'quiz' | 'photo'>('quiz')

  useEffect(() => {
    if (stage === 'reveal') navigator.vibrate?.([20, 50, 20])
  }, [stage])

  if (!letter) return <NotFound title="Bu QR tanınmadı." text="Kod hasar görmüş olabilir. Harfin yanındaki gönüllüden yardım isteyebilirsin." />

  const complete = (method: 'quiz' | 'photo') => {
    game.markFound(letter.id, method)
    setStage('done')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // tamamlanma durumu store güncellendikten sonra okunur
    setTimeout(() => celebrate(count + 1 >= 5), 450)
  }

  const { letter: next, route: nextRoute } = nextLetter(found)
  const accent = letter.color === '#FFC21A' ? '#B98300' : letter.color

  return (
    <Page className="min-h-svh pb-[calc(env(safe-area-inset-bottom)+3rem)]">
      {/* renkli üst panel */}
      <section
        className={cn('relative isolate flex flex-col items-center justify-end overflow-hidden rounded-b-[2.5rem] border-b-2 border-ink px-4 pt-[calc(env(safe-area-inset-top)+6rem)] pb-10 text-center transition-[min-height] duration-700 ease-out', stage === 'reveal' ? 'min-h-[64svh]' : 'min-h-[34svh]')}
        style={{ background: letter.color, color: letter.ink }}
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Rays color={letter.ink === '#FFFFFF' ? '#ffffff' : '#14110F'} />
        </div>
        <motion.div
          className={cn('transition-[font-size] duration-700 ease-out', stage === 'reveal' ? 'text-[clamp(10rem,58vw,20rem)]' : 'text-[clamp(5.5rem,28vw,10rem)]')}
          initial={{ y: '-90vh', rotate: -30, scale: 0.6 }}
          animate={{ y: 0, rotate: [-30, 8, 0], scale: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 11, delay: 0.1 }}
        >
          <motion.span className="inline-block" animate={{ rotate: [0, -3, 0, 3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}>
            <Glyph letter={letter} color={letter.ink === '#FFFFFF' ? '#FBF6EE' : '#14110F'} />
          </motion.span>
        </motion.div>
        <motion.p className="eyebrow mt-4 opacity-80" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.7 }}>
          {letter.place}
        </motion.p>
        <motion.h1
          className="mt-2 text-[clamp(2.2rem,10vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.04em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6, ease: EASE }}
        >
          {stage === 'done' ? 'Harf senin!' : stage === 'already' ? 'Bu harf zaten sende.' : `“${letter.char}” harfini buldun!`}
        </motion.h1>
      </section>

      <div className="container-x -mt-6 max-w-xl">
        <AnimatePresence mode="wait">
          {stage === 'reveal' && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: 0.8, duration: 0.5, ease: EASE }}>
              <div className="card relative p-6">
                <span className="absolute -top-4 left-6 chip" style={{ background: letter.color, color: letter.ink }}>
                  LÖSEV’den
                </span>
                <p className="mt-2 font-display text-xl leading-snug font-bold sm:text-2xl">{letter.info.replace(/^.+? buldun!\s*/, '')}</p>
              </div>
              <button onClick={() => { setStage('verify'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="btn btn-ink btn-lg mt-6 w-full">
                Harfi doğrula <Icon name="arrow" />
              </button>
            </motion.div>
          )}

          {stage === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45, ease: EASE }} className="card p-5 sm:p-7">
              {!player ? (
                <>
                  <p className="eyebrow" style={{ color: accent }}>Önce kısa bir kayıt</p>
                  <p className="mt-2 mb-5 font-display text-2xl leading-tight font-extrabold">Harfi adına kaydedelim.</p>
                  <JoinForm onDone={() => {}} cta="Kaydol ve devam et" />
                </>
              ) : (
                <>
                  <div className="mb-6 grid grid-cols-2 rounded-full border-2 border-ink p-1" role="tablist">
                    {(['quiz', 'photo'] as const).map((m) => (
                      <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className="relative rounded-full py-2.5 text-sm font-extrabold">
                        {mode === m && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                        <span className={cn('relative flex items-center justify-center gap-2 transition-colors', mode === m ? 'text-paper' : 'text-ink')}>
                          <Icon name={m === 'quiz' ? 'spark' : 'camera'} className="size-4" />
                          {m === 'quiz' ? 'Mini bulmaca' : 'Fotoğraf'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div key={mode} initial={{ opacity: 0, x: mode === 'quiz' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                      {mode === 'quiz' ? <Quiz letter={letter} onSolved={() => complete('quiz')} /> : <Photo letter={letter} onDone={() => complete('photo')} />}
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {(stage === 'done' || stage === 'already') && (
            <motion.div key="done" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <div className="card p-5 pt-7">
                <ProgressWord found={found} highlight={stage === 'done' ? letter.id : undefined} className="text-[clamp(3.6rem,17vw,6.5rem)]" />
                <p className="mt-4 text-center font-display text-lg font-extrabold">{count}/5 harf</p>
              </div>

              {done ? (
                <motion.div className="card mt-6 bg-sun p-6 text-center" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 14 }}>
                  <p className="font-display text-3xl font-extrabold tracking-tight">L-Ö-S-E-V tamam!</p>
                  <p className="mt-2 text-ink/75">Sertifikan ve çekiliş hakkın hazır.</p>
                  <Link to="/sertifika" className="btn btn-ink btn-lg mt-5 w-full">
                    Sertifikamı Al <Icon name="arrow" />
                  </Link>
                </motion.div>
              ) : (
                next && (
                  <motion.div className="card mt-6 p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
                    <p className="eyebrow" style={{ color: next.color === '#FFC21A' ? '#B98300' : next.color }}>
                      Yeni ipucu açıldı · “{next.char}” harfi
                    </p>
                    <p className="mt-3 font-display text-xl leading-snug font-bold">“{next.clue}”</p>
                    {nextRoute && (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper-2 px-3 py-1.5 text-sm font-bold">
                        <Icon name="walk" className="size-4" /> Buradan yürüyerek {formatWalk(nextRoute)}
                      </p>
                    )}
                    <Link to="/oyun" className="btn btn-ink btn-lg mt-6 w-full">
                      Rotayı haritada gör <Icon name="map" />
                    </Link>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Page>
  )
}
