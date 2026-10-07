import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router'
import { motion } from 'motion/react'
import { toPng } from 'html-to-image'
import CertificateCard from '../components/CertificateCard'
import { Icon, Page } from '../components/ui'
import { EVENT } from '../data/event'
import { useGame } from '../lib/game'
import { celebrate, EASE } from '../lib/fx'

export default function Certificate() {
  const { player, done, completedAt, certNo } = useGame()
  const card = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!done) return
    try {
      if (sessionStorage.getItem('cert-cheered')) return
      sessionStorage.setItem('cert-cheered', '1')
    } catch {
      /* yok say */
    }
    const t = setTimeout(() => celebrate(true), 500)
    return () => clearTimeout(t)
  }, [done])

  if (!player || !done) return <Navigate to="/oyun" replace />

  const render = async () => {
    const node = card.current!
    const dataUrl = await toPng(node, { pixelRatio: 1080 / node.offsetWidth, cacheBust: true })
    return dataUrl
  }
  const fileName = `losev-izinde-sertifika-${player.name.toLocaleLowerCase('tr').replace(/\s+/g, '-')}.png`

  const download = async () => {
    setBusy(true)
    try {
      const a = document.createElement('a')
      a.href = await render()
      a.download = fileName
      a.click()
    } finally {
      setBusy(false)
    }
  }

  const share = async () => {
    setBusy(true)
    try {
      const blob = await (await fetch(await render())).blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      const data = { files: [file], title: EVENT.title, text: `Kadıköy’de L-Ö-S-E-V harflerinin hepsini buldum! #LösemiliÇocuklarHaftası` }
      if (navigator.canShare?.(data)) await navigator.share(data)
      else await download()
    } catch {
      /* kullanıcı paylaşımı iptal etti */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page className="min-h-svh pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+3rem)]">
      <div className="container-x max-w-xl text-center">
        <motion.p className="eyebrow text-red" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          Sertifikan
        </motion.p>
        <motion.h1
          className="mt-2 text-[clamp(2.2rem,10vw,4rem)] leading-[0.95] font-extrabold tracking-[-0.04em]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          İzi sonuna kadar sürdün.
        </motion.h1>

        <motion.div
          className="mx-auto mt-8 max-w-md overflow-hidden rounded-[1.25rem] border-2 border-ink shadow-[8px_8px_0_0_var(--color-ink)]"
          initial={{ opacity: 0, y: 60, rotate: -6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.15 }}
        >
          <CertificateCard ref={card} name={player.name} date={completedAt} certNo={certNo} />
        </motion.div>

        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
          <button onClick={download} disabled={busy} className="btn btn-paper btn-lg">
            <Icon name="download" /> İndir
          </button>
          <button onClick={share} disabled={busy} className="btn btn-red btn-lg">
            <Icon name="share" /> Paylaş
          </button>
        </div>

        <motion.div
          className="card mx-auto mt-8 max-w-md bg-sun p-5 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="eyebrow">Çekiliş hakkın tanımlandı</p>
          <p className="mt-2 text-ink/80">Özel atölye/etkinlik davetiyesi çekilişine katılıyorsun. Sonuçlar kayıtta verdiğin iletişim bilgisiyle bildirilecek.</p>
          <p className="mt-3 font-display text-xl font-extrabold tabular-nums">{certNo}</p>
        </motion.div>

        {/* oyun sonu: bir sonraki adım */}
        <motion.section
          className="relative mx-auto mt-10 max-w-md overflow-hidden rounded-[1.75rem] border-2 border-ink bg-navy p-6 text-left text-paper shadow-[6px_6px_0_0_var(--color-ink)] sm:p-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: EASE }}
        >
          <div className="absolute inset-x-0 top-0 flex h-1.5">
            {['#ED1C24', '#FF6A13', '#00AEEF', '#FFC21A', '#FBF6EE'].map((c) => (
              <span key={c} className="flex-1" style={{ background: c }} />
            ))}
          </div>
          <p className="eyebrow text-sun">Hikâye burada bitmesin</p>
          <h2 className="mt-2 text-3xl leading-[1] font-extrabold tracking-[-0.03em]">Bir sonraki izi sen bırak.</h2>
          <p className="mt-3 text-paper/75">Bugün Kadıköy sokaklarında LÖSEV’in izini sürdün. Gönüllü olarak lösemiyle mücadele eden çocukların ve ailelerin yanında olabilirsin.</p>
          <a href={EVENT.volunteerUrl} target="_blank" rel="noreferrer" className="btn btn-red btn-lg mt-6 w-full !border-paper !shadow-[4px_4px_0_0_var(--color-paper)]">
            LÖSEV Gönüllüsü Ol <Icon name="arrow" />
          </a>
          <a href={EVENT.donateUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-paper/85 underline decoration-2 underline-offset-4">
            ya da bağış yaparak destek ol <Icon name="arrow" className="size-4" />
          </a>
        </motion.section>
      </div>
    </Page>
  )
}
