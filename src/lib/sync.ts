/**
 * Katılımcı olaylarını LÖSEV'in Google E-Tablosu'na gönderir (apps-script/Code.gs).
 * Adres VITE_SHEET_ENDPOINT ile verilir; yoksa hiçbir şey gönderilmez (yerel demo).
 *
 * Sokakta bağlantı kopabilir: olaylar önce cihazda bir kuyruğa yazılır, gönderilince silinir.
 * Sayfa açılışında ve bağlantı geri geldiğinde kuyruk yeniden denenir.
 */

const ENDPOINT = import.meta.env.VITE_SHEET_ENDPOINT as string | undefined
const KEY = 'losev-izinde:outbox'

export type SyncEvent =
  | { type: 'register'; playerId: string; name: string; contact: string; at: number }
  | { type: 'found'; playerId: string; token: string; method: 'quiz' | 'photo'; at: number }
  | { type: 'complete'; playerId: string; certNo: string; at: number }

function read(): SyncEvent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
function write(q: SyncEvent[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q))
  } catch {
    /* gizli sekme: yine de anında göndermeyi deneriz */
  }
}

let flushing = false

export async function flush() {
  if (!ENDPOINT || flushing) return
  flushing = true
  try {
    let q = read()
    while (q.length) {
      // Apps Script CORS başlığı döndürmez: no-cors + text/plain ile "ateşle ve unut".
      // fetch reddedilmezse istek sunucuya ulaşmıştır.
      await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(q[0]) })
      q = read().slice(1)
      write(q)
    }
  } catch {
    /* çevrimdışı: kuyruk duruyor, sonra tekrar denenecek */
  } finally {
    flushing = false
  }
}

export function send(ev: SyncEvent) {
  if (!ENDPOINT) return
  write([...read(), ev])
  void flush()
}

if (typeof window !== 'undefined' && ENDPOINT) {
  window.addEventListener('online', () => void flush())
  void flush()
}
