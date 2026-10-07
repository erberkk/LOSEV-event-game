import { useSyncExternalStore } from 'react'
import { EVENT } from '../data/event'
import { LETTER_BY_ID, LETTERS, type LetterId } from '../data/letters'
import { send } from './sync'

/**
 * Oyun durumu. Şimdilik cihazda (localStorage) tutuluyor.
 * Backend bağlanınca `register` ve `markFound` API çağrısına dönüşecek;
 * bileşenler yalnızca `useGame` + `game.*` kullandığı için başka yer değişmez.
 */

export type Player = { id: string; name: string; contact: string; createdAt: number }
export type FoundEntry = { at: number; method: 'quiz' | 'photo' }
export type GameState = {
  player: Player | null
  found: Partial<Record<LetterId, FoundEntry>>
  completedAt?: number
  certNo?: string
}

const KEY = 'losev-izinde:v1'
const EMPTY: GameState = { player: null, found: {} }

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

let state = load()
const listeners = new Set<() => void>()

function set(next: GameState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* gizli sekme vb. — oyun bellekte devam eder */
  }
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load()
      listeners.forEach((l) => l())
    }
  })
}

const rand = (n: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => 'ABCDEFGHJKLMNPRSTUVYZ23456789'[b % 29]).join('')

export const game = {
  register(name: string, contact: string) {
    const player = { id: rand(10), name: name.trim(), contact: contact.trim(), createdAt: Date.now() }
    set({ ...state, player })
    send({ type: 'register', playerId: player.id, name: player.name, contact: player.contact, at: player.createdAt })
  },
  markFound(id: LetterId, method: FoundEntry['method']) {
    if (state.found[id]) return
    const at = Date.now()
    const found = { ...state.found, [id]: { at, method } }
    const completes = LETTERS.every((l) => found[l.id]) && !state.completedAt
    const certNo = completes ? `LSV-KDK-${EVENT.year}-${rand(5)}` : state.certNo
    set({ ...state, found, ...(completes ? { completedAt: at, certNo } : {}) })
    if (state.player) {
      send({ type: 'found', playerId: state.player.id, token: LETTER_BY_ID[id].token, method, at })
      if (completes) send({ type: 'complete', playerId: state.player.id, certNo: certNo!, at })
    }
  },
  reset() {
    set(EMPTY)
  },
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useGame() {
  const s = useSyncExternalStore(subscribe, () => state)
  const count = LETTERS.filter((l) => s.found[l.id]).length
  return { ...s, count, done: count === LETTERS.length }
}
