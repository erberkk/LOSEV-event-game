import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Glyph, Icon, Page } from '../components/ui'
import { LETTERS } from '../data/letters'

export default function NotFound({ title = 'Bu sokak çıkmaz.', text = 'Aradığın sayfa burada değil. Ama harfler hâlâ Kadıköy’de seni bekliyor.' }: { title?: string; text?: string }) {
  return (
    <Page className="grid min-h-svh place-items-center px-4 pt-20 text-center">
      <div>
        <motion.div
          className="text-[clamp(7rem,40vw,14rem)]"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -14, -10, -14] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <Glyph letter={LETTERS[1]} />
        </motion.div>
        <h1 className="mt-6 text-[clamp(2rem,8vw,3.5rem)] leading-none font-extrabold tracking-[-0.04em]">{title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">{text}</p>
        <Link to="/" className="btn btn-ink btn-lg mt-8">
          Ana sayfa <Icon name="arrow" />
        </Link>
      </div>
    </Page>
  )
}
