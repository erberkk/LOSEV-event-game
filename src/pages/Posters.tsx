import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import QRCode from 'qrcode'
import { EVENT, publicUrl } from '../data/event'
import { LETTERS, type Letter } from '../data/letters'
import { Glyph, Icon, Wordmark } from '../components/ui'

/**
 * /afis — Harflerin üzerine basılacak A4 QR panoları + kayıt afişi.
 * Baskı: Ctrl+P → A4, kenar boşluğu yok. Sunumda QR'ı telefonla okutmak ya da "Simüle et" ile demo yapmak için de kullanılır.
 */

function Qr({ url, className }: { url: string; className?: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'Q', color: { dark: '#14110F', light: '#0000' } }).then(setSvg)
  }, [url])
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
}

function LetterPoster({ l, i }: { l: Letter; i: number }) {
  const url = `${publicUrl()}/h/${l.token}`
  return (
    <section className="poster relative mx-auto mb-10 flex aspect-[210/297] w-full max-w-[210mm] flex-col overflow-hidden bg-paper shadow-[8px_8px_0_0_var(--color-ink)] [container-type:inline-size]">
      <div className="h-[3cqw]" style={{ background: l.color }} />
      <div className="flex flex-1 flex-col p-[7cqw]">
        <div className="flex items-center justify-between">
          <Wordmark className="text-[7cqw] leading-none" />
          <p className="text-right text-[2.3cqw] leading-tight font-extrabold tracking-[0.15em] uppercase">
            {EVENT.dates} · {EVENT.week}
            <br />
            <span className="text-muted">Durak {i + 1} / 5</span>
          </p>
        </div>

        <div className="mt-[5cqw] flex items-end gap-[5cqw]">
          <span className="text-[44cqw]">
            <Glyph letter={l} />
          </span>
          <div className="pb-[4cqw]">
            <p className="text-[2.6cqw] font-extrabold tracking-[0.2em] text-muted uppercase">Harfi buldun!</p>
            <p className="mt-[1cqw] font-display text-[6cqw] leading-[0.95] font-extrabold tracking-[-0.03em]">{l.place}</p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] items-end gap-[6cqw] rounded-[3cqw] border-[0.5cqw] border-ink p-[5cqw]">
          <div>
            <p className="text-[2.4cqw] font-extrabold tracking-[0.2em] uppercase" style={{ color: l.color === '#FFC21A' ? '#B98300' : l.color }}>
              LÖSEV’den
            </p>
            <p className="mt-[2cqw] font-display text-[4.2cqw] leading-[1.12] font-bold">{l.info.replace(/^.+? buldun!\s*/, '')}</p>
            <p className="mt-[4cqw] text-[2.8cqw] font-bold">QR’ı okut → bulmacayı çöz → sıradaki ipucunu aç.</p>
          </div>
          <Qr url={url} className="w-[30cqw] [&_svg]:h-auto [&_svg]:w-full" />
        </div>
        <p className="mt-[2.5cqw] text-center text-[2cqw] text-muted">{EVENT.title}</p>
      </div>
      <a href={`/h/${l.token}`} className="no-print absolute top-[5cqw] right-[5cqw] translate-y-[14cqw] rounded-full border-2 border-ink bg-sun px-3 py-1.5 text-xs font-extrabold shadow-[2px_2px_0_0_var(--color-ink)]">
        Simüle et →
      </a>
    </section>
  )
}

function JoinPoster() {
  const url = `${publicUrl()}/katil`
  return (
    <section className="poster relative mx-auto mb-10 flex aspect-[210/297] w-full max-w-[210mm] flex-col overflow-hidden bg-ink text-paper shadow-[8px_8px_0_0_var(--color-red)] [container-type:inline-size]">
      <div className="flex h-[3cqw]">
        {LETTERS.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>
      <div className="flex flex-1 flex-col p-[7cqw]">
        <p className="text-[2.6cqw] font-extrabold tracking-[0.2em] text-sun uppercase">
          {EVENT.dates} · {EVENT.week}
        </p>
        <div className="mt-[6cqw] flex gap-[1cqw] text-[22cqw]">
          {LETTERS.map((l, i) => (
            <span key={l.id} style={{ transform: `rotate(${[-6, 4, -3, 5, -4][i]}deg)` }}>
              <Glyph letter={l} />
            </span>
          ))}
        </div>
        <h1 className="mt-[8cqw] text-[10cqw] leading-[0.92] font-extrabold tracking-[-0.04em]">
          Kadıköy’de
          <br />
          LÖSEV’in İzinde
        </h1>
        <p className="mt-[4cqw] max-w-[80%] text-[3.6cqw] leading-snug text-paper/80">
          İnsan boyundaki beş harfi Kadıköy sokaklarında bul, QR’ı okut, kelimeyi tamamla. Sertifikanı ve çekiliş hakkını kazan.
        </p>
        <div className="mt-auto flex items-end justify-between gap-[5cqw]">
          <p className="font-display text-[5cqw] leading-tight font-extrabold">
            Okut,
            <br />
            oyuna katıl.
          </p>
          <div className="rounded-[3cqw] bg-paper p-[3cqw]">
            <Qr url={url} className="w-[30cqw] [&_svg]:h-auto [&_svg]:w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Posters() {
  return (
    <main className="min-h-svh bg-paper-2 px-4 py-8 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-8 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-sm font-bold text-muted">
            ← Siteye dön
          </Link>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">QR panoları</h1>
          <p className="text-sm text-muted">
            QR adresi: <code className="font-bold">{publicUrl()}</code>
            {!import.meta.env.VITE_PUBLIC_URL && <span className="text-red"> · baskıdan önce VITE_PUBLIC_URL ayarlanmalı</span>}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn btn-ink">
          <Icon name="download" /> Yazdır / PDF
        </button>
      </div>
      <JoinPoster />
      {LETTERS.map((l, i) => (
        <LetterPoster key={l.id} l={l} i={i} />
      ))}
    </main>
  )
}
