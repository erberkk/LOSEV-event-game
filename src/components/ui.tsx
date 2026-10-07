import { useLayoutEffect, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { LETTERS, type Letter, type LetterId } from '../data/letters'
import { cn, EASE } from '../lib/fx'

/** Sayfa geçişi. Yalnızca opacity: transform, fixed çocukları bozardı. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className={className}
    >
      {children}
    </motion.main>
  )
}

/** Metin logo. Resmî LÖSEV logosu gelince burası SVG ile değiştirilir. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-display font-extrabold tracking-[-0.04em]', className)} aria-label="LÖSEV">
      <span className="text-red">LÖ</span>
      <span className="text-blue">SEV</span>
    </span>
  )
}

/** Kartonpiyer harf */
export function Glyph({ letter, ghost, className, color }: { letter: Letter; ghost?: boolean; className?: string; color?: string }) {
  return (
    <span
      className={cn(ghost ? 'cardboard-ghost' : 'cardboard', 'inline-block select-none', className)}
      style={ghost ? undefined : { color: color ?? letter.color }}
    >
      {letter.char}
    </span>
  )
}

/** L-Ö-S-E-V ilerleme kelimesi: bulunan harfler renklenip "oturur". */
export function ProgressWord({
  found,
  className,
  highlight,
}: {
  found: Partial<Record<LetterId, unknown>>
  className?: string
  highlight?: LetterId
}) {
  return (
    <div className={cn('flex items-end justify-center gap-[0.06em]', className)} aria-label={`${LETTERS.filter((l) => found[l.id]).length} / 5 harf bulundu`}>
      {LETTERS.map((l, i) => {
        const has = !!found[l.id]
        return (
          <span key={l.id} className="relative inline-grid">
            <Glyph letter={l} ghost className="col-start-1 row-start-1" />
            {has && (
              <motion.span
                className="col-start-1 row-start-1 grid"
                initial={highlight === l.id ? { y: '-140%', rotate: -18, opacity: 0 } : false}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: highlight === l.id ? 0.35 : i * 0.04 }}
              >
                <Glyph letter={l} />
              </motion.span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export function SectionTitle({ eyebrow, title, className, light }: { eyebrow: string; title: ReactNode; className?: string; light?: boolean }) {
  return (
    <div className={className}>
      <motion.p
        className={cn('eyebrow mb-3', light ? 'text-sun' : 'text-red')}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        className="text-[clamp(2.2rem,8vw,4.75rem)] leading-[0.95] font-extrabold tracking-[-0.035em]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
      >
        {title}
      </motion.h2>
    </div>
  )
}

export function Icon({ name, className }: { name: 'arrow' | 'qr' | 'map' | 'check' | 'camera' | 'download' | 'share' | 'close' | 'pin' | 'spark' | 'lock' | 'locate' | 'walk'; className?: string }) {
  const p: Record<string, ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    qr: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
      </>
    ),
    map: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    camera: (
      <>
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    download: <path d="M12 4v11m-5-5 5 5 5-5M5 20h14" />,
    share: <path d="M12 15V4m-4 4 4-4 4 4M6 12v8h12v-8" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    pin: (
      <>
        <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </>
    ),
    spark: <path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6" />,
    locate: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        <circle cx="12" cy="12" r="7.5" />
      </>
    ),
    walk: (
      <>
        <circle cx="13" cy="4.5" r="1.8" />
        <path d="m9 21 2.5-6 2.5 2.5V21M8 12.5l2-4 3.5-1 2.5 3.5 2.5 1M11.5 15l1.5-5.5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={cn('size-5 shrink-0', className)} aria-hidden>
      {p[name]}
    </svg>
  )
}
