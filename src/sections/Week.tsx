import { useRef } from 'react'
import { motion, useTransform } from 'motion/react'
import { useProgress } from '../lib/useProgress'
import { EVENT } from '../data/event'
import { Icon } from '../components/ui'

export default function Week() {
  const ref = useRef<HTMLElement>(null)
  const scrollYProgress = useProgress(ref, ['start end', 'end start'])
  const x = useTransform(scrollYProgress, [0, 1], ['8%', '-38%'])

  return (
    <section ref={ref} className="relative overflow-hidden bg-navy py-20 text-paper sm:py-32" aria-label="Lösemili Çocuklar Haftası">
      <motion.p
        style={{ x }}
        className="pointer-events-none absolute top-6 left-0 font-display text-[28vw] leading-none font-extrabold tracking-[-0.05em] whitespace-nowrap text-white/[0.06] select-none sm:top-0"
        aria-hidden
      >
        2–8 Kasım 2–8 Kasım
      </motion.p>

      <div className="container-x relative">
        <p className="eyebrow text-sun">Neden 2–8 Kasım?</p>
        <h2 className="mt-3 max-w-3xl text-[clamp(2.2rem,8vw,4.75rem)] leading-[0.95] font-extrabold tracking-[-0.035em]">
          {EVENT.week}.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/80 sm:text-xl">
          Her yıl 2–8 Kasım’da lösemiyle mücadele eden çocuklar ve aileleri için farkındalık yaratılıyor. Lösemi, çocukluk çağında en sık görülen kanser türüdür. Bu hafta Kadıköy’de atacağın her adım, bu mücadeleyi daha görünür kılıyor.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { k: 'Sağlık', t: 'Tedavi süreci boyunca çocukların ve ailelerin yanında.', c: '#ED1C24' },
            { k: 'Eğitim', t: 'Tedavideki çocukların eğitim hayatından kopmaması için.', c: '#FFC21A' },
            { k: 'Destek', t: 'Gıda desteğinden psikososyal desteğe, ailelerle birlikte.', c: '#00AEEF' },
          ].map((c, i) => (
            <motion.div
              key={c.k}
              className="rounded-[1.75rem] border-2 border-paper/25 bg-white/[0.04] p-6 backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <span className="mb-4 block h-1.5 w-12 rounded-full" style={{ background: c.c }} />
              <h3 className="text-2xl font-extrabold">{c.k}</h3>
              <p className="mt-2 text-paper/75">{c.t}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <a href={EVENT.officialSite} target="_blank" rel="noreferrer" className="btn btn-red btn-lg !border-paper !shadow-[4px_4px_0_0_var(--color-paper)]">
            LÖSEV’i daha yakından tanı <Icon name="arrow" />
          </a>
        </div>
      </div>
    </section>
  )
}
