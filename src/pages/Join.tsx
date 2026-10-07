import { Navigate, useNavigate } from 'react-router'
import { motion } from 'motion/react'
import JoinForm from '../components/JoinForm'
import { Glyph, Page } from '../components/ui'
import { LETTERS } from '../data/letters'
import { useGame } from '../lib/game'
import { EASE } from '../lib/fx'

const ROT = [-8, 6, -4, 8, -6]

export default function Join() {
  const { player } = useGame()
  const navigate = useNavigate()
  if (player) return <Navigate to="/oyun" replace />

  return (
    <Page className="relative min-h-svh overflow-hidden pt-[calc(env(safe-area-inset-top)+6rem)] pb-16">
      {/* arka planda süzülen harfler */}
      <div className="pointer-events-none absolute inset-0 -z-10 text-[38vw] opacity-[0.09] sm:text-[22vw]" aria-hidden>
        {LETTERS.map((l, i) => (
          <motion.span
            key={l.id}
            className="absolute"
            style={{ left: `${[2, 62, 18, 70, 36][i]}%`, top: `${[4, 14, 48, 62, 82][i]}%` }}
            animate={{ y: [0, -18, 0], rotate: [ROT[i], ROT[i] + 6, ROT[i]] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Glyph letter={l} />
          </motion.span>
        ))}
      </div>

      <div className="container-x max-w-lg">
        <motion.p className="eyebrow text-red" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          Kayıt · 1 dakika
        </motion.p>
        <motion.h1
          className="mt-3 text-[clamp(2.5rem,11vw,4.5rem)] leading-[0.92] font-extrabold tracking-[-0.04em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
        >
          İzi sürmeye hazır mısın?
        </motion.h1>
        <motion.p className="mt-4 text-lg text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Kaydını oluştur; ilk ipucun ve interaktif harita hemen açılsın.
        </motion.p>

        <motion.div
          className="card mt-8 p-5 sm:p-7"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 20, delay: 0.15 }}
        >
          <JoinForm onDone={() => navigate('/oyun')} />
        </motion.div>
      </div>
    </Page>
  )
}
