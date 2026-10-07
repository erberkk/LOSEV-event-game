import { forwardRef } from 'react'
import { EVENT } from '../data/event'
import { LETTERS } from '../data/letters'
import { Glyph, Wordmark } from './ui'

type Props = { name: string; date?: number; certNo?: string }

/** 4:5 oranlı (1080×1350) sertifika. Ölçüler cqw ile kapsayıcıya göre ölçeklenir. */
const CertificateCard = forwardRef<HTMLDivElement, Props>(function CertificateCard({ name, date, certNo }, ref) {
  const d = date ? new Date(date) : new Date()
  return (
    <div ref={ref} className="@container relative aspect-[4/5] w-full overflow-hidden bg-paper text-left text-ink">
      {/* renk şeridi */}
      <div className="absolute inset-x-0 top-0 flex h-[2.2cqw]">
        {LETTERS.map((l) => (
          <span key={l.id} className="flex-1" style={{ background: l.color }} />
        ))}
      </div>

      <div className="absolute inset-[4.5cqw] flex flex-col rounded-[3cqw] border-[0.5cqw] border-ink p-[6cqw]">
        <div className="flex items-start justify-between">
          <Wordmark className="text-[8cqw] leading-none" />
          <p className="text-right text-[2.4cqw] leading-tight font-extrabold tracking-[0.18em] uppercase">
            {EVENT.dates} {EVENT.year}
            <br />
            <span className="text-muted">{EVENT.week}</span>
          </p>
        </div>

        <p className="mt-[8cqw] text-[2.6cqw] font-extrabold tracking-[0.3em] text-red uppercase">Tamamlama Sertifikası</p>

        <div className="mt-[3cqw] flex items-end gap-[1cqw] text-[17cqw]">
          {LETTERS.map((l, i) => (
            <span key={l.id} style={{ transform: `rotate(${[-6, 4, -3, 5, -4][i]}deg)` }}>
              <Glyph letter={l} />
            </span>
          ))}
        </div>

        <p className="mt-[7cqw] text-[3cqw] text-muted">Bu sertifika</p>
        <p className="mt-[1cqw] font-display text-[8.5cqw] leading-[0.95] font-extrabold tracking-[-0.03em] break-words">{name || 'Adın Soyadın'}</p>
        <p className="mt-[3cqw] max-w-[88%] text-[3cqw] leading-snug">
          adlı katılımcının, Kadıköy sokaklarına dağılan <b className="whitespace-nowrap">L-Ö-S-E-V</b> harflerinin tamamını bularak <b>“{EVENT.title}”</b> şehir oyununu tamamladığını onaylar.
        </p>

        <div className="mt-auto flex items-end justify-between gap-[3cqw] border-t-[0.35cqw] border-dashed border-ink/40 pt-[3cqw] text-[2.4cqw]">
          <div>
            <p className="font-extrabold tracking-[0.15em] text-muted uppercase">Tarih</p>
            <p className="font-display text-[3.4cqw] font-bold">{d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="font-extrabold tracking-[0.15em] text-muted uppercase">Sertifika No</p>
            <p className="font-display text-[3.4cqw] font-bold tabular-nums">{certNo ?? 'LSV-KDK-0000-XXXXX'}</p>
          </div>
        </div>
      </div>

      {/* mühür */}
      <div className="absolute top-[37cqw] right-[8cqw] grid size-[20cqw] rotate-12 place-items-center rounded-full border-[0.5cqw] border-dashed border-red text-center text-red">
        <p className="font-display text-[2.3cqw] leading-tight font-extrabold tracking-[0.12em] uppercase">
          Kadıköy
          <br />
          <span className="text-[5cqw] tracking-normal">5/5</span>
          <br />
          Tamam
        </p>
      </div>
    </div>
  )
})

export default CertificateCard
