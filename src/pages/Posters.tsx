import { Link } from 'react-router'
import { EVENT, publicUrl } from '../data/event'
import { LETTERS, type Letter } from '../data/letters'
import FancyQr from '../components/FancyQr'
import { Glyph, Icon, Wordmark } from '../components/ui'

/**
 * /afis — Harflerin üzerine basılacak A4 QR panoları + kayıt afişi.
 * Baskı: "Yazdır / PDF" → A4, kenar boşluğu yok. Sunumda "Simüle et" ile QR okutmadan demo yapılır.
 * Ölçüler cqw (pano genişliğinin %'si); A4 yüksekliği = 141,4cqw. İçerik bu sınırın içinde kalacak şekilde ayarlı.
 */

const accentText = (l: Letter) => (l.color === '#FFC21A' ? '#B98300' : l.color)

function LetterPoster({ l, i }: { l: Letter; i: number }) {
  const url = `${publicUrl()}/h/${l.token}`
  return (
    <section className="poster relative mx-auto mb-10 flex aspect-[210/297] w-full max-w-[210mm] flex-col overflow-hidden bg-paper shadow-[8px_8px_0_0_var(--color-ink)] [container-type:inline-size]">
      <div className="h-[2.5cqw] shrink-0" style={{ background: l.color }} />
      <div className="flex min-h-0 flex-1 flex-col px-[7cqw] pt-[5cqw] pb-[4.5cqw]">
        <div className="flex items-center justify-between">
          <Wordmark className="text-[6.5cqw] leading-none" />
          <p className="text-right text-[2.1cqw] leading-tight font-extrabold tracking-[0.15em] uppercase">
            {EVENT.dates} · {EVENT.week}
            <br />
            <span className="text-muted">Durak {i + 1} / 5</span>
          </p>
        </div>

        <div className="mt-[3cqw] flex items-center gap-[5cqw]">
          <span className="shrink-0 text-[30cqw]">
            <Glyph letter={l} />
          </span>
          <div>
            <p className="text-[2.4cqw] font-extrabold tracking-[0.2em] uppercase" style={{ color: accentText(l) }}>
              Harfi buldun!
            </p>
            <p className="mt-[1.2cqw] font-display text-[6.4cqw] leading-[0.95] font-extrabold tracking-[-0.03em]">{l.place}</p>
            <p className="mt-[1.5cqw] text-[2.6cqw] font-semibold text-muted">{l.street}</p>
          </div>
        </div>

        <div className="relative mt-[4.5cqw] rounded-[3cqw] border-[0.45cqw] border-ink px-[4.5cqw] pt-[4cqw] pb-[3.5cqw]">
          <span className="absolute -top-[2.2cqw] left-[4cqw] rounded-full border-[0.4cqw] border-ink px-[2cqw] py-[0.5cqw] text-[2.2cqw] font-extrabold tracking-[0.15em] uppercase" style={{ background: l.color, color: l.ink }}>
            LÖSEV’den
          </span>
          <p className="font-display text-[3.7cqw] leading-[1.15] font-bold">{l.info.replace(/^.+? buldun!\s*/, '')}</p>
        </div>

        <div className="mt-auto grid grid-cols-[auto_1fr] items-center gap-[5cqw] pt-[3cqw]">
          <div className="rounded-[3.5cqw] border-[0.45cqw] border-ink p-[1.4cqw] shadow-[1cqw_1cqw_0_0_var(--color-ink)]" style={{ background: l.color }}>
            <FancyQr value={url} badge={{ kind: 'letter', char: l.char, color: l.color }} className="block w-[37cqw]" />
          </div>
          <ol className="space-y-[2.2cqw] text-[3cqw] leading-tight font-bold">
            {['Telefonunun kamerasıyla QR’ı okut', 'Mini bulmacayı çöz', 'Sıradaki harfin ipucunu aç'].map((t, k) => (
              <li key={t} className="flex items-center gap-[2cqw]">
                <span className="grid size-[6cqw] shrink-0 place-items-center rounded-full border-[0.4cqw] border-ink font-display text-[3cqw] font-extrabold" style={k === 0 ? { background: l.color, color: l.ink } : undefined}>
                  {k + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-[2.5cqw] text-center text-[1.9cqw] font-semibold text-muted">{EVENT.title} · LÖSEV gönüllüleri yanında, yardım istemekten çekinme.</p>
      </div>
    </section>
  )
}

function JoinPoster() {
  const url = `${publicUrl()}/katil`
  return (
    <section className="poster relative mx-auto mb-10 flex aspect-[210/297] w-full max-w-[210mm] flex-col overflow-hidden bg-ink text-paper shadow-[8px_8px_0_0_var(--color-red)] [container-type:inline-size]">
      <div className="flex h-[2.5cqw] shrink-0">
        {LETTERS.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[7cqw] pt-[6cqw] pb-[6cqw]">
        <p className="text-[2.5cqw] font-extrabold tracking-[0.2em] text-sun uppercase">
          {EVENT.dates} · {EVENT.week}
        </p>
        <div className="mt-[5cqw] flex gap-[1cqw] text-[19cqw]">
          {LETTERS.map((l, i) => (
            <span key={l.id} style={{ transform: `rotate(${[-6, 4, -3, 5, -4][i]}deg)` }}>
              <Glyph letter={l} />
            </span>
          ))}
        </div>
        <h1 className="mt-[6cqw] text-[9.5cqw] leading-[0.95] font-extrabold tracking-[-0.04em]">
          Kadıköy’de
          <br />
          LÖSEV’in İzinde
        </h1>
        <p className="mt-[3.5cqw] max-w-[85%] text-[3.4cqw] leading-snug text-paper/80">
          İnsan boyundaki beş harfi Kadıköy sokaklarında bul, QR’ı okut, kelimeyi tamamla. Sertifikanı ve çekiliş hakkını kazan.
        </p>
        <div className="mt-auto flex items-end justify-between gap-[5cqw]">
          <p className="font-display text-[5.5cqw] leading-[1.02] font-extrabold">
            Okut,
            <br />
            oyuna
            <br />
            <span className="text-sun">katıl.</span>
          </p>
          <div className="shrink-0 rounded-[3.5cqw] bg-[conic-gradient(from_45deg,#ED1C24,#FF6A13,#FFC21A,#00AEEF,#1A2B6D,#ED1C24)] p-[1.4cqw]">
            <FancyQr value={url} badge={{ kind: 'wordmark' }} className="block w-[38cqw]" />
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
        <div key={l.id}>
          <div className="no-print mx-auto mb-3 flex max-w-[210mm] items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted">
              Durak {i + 1} · “{l.char}” · {l.short}
            </p>
            <a href={`/h/${l.token}`} className="rounded-full border-2 border-ink bg-sun px-3 py-1.5 text-xs font-extrabold shadow-[2px_2px_0_0_var(--color-ink)]">
              Simüle et →
            </a>
          </div>
          <LetterPoster l={l} i={i} />
        </div>
      ))}
    </main>
  )
}
