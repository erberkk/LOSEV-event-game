import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion, useTransform, useMotionValue, type MotionValue } from 'motion/react'
import { useProgress } from '../lib/useProgress'
import { EVENT } from '../data/event'
import { LETTERS, type Letter } from '../data/letters'
import { useGame } from '../lib/game'
import { EASE } from '../lib/fx'
import { Glyph, Icon } from '../components/ui'

/**
 * Harflerin dağılınca oturduğu yerler (kutuya oranla).
 * Kadıköy'deki gerçek yerleşimi kabaca taklit eder: İskele kuzeybatıda, Moda Sahil güneyde.
 */
const TARGETS: { x: number; y: number; r: number }[] = [
  { x: 0.18, y: 0.34, r: -12 }, // L · İskele
  { x: 0.34, y: 0.52, r: 9 }, // Ö · Moda Cd.
  { x: 0.78, y: 0.5, r: 7 }, // S · Süreyya
  { x: 0.64, y: 0.3, r: -9 }, // E · Sanatçılar
  { x: 0.46, y: 0.78, r: 11 }, // V · Moda Sahil
]
const DROP_ROT = [-24, 18, -12, 22, -16]

const smooth = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

function HeroLetter({ letter, i, progress }: { letter: Letter; i: number; progress: MotionValue<number> }) {
  const ref = useRef<HTMLSpanElement>(null)
  const dx = useMotionValue(0)
  const dy = useMotionValue(0)
  const t = TARGETS[i]

  useLayoutEffect(() => {
    // Üst bileşenin ref'i bu effect'ten sonra bağlanır; kutuyu DOM'dan buluyoruz
    const el = ref.current!
    const box = el.closest<HTMLElement>('[data-hero-box]')!
    const measure = () => {
      // offset* transform'lardan etkilenmez → harfin dağılmamış (taban) konumu
      let x = el.offsetWidth / 2
      let y = el.offsetHeight / 2
      for (let n: HTMLElement | null = el; n && n !== box; n = n.offsetParent as HTMLElement | null) {
        x += n.offsetLeft
        y += n.offsetTop
      }
      dx.set(t.x * box.clientWidth - x)
      dy.set(t.y * box.clientHeight - y)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(el)
    return () => ro.disconnect()
  }, [dx, dy, t])

  const k = useTransform(progress, (p) => smooth(Math.min(1, Math.max(0, (p - 0.08) / 0.5))))
  const x = useTransform(() => k.get() * dx.get())
  const y = useTransform(() => k.get() * dy.get())
  const rotate = useTransform(k, [0, 1], [0, t.r])
  const scale = useTransform(k, [0, 1], [1, 0.6])
  const labelOpacity = useTransform(progress, [0.5, 0.62], [0, 1])
  const labelY = useTransform(progress, [0.5, 0.62], [12, 0])

  return (
    <motion.span ref={ref} className="relative inline-block" style={{ x, y, rotate, scale }}>
      <motion.span
        className="inline-block"
        initial={{ y: '-110vh', rotate: DROP_ROT[i] }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 13, mass: 1.1, delay: 0.15 + i * 0.09 }}
        whileHover={{ rotate: DROP_ROT[i] / 3, y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
      >
        <Glyph letter={letter} />
      </motion.span>
      <motion.span
        style={{ opacity: labelOpacity, y: labelY }}
        className="absolute top-full left-1/2 mt-[0.12em] flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-ink bg-paper px-[0.35em] py-[0.1em] font-sans text-[0.17em] font-extrabold tracking-tight whitespace-nowrap text-ink shadow-[2px_2px_0_0_var(--color-ink)]"
      >
        <Icon name="pin" className="size-[1.1em]" />
        {letter.short}
      </motion.span>
    </motion.span>
  )
}

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const { player, count } = useGame()
  const p = useProgress(section, ['start start', 'end end'])

  const introOpacity = useTransform(p, [0, 0.12], [1, 0])
  const introY = useTransform(p, [0, 0.12], [0, -30])
  const outroOpacity = useTransform(p, [0.5, 0.64], [0, 1])
  const outroY = useTransform(p, [0.5, 0.64], [20, 0])
  const pathLength = useTransform(p, [0.3, 0.66], [0, 1])
  const gridOpacity = useTransform(p, [0.1, 0.5], [0.0, 0.14])
  const hintOpacity = useTransform(p, [0, 0.05], [1, 0])
  const introPointer = useTransform(introOpacity, (o) => (o < 0.2 ? 'none' : 'auto'))

  const path = TARGETS.map((t, i) => `${i ? 'L' : 'M'}${t.x * 100} ${t.y * 100}`).join(' ')

  return (
    <section ref={section} className="relative h-[250svh]" aria-label="Giriş">
      <div data-hero-box className="sticky top-0 h-svh overflow-hidden">
        {/* sokak ızgarası */}
        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 [background-image:linear-gradient(var(--color-ink)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        {/* yumuşak renk lekeleri */}
        <div className="pointer-events-none absolute -top-1/4 -left-1/4 size-[70vmax] rounded-full bg-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-1/4 -bottom-1/3 size-[70vmax] rounded-full bg-red/10 blur-3xl" />

        <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <mask id="hero-route-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
              <motion.path d={path} fill="none" stroke="white" strokeWidth={8} strokeLinecap="butt" style={{ pathLength }} />
            </mask>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={3}
            strokeDasharray="1 9"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#hero-route-mask)"
          />
        </svg>

        {/* rozet + harfler + başlık: akış düzeni, kısa ekranlarda da çakışmaz */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[clamp(1rem,4svh,2.5rem)] px-4 pt-[calc(env(safe-area-inset-top)+4.5rem)] pb-[calc(env(safe-area-inset-bottom)+3.5rem)]">
          <motion.div style={{ opacity: introOpacity, y: introY }}>
            <motion.span
              className="chip bg-sun"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: EASE }}
            >
              <span className="size-2 animate-pulse rounded-full bg-red" />
              {EVENT.dates} · {EVENT.week}
            </motion.span>
          </motion.div>

          <div className="relative flex justify-center gap-[0.04em] text-[clamp(3.5rem,min(23vw,25svh),15rem)]">
            {LETTERS.map((l, i) => (
              <HeroLetter key={l.id} letter={l} i={i} progress={p} />
            ))}
          </div>

          <motion.div style={{ opacity: introOpacity, y: introY, pointerEvents: introPointer }} className="text-center">
            <motion.h1
              className="text-[clamp(1.75rem,min(7.5vw,6.5svh),4rem)] leading-[1.08] font-extrabold tracking-[-0.035em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8, ease: EASE }}
            >
              Kadıköy’de <span className="text-red">LÖ</span>
              <span className="text-blue">SEV</span>’in İzinde
            </motion.h1>
            <motion.p
              className="mx-auto mt-3 max-w-md text-base font-medium text-muted sm:text-lg [@media(max-height:560px)]:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: EASE }}
            >
              İnsan boyundaki beş harfi sokaklarda bul, QR’ı okut, kelimeyi tamamla.
            </motion.p>
            <motion.div
              className="mt-[clamp(1rem,3svh,1.5rem)] flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.8, ease: EASE }}
            >
              <Link to={player ? '/oyun' : '/katil'} className="btn btn-red btn-lg">
                {player ? `Oyuna dön · ${count}/5` : 'Oyuna Katıl'} <Icon name="arrow" />
              </Link>
              <a href="#rota" className="btn btn-paper btn-lg">
                <Icon name="map" /> Rotayı Gör
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* dağılım sonrası metin */}
        <motion.div style={{ opacity: outroOpacity, y: outroY }} className="absolute inset-x-0 top-[calc(env(safe-area-inset-top)+5.5rem)] px-6 text-center">
          <p className="eyebrow text-red">{EVENT.dates} boyunca</p>
          <p className="mx-auto mt-2 max-w-lg font-display text-[clamp(1.5rem,5.5vw,2.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em]">
            Beş harf, Kadıköy sokaklarına dağılıyor.
          </p>
        </motion.div>

        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] flex flex-col items-center gap-1 text-[10px] font-bold tracking-widest text-muted uppercase [@media(max-height:760px)]:hidden">
          Kaydır
          <span className="relative h-9 w-5 rounded-full border-2 border-ink/40">
            <motion.span
              className="absolute top-1.5 left-1/2 h-2 w-1 -translate-x-1/2 rounded-full bg-ink/60"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  )
}
