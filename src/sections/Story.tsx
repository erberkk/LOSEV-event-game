import { useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { useProgress } from '../lib/useProgress'
import { EVENT } from '../data/event'
import { LETTERS } from '../data/letters'
import { cn } from '../lib/fx'

function MarqueeRow({ items, reverse, className }: { items: string[]; reverse?: boolean; className?: string }) {
  const row = [...items, ...items]
  return (
    <div className={cn('flex overflow-hidden border-y-2 border-ink py-3', className)}>
      <motion.div
        className="flex shrink-0 gap-8 pr-8"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {[row, row].flat().map((t, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8 font-display text-2xl font-extrabold tracking-tight whitespace-nowrap uppercase sm:text-3xl">
            {t}
            <span className="size-3 rotate-45 bg-current" aria-hidden />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export function Marquee() {
  return (
    <div className="relative z-10 -my-4 overflow-hidden py-10" aria-hidden>
      <MarqueeRow className="-rotate-2 bg-red text-white" items={[EVENT.dates, EVENT.week, EVENT.title, '5 harf · 5 sokak · 1 kelime']} />
      <MarqueeRow reverse className="mt-[-6px] rotate-1 bg-blue text-white" items={['QR’ı okut', 'Bulmacayı çöz', 'İpucunu takip et', 'Sertifikanı al']} />
    </div>
  )
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}{' '}
    </motion.span>
  )
}

const MANIFESTO =
  'İnsan boyundaki L-Ö-S-E-V harfleri Kadıköy’ün en canlı sokaklarına yerleşiyor. Her harf bir durak, her durak LÖSEV’in dokunduğu bir hayattan küçük bir hikâye. Harfleri bul, kelimeyi tamamla, farkındalığı şehre yay.'

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null)
  const scrollYProgress = useProgress(ref, ['start 0.85', 'end 0.45'])
  const words = MANIFESTO.split(' ')

  return (
    <section className="container-x py-24 sm:py-36" aria-label="Proje">
      <div className="mb-10 flex items-center gap-3">
        {LETTERS.map((l) => (
          <span key={l.id} className="size-3 rounded-full border-2 border-ink" style={{ background: l.color }} />
        ))}
        <span className="eyebrow ml-2 text-muted">Proje</span>
      </div>
      <p ref={ref} className="font-display text-[clamp(1.75rem,6.2vw,4rem)] leading-[1.06] font-bold tracking-[-0.03em]">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </p>
      <div className="mt-14 grid grid-cols-3 gap-3 sm:gap-6">
        {[
          ['5', 'insan boyunda harf'],
          ['5', 'Kadıköy’de durak'],
          ['7', 'gün sürecek oyun'],
        ].map(([n, t], i) => (
          <motion.div
            key={t}
            className="card p-4 sm:p-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 160, damping: 18 }}
          >
            <p className="cardboard text-[clamp(3rem,13vw,6.5rem)]" style={{ color: LETTERS[[0, 2, 1][i]].color }}>
              {n}
            </p>
            <p className="mt-3 text-sm leading-tight font-bold sm:text-base">{t}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
