import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Hero from '../sections/Hero'
import { Manifesto, Marquee } from '../sections/Story'
import HowItWorks from '../sections/HowItWorks'
import Flyover from '../sections/Flyover'
import Rewards from '../sections/Rewards'
import Week from '../sections/Week'
import Faq from '../sections/Faq'
import Footer from '../components/Footer'
import { Glyph, Icon, Page } from '../components/ui'
import { LETTERS } from '../data/letters'
import { useGame } from '../lib/game'

function FinalCta() {
  const { player, count } = useGame()
  return (
    <section className="relative overflow-hidden py-24 sm:py-36" aria-label="Katıl">
      <div className="container-x text-center">
        <div className="flex justify-center gap-[0.04em] text-[clamp(4rem,20vw,12rem)]">
          {LETTERS.map((l, i) => (
            <motion.span
              key={l.id}
              initial={{ y: 80, opacity: 0, rotate: i % 2 ? 12 : -12 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: i * 0.07 }}
              whileHover={{ y: -12, rotate: i % 2 ? 6 : -6 }}
            >
              <Glyph letter={l} />
            </motion.span>
          ))}
        </div>
        <h2 className="mx-auto mt-10 max-w-2xl text-[clamp(2rem,7vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.035em]">Kelimeyi tamamlamaya hazır mısın?</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">Kaydın bir dakika sürer. Harfler 2–8 Kasım’da Kadıköy’de seni bekliyor.</p>
        <Link to={player ? '/oyun' : '/katil'} className="btn btn-red btn-lg mt-8">
          {player ? `Oyuna dön · ${count}/5` : 'Hemen Katıl'} <Icon name="arrow" />
        </Link>
      </div>
    </section>
  )
}

function MobileCta() {
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  const { player } = useGame()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 900
    // harita uçuşunda kartın üstüne binmesin (son kartta zaten "Oyuna Katıl" var)
    const fly = document.getElementById('rota')
    const inFly = !!fly && y > fly.offsetTop - window.innerHeight * 0.6 && y < fly.offsetTop + fly.offsetHeight - window.innerHeight * 0.4
    setShow(y > window.innerHeight * 2.4 && !nearEnd && !inFly)
  })
  if (player) return null
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:hidden"
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Link to="/katil" className="btn btn-red btn-lg w-full">
            Oyuna Katıl <Icon name="arrow" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default function Home() {
  return (
    <Page>
      <Hero />
      <Marquee />
      <Manifesto />
      <HowItWorks />
      <Flyover />
      <Rewards />
      <Week />
      <Faq />
      <FinalCta />
      <Footer />
      <MobileCta />
    </Page>
  )
}
