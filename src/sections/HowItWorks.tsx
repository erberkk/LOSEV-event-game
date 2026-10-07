import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { LETTERS } from '../data/letters'
import { Glyph, Icon, SectionTitle } from '../components/ui'

function ArtJoin() {
  return (
    <div className="w-full max-w-60 space-y-2.5">
      {['Adın Soyadın', 'E-posta ya da telefon'].map((t, i) => (
        <motion.div
          key={t}
          className="rounded-xl border-2 border-ink bg-white px-3 py-2.5 text-sm font-semibold text-muted"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.12 }}
        >
          {t}
        </motion.div>
      ))}
      <motion.div className="btn btn-ink w-full text-sm" initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, type: 'spring' }}>
        Başla
      </motion.div>
    </div>
  )
}

function ArtScan() {
  return (
    <div className="relative grid size-40 place-items-center rounded-3xl border-2 border-ink bg-white">
      <Icon name="qr" className="size-24 text-ink" />
      <motion.span
        className="absolute inset-x-3 h-1 rounded-full bg-red shadow-[0_0_14px_3px_rgb(237_28_36/0.45)]"
        animate={{ top: ['14%', '84%', '14%'] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function ArtQuiz() {
  return (
    <div className="w-full max-w-60 space-y-2">
      {['Spor', 'Sağlık', 'Sanat'].map((t, i) => (
        <motion.div
          key={t}
          className="flex items-center justify-between rounded-xl border-2 border-ink px-3 py-2 text-sm font-bold"
          initial={{ backgroundColor: '#ffffff' }}
          whileInView={i === 1 ? { backgroundColor: '#00AEEF', color: '#ffffff' } : {}}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          {t}
          {i === 1 && (
            <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.85, type: 'spring' }}>
              <Icon name="check" />
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function ArtWord() {
  return (
    <div className="flex gap-1 text-6xl sm:text-7xl">
      {LETTERS.map((l, i) => (
        <motion.span
          key={l.id}
          initial={{ y: -60, opacity: 0, rotate: -20 }}
          whileInView={{ y: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Glyph letter={l} />
        </motion.span>
      ))}
    </div>
  )
}

const STEPS: { title: string; text: string; color: string; art: ReactNode }[] = [
  {
    title: 'Kaydını oluştur',
    text: 'Herhangi bir harfin ya da duyuru afişlerinin üzerindeki QR’ı okut, adını yaz. İlk ipucun ve interaktif harita hazır.',
    color: '#FFC21A',
    art: <ArtJoin />,
  },
  {
    title: 'Harfi bul, QR’ı okut',
    text: 'Her harfin üzerinde özel bir QR kod ve LÖSEV’in çalışmalarını anlatan küçük bir bilgi panosu var.',
    color: '#00AEEF',
    art: <ArtScan />,
  },
  {
    title: 'Bulmacayı çöz',
    text: 'Harfi doğrulamak için kısa bir soruyu yanıtla ya da harfle birlikte fotoğraf çek. Sonraki harfin sokak ipucu açılır.',
    color: '#FF6A13',
    art: <ArtQuiz />,
  },
  {
    title: 'Kelimeyi tamamla',
    text: 'Beş harfi bulan herkes anında dijital sertifikasını ve özel atölye/etkinlik çekilişine katılım hakkını kazanır.',
    color: '#ED1C24',
    art: <ArtWord />,
  },
]

export default function HowItWorks() {
  return (
    <section className="container-x py-20 sm:py-28" aria-label="Nasıl oynanır">
      <SectionTitle eyebrow="Nasıl oynanır" title={<>Dört adımda<br />şehir oyunu.</>} />
      <div className="mt-12 space-y-6 sm:mt-16">
        {STEPS.map((s, i) => (
          <div key={s.title} className="sticky" style={{ top: `calc(5.5rem + ${i * 14}px)` }}>
            <motion.article
              className="card grid min-h-[22rem] overflow-hidden sm:min-h-[20rem] sm:grid-cols-2"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            >
              <div className="flex flex-col p-6 sm:p-10">
                <span className="cardboard text-7xl sm:text-8xl" style={{ color: s.color }}>
                  {i + 1}
                </span>
                <h3 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">{s.title}</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">{s.text}</p>
              </div>
              <div className="relative grid min-h-52 place-items-center border-t-2 border-ink p-6 sm:border-t-0 sm:border-l-2" style={{ background: `${s.color}22` }}>
                <div className="absolute inset-0 [background-image:radial-gradient(var(--color-ink)_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                <div className="relative flex w-full justify-center">{s.art}</div>
              </div>
            </motion.article>
          </div>
        ))}
      </div>
    </section>
  )
}
