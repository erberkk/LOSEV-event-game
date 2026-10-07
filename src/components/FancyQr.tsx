import { useMemo } from 'react'
import QRCode from 'qrcode'

/**
 * Markaya özel QR: "sıvı" modüller (bitişik modüller kaynaşır, yalnızca dışa açık köşeler yuvarlanır),
 * yuvarlatılmış köşe gözleri ve ortada rozet. En yüksek hata düzeltme (H) kullanılır.
 *
 * Okunabilirlik testlerinden çıkan kurallar (qr-scanner / jsQR ile, 160–1600 px + bulanıklık):
 *  - Modüller arasında boşluk bırakma (yuvarlak nokta, küçük kare) → okuma %20'ye düşüyor.
 *  - Köşe gözlerinin içi koyu olmalı; sarı/turuncu/mavi iç göz kontrastı bozuyor.
 *  - Sessiz bölge en az 4 modül.
 *  - Rozet ≤ %22 genişlik sorun çıkarmıyor.
 * Renk vurgusu bu yüzden rozette ve QR'ın dışındaki çerçevede.
 */

type Props = {
  value: string
  badge: { kind: 'letter'; char: string; color: string } | { kind: 'wordmark' }
  className?: string
}

const INK = '#14110F'
const MARGIN = 4
const R = 0.35

function modulePath(x: number, y: number, tl: boolean, tr: boolean, br: boolean, bl: boolean) {
  const a = tl ? R : 0
  const b = tr ? R : 0
  const c = br ? R : 0
  const d = bl ? R : 0
  return (
    `M${x + a} ${y}H${x + 1 - b}` +
    (b ? `a${b} ${b} 0 0 1 ${b} ${b}` : '') +
    `V${y + 1 - c}` +
    (c ? `a${c} ${c} 0 0 1 ${-c} ${c}` : '') +
    `H${x + d}` +
    (d ? `a${d} ${d} 0 0 1 ${-d} ${-d}` : '') +
    `V${y + a}` +
    (a ? `a${a} ${a} 0 0 1 ${a} ${-a}` : '') +
    'Z'
  )
}

export default function FancyQr({ value, badge, className }: Props) {
  const { d, size, bw, bh } = useMemo(() => {
    const qr = QRCode.create(value, { errorCorrectionLevel: 'H' })
    const size = qr.modules.size
    const bw = badge.kind === 'wordmark' ? Math.round(size * 0.36) : Math.round(size * 0.22)
    const bh = badge.kind === 'wordmark' ? Math.round(size * 0.15) : bw
    const bx = (size - bw) / 2
    const by = (size - bh) / 2

    const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7)
    const underBadge = (r: number, c: number) => c + 1 > bx - 0.5 && c < bx + bw + 0.5 && r + 1 > by - 0.5 && r < by + bh + 0.5
    const on = (r: number, c: number) => r >= 0 && c >= 0 && r < size && c < size && !!qr.modules.get(r, c) && !finder(r, c) && !underBadge(r, c)

    let d = ''
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!on(r, c)) continue
        const up = on(r - 1, c)
        const down = on(r + 1, c)
        const left = on(r, c - 1)
        const right = on(r, c + 1)
        d += modulePath(c + MARGIN, r + MARGIN, !up && !left, !up && !right, !down && !right, !down && !left)
      }
    }
    return { d, size, bw, bh }
  }, [value, badge.kind])

  const full = size + MARGIN * 2
  const eyes = [
    [MARGIN, MARGIN],
    [MARGIN + size - 7, MARGIN],
    [MARGIN, MARGIN + size - 7],
  ]
  const bx = MARGIN + (size - bw) / 2
  const by = MARGIN + (size - bh) / 2

  return (
    <svg viewBox={`0 0 ${full} ${full}`} className={className} role="img" aria-label="QR kod">
      <rect width={full} height={full} rx={3} fill="#FFFFFF" />
      <path d={d} fill={INK} />
      {eyes.map(([x, y], i) => (
        <g key={i}>
          <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={2} fill="none" stroke={INK} strokeWidth={1} />
          <rect x={x + 2} y={y + 2} width={3} height={3} rx={1} fill={INK} />
        </g>
      ))}

      {/* rozet */}
      <g transform={`translate(${bx} ${by})`}>
        <rect x={0.45} y={0.45} width={bw} height={bh} rx={bh * 0.3} fill={INK} />
        <rect width={bw} height={bh} rx={bh * 0.3} fill="#FBF6EE" stroke={INK} strokeWidth={0.4} />
        {badge.kind === 'letter' ? (
          <g fontFamily="'Bricolage Grotesque Variable', sans-serif" fontWeight={800} fontSize={bh * 0.84} textAnchor="middle">
            <text x={bw / 2 + bh * 0.04} y={bh * 0.79 + bh * 0.04} fill={INK}>
              {badge.char}
            </text>
            <text x={bw / 2} y={bh * 0.79} fill={badge.color}>
              {badge.char}
            </text>
          </g>
        ) : (
          <text x={bw / 2} y={bh * 0.72} fontFamily="'Bricolage Grotesque Variable', sans-serif" fontWeight={800} fontSize={bh * 0.6} textAnchor="middle" letterSpacing={-0.12}>
            <tspan fill="#ED1C24">LÖ</tspan>
            <tspan fill="#00AEEF">SEV</tspan>
          </text>
        )}
      </g>
    </svg>
  )
}
