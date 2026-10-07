import confetti from 'canvas-confetti'

const COLORS = ['#ED1C24', '#FF6A13', '#00AEEF', '#FFC21A', '#1A2B6D']

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function celebrate(big = false) {
  navigator.vibrate?.(big ? [30, 60, 30, 60, 120] : [25, 40, 60])
  if (reduced()) return
  confetti({ particleCount: big ? 160 : 90, spread: big ? 110 : 75, origin: { y: 0.55 }, colors: COLORS, scalar: 1.15, ticks: 260 })
  if (!big) return
  const end = Date.now() + 1400
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS })
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const EASE = [0.22, 1, 0.36, 1] as const
