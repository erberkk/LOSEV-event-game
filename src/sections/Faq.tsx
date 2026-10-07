import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '../lib/fx'
import { SectionTitle } from '../components/ui'

const SAFETY = [
  { t: 'Her harfte gönüllü', d: 'Her harfin yanında 1–2 LÖSEV gönüllüsü var. Yol sormaktan, yardım istemekten çekinme.' },
  { t: 'Korunaklı noktalar', d: 'Harfler yaya akışı ve güvenlik gözetilerek korunaklı bina ve meydan önlerine kuruluyor.' },
  { t: 'Harflere nazik ol', d: 'Kartonpiyer harflerle fotoğraf çekil ama üzerine tırmanma, yaslanma. Herkes bulabilsin.' },
]

const FAQ = [
  {
    q: 'Harfleri hangi sırayla bulmalıyım?',
    a: 'İstediğin harften başlayabilirsin. Her harfi doğruladığında sıradaki harfin sokak ipucu açılır. Rota İskele’den başlayıp Moda Sahili’nde bitecek şekilde kurgulandı.',
  },
  {
    q: 'Uygulama indirmem gerekiyor mu?',
    a: 'Hayır. Telefonunun kamerasıyla QR’ı okutman yeterli; oyun doğrudan tarayıcında açılır.',
  },
  {
    q: 'QR kodu okutamıyorum, ne yapmalıyım?',
    a: 'Oyun ekranındaki “QR Okut” butonunu deneyebilir ya da harfin yanındaki gönüllüden yardım isteyebilirsin.',
  },
  {
    q: 'Sertifikamı nasıl alırım?',
    a: 'Beşinci harfi de doğruladığın anda sertifikan adına hazırlanır. İndirip sosyal medyada paylaşabilirsin.',
  },
  {
    q: 'İlerlemem kaybolur mu?',
    a: 'İlerlemen kullandığın telefonda kaydedilir. Oyunu aynı telefon ve tarayıcıyla sürdürmen yeterli.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="container-x py-20 sm:py-28" aria-label="Güvenlik ve sorular">
      <SectionTitle eyebrow="Güvenli oyun" title="Sokakta, birlikte." />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {SAFETY.map((s, i) => (
          <motion.div
            key={s.t}
            className="card p-6"
            initial={{ opacity: 0, y: 24, rotate: [-1.5, 1, -0.5][i] }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 150, damping: 18 }}
          >
            <h3 className="text-xl font-extrabold tracking-tight">{s.t}</h3>
            <p className="mt-2 text-muted">{s.d}</p>
          </motion.div>
        ))}
      </div>

      <h3 className="mt-20 mb-6 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Sık sorulanlar</h3>
      <div className="divide-y-2 divide-ink border-y-2 border-ink">
        {FAQ.map((f, i) => {
          const isOpen = open === i
          return (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-6 py-5 text-left font-display text-lg font-bold sm:text-xl"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                {f.q}
                <span className={cn('grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink text-xl transition-all duration-300', isOpen ? 'rotate-45 bg-ink text-paper' : 'bg-paper')} aria-hidden>
                  +
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 text-muted sm:text-lg">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
