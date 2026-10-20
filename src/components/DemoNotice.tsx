import { useState } from 'react'
import { useLocation } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { DEMO } from '../data/event'
import { Icon } from './ui'

const KEY = 'losev-izinde:demo-notice'

/** Portfolyo yayını: etkinliğin gerçekleşmediğini ilk ziyarette bir kez söyler. */
export default function DemoNotice() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => {
    try {
      return DEMO && !localStorage.getItem(KEY)
    } catch {
      return DEMO
    }
  })
  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* yok say */
    }
  }
  if (pathname === '/afis') return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.75rem)] z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border-2 border-ink bg-sun p-3 pl-4 text-sm shadow-[3px_3px_0_0_var(--color-ink)] sm:top-[calc(env(safe-area-inset-top)+5.25rem)]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1.6 } }}
          exit={{ opacity: 0, y: -12 }}
        >
          <p className="flex-1 leading-snug">
            <b>Konsept çalışma.</b> Bu şehir oyunu LÖSEV için gönüllü olarak tasarlandı; etkinlik gerçekleşmedi. Siteyi gezebilir, oyunu deneyebilirsin. Girdiğin bilgiler hiçbir yere gönderilmez.
          </p>
          <button onClick={close} className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-paper" aria-label="Kapat">
            <Icon name="close" className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
