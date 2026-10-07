import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { LETTERS } from '../data/letters'
import { useGame } from '../lib/game'
import { cn } from '../lib/fx'
import { Wordmark } from './ui'

export default function Header() {
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { player, found } = useGame()
  const { pathname } = useLocation()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > 24)
    setHidden(y > 320 && y > prev + 4 ? true : y < prev - 4 ? false : hidden)
  })

  if (pathname === '/afis') return null

  return (
    <motion.header
      animate={{ y: hidden ? '-110%' : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
    >
      <div
        className={cn(
          'mx-auto mt-2 flex h-14 w-[calc(100%-1rem)] max-w-6xl items-center justify-between rounded-full px-3 pl-5 transition-all duration-300 sm:mt-3',
          solid || pathname !== '/' ? 'border-2 border-ink bg-paper/85 shadow-[3px_3px_0_0_var(--color-ink)] backdrop-blur-md' : 'border-2 border-transparent',
        )}
      >
        <Link to="/" className="flex items-baseline gap-2" aria-label="Ana sayfa">
          <Wordmark className="text-2xl" />
          <span className="hidden text-xs font-bold tracking-wide text-muted sm:inline">Kadıköy’de İzinde</span>
        </Link>

        {player ? (
          <Link to="/oyun" className="btn btn-paper min-h-10 gap-3 px-4 text-sm" aria-label="Oyuna dön">
            <span className="flex gap-1" aria-hidden>
              {LETTERS.map((l) => (
                <span
                  key={l.id}
                  className="size-2.5 rounded-full border-[1.5px] border-ink transition-colors"
                  style={{ background: found[l.id] ? l.color : 'transparent' }}
                />
              ))}
            </span>
            Oyunum
          </Link>
        ) : (
          pathname !== '/katil' && (
            <Link to="/katil" className="btn btn-red min-h-10 px-5 text-sm">
              Oyuna Katıl
            </Link>
          )
        )}
      </div>
    </motion.header>
  )
}
