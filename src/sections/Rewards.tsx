import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import CertificateCard from '../components/CertificateCard'
import { Icon, SectionTitle } from '../components/ui'

function TiltCertificate() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 15 })
  const glareX = useTransform(mx, [-0.5, 0.5], ['0%', '100%'])
  const glare = useTransform(glareX, (x) => `radial-gradient(circle at ${x} 30%, rgb(255 255 255 / 0.55), transparent 55%)`)

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return
          const r = ref.current!.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width - 0.5)
          my.set((e.clientY - r.top) / r.height - 0.5)
        }}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, rotate: -8, y: 60 }}
        whileInView={{ opacity: 1, rotate: -3, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ type: 'spring', stiffness: 90, damping: 16 }}
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[1.25rem] border-2 border-ink shadow-[10px_10px_0_0_var(--color-ink)]"
      >
        <CertificateCard name="Senin Adın" certNo="LSV-KDK-2026-•••••" />
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />
      </motion.div>
    </div>
  )
}

export default function Rewards() {
  return (
    <section className="relative overflow-hidden bg-paper-2 py-20 sm:py-28" aria-label="Ödüller">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionTitle eyebrow="Ödüller" title={<>Kelimeyi tamamla,<br />hatıran cebinde.</>} />
          <div className="mt-10 space-y-4">
            {[
              {
                icon: 'spark' as const,
                color: '#FFC21A',
                title: 'Dijital rozet ve sertifika',
                text: 'Beş harfi tamamlayan herkese anında, adına özel “LÖSEV İzinde” sertifikası. İndir, paylaş, farkındalığı yay.',
              },
              {
                icon: 'check' as const,
                color: '#00AEEF',
                title: 'Çekiliş hakkı',
                text: 'Oyunu tamamlayan tüm katılımcılar özel atölye/etkinlik davetiyesi çekilişine katılır.',
              },
            ].map((r, i) => (
              <motion.div
                key={r.title}
                className="card flex gap-4 p-5"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 140, damping: 18 }}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-ink" style={{ background: r.color }}>
                  <Icon name={r.icon} className="text-ink" />
                </span>
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">{r.title}</h3>
                  <p className="mt-1 text-muted">{r.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <TiltCertificate />
      </div>
    </section>
  )
}
