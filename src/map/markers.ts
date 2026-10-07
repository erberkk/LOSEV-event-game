import type { Letter } from '../data/letters'

/** MapLibre DOM işaretleri. Stiller index.css → "Harita işaretleri" */

export function letterPin(l: Letter, opts: { found?: boolean; target?: boolean; label?: string; onClick?: () => void }) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = `lpin ${opts.target ? 'is-target' : ''}`
  el.setAttribute('aria-label', `${l.char} harfi`)
  el.innerHTML = `
    ${opts.target ? '<span class="lpin-pulse" style="--c:' + l.color + '"></span>' : ''}
    <span class="lpin-drop" style="background:${l.color}"><span style="color:${l.ink}">${l.char}</span></span>
    ${opts.found ? '<span class="lpin-check">✓</span>' : ''}
    ${opts.label ? `<span class="lpin-label">${opts.label}</span>` : ''}`
  if (opts.onClick) el.addEventListener('click', opts.onClick)
  return el
}

export function mysteryPin(color: string, label?: string) {
  const el = document.createElement('div')
  el.className = 'mpin'
  el.style.setProperty('--c', color)
  el.innerHTML = `<span class="mpin-glow"></span><span class="mpin-core">?</span>${label ? `<span class="lpin-label">${label}</span>` : ''}`
  return el
}

export function meDot() {
  const el = document.createElement('div')
  el.className = 'me-dot'
  return el
}
