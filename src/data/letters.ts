/**
 * OYUN İÇERİĞİ — tek kaynak.
 *
 * Koordinatlar OpenStreetMap verisinden alındı (Ekim 2026).
 * ⚠️ Yayından önce:
 *  - Bilgi mesajları ve bulmaca soruları LÖSEV iletişim ekibince onaylanmalı.
 *  - Koordinatlar saha ekibince kurulum noktasında yeniden ölçülmeli (şu an yaklaşık).
 *  - Token'lar yeniden üretilmeli ve backend'de doğrulanmalı (bkz. README).
 */

export type LetterId = 'L' | 'O' | 'S' | 'E' | 'V'

export type Letter = {
  id: LetterId
  char: string
  /** Harfin kart/pin rengi */
  color: string
  /** Harf rengi üstünde okunacak yazı rengi */
  ink: string
  place: string
  street: string
  /** Haritada ve afişte kısa ad */
  short: string
  note: string
  coords: [number, number]
  /** QR koduna gömülen tahmin edilemez anahtar → /h/:token */
  token: string
  /** Bu harfe yönlendiren sokak ipucu */
  clue: string
  /** QR okutulunca çıkan LÖSEV bilgilendirme mesajı */
  info: string
  quiz: { question: string; options: string[]; answer: number; hint: string }
}

export const LETTERS: Letter[] = [
  {
    id: 'L',
    char: 'L',
    color: '#ED1C24',
    ink: '#FFFFFF',
    place: 'Kadıköy İskele Meydanı',
    street: 'İskele Meydanı',
    short: 'İskele',
    note: 'Simgesel başlangıç noktası',
    coords: [40.9912, 29.0236],
    token: 'kdk-l-7q2kx9',
    clue: 'Vapurların selam verdiği, martıların hiç eksik olmadığı yer. Kadıköy’e denizden giren herkes önce burada adım atar.',
    info: 'L harfini buldun! LÖSEV, Lösemili Çocuklar Sağlık ve Eğitim Vakfı’nın kısaltmasıdır.',
    quiz: {
      question: 'LÖSEV’in baştaki “LÖ” hecesi hangi kelimeden gelir?',
      options: ['Lösemili', 'Lokal', 'Lider'],
      answer: 0,
      hint: 'Vakfın tam adını harfin üzerindeki panoda bulabilirsin.',
    },
  },
  {
    id: 'O',
    char: 'Ö',
    color: '#FF6A13',
    ink: '#FFFFFF',
    place: 'Moda Caddesi Girişi',
    street: 'Moda Cd. / İskenderpaşa Sk. kesişimi',
    short: 'Moda Cd.',
    note: 'Yaya trafiği yüksek',
    coords: [40.9893, 29.0251],
    token: 'kdk-o-m4ht2c',
    clue: 'Moda’ya uzanan caddenin ağzında, kalabalığın hiç dinmediği köşede seni bekliyor.',
    info: 'Ö harfini buldun! 2–8 Kasım, Lösemili Çocuklar Haftası olarak anılıyor. Bu hafta boyunca sen de farkındalığın bir parçasısın.',
    quiz: {
      question: '2–8 Kasım hangi farkındalık haftasıdır?',
      options: ['Lösemili Çocuklar Haftası', 'Orman Haftası', 'Kütüphaneler Haftası'],
      answer: 0,
      hint: 'Bu oyunun adı sana bir ipucu veriyor.',
    },
  },
  {
    id: 'S',
    char: 'S',
    color: '#00AEEF',
    ink: '#FFFFFF',
    place: 'Süreyya Operası Önü',
    street: 'General Asım Gündüz Cd. (Bahariye)',
    short: 'Süreyya',
    note: 'Sanat ve kültür odaklı nokta',
    coords: [40.988, 29.029],
    token: 'kdk-s-p8wv1r',
    clue: 'Bahariye’nin sanat kokan kaldırımında, Kadıköy’ün opera binasının hemen önünde.',
    info: 'S harfini buldun! LÖSEV her yıl binlerce aileye gıda desteği sağlıyor.',
    quiz: {
      question: 'LÖSEV’deki “S” harfi neyi temsil eder?',
      options: ['Spor', 'Sağlık', 'Sanat'],
      answer: 1,
      hint: 'Lösemili Çocuklar ___ ve Eğitim Vakfı.',
    },
  },
  {
    id: 'E',
    char: 'E',
    color: '#FFC21A',
    ink: '#14110F',
    place: 'Sanatçılar Sokağı',
    street: 'Nüzhetefendi Sokak',
    short: 'Sanatçılar Sk.',
    // Alternatif: Kadıköy Tarihi Salı Pazarı girişi
    note: 'Alternatif: Tarihi Salı Pazarı girişi',
    coords: [40.993, 29.0265],
    token: 'kdk-e-z3nd6y',
    clue: 'Kadıköy çarşısının içinde, sanatçıların adını verdiği o renkli sokakta seni bekliyor.',
    info: 'E harfini buldun! LÖSEV, tedavi sürecindeki çocukların ve gençlerin eğitim hayatından kopmaması için çalışıyor.',
    quiz: {
      question: 'LÖSEV’deki “E” harfi neyi temsil eder?',
      options: ['Eğlence', 'Emek', 'Eğitim'],
      answer: 2,
      hint: 'Lösemili Çocuklar Sağlık ve ___ Vakfı.',
    },
  },
  {
    id: 'V',
    char: 'V',
    color: '#1A2B6D',
    ink: '#FFFFFF',
    place: 'Moda Sahil Parkı Girişi',
    street: 'Moda Sahili',
    short: 'Moda Sahil',
    note: 'Açık hava bitiş noktası',
    coords: [40.9804, 29.027],
    token: 'kdk-v-b5jq8a',
    clue: 'Rotanın sonu denizle buluşuyor. Moda sahilinde, gün batımına bakan parkın girişinde.',
    info: 'V harfini buldun! Lösemi tedavisinde kan ve trombosit bağışı hayati önem taşır. Bir bağış, bir çocuğun tedavisine destek olabilir.',
    quiz: {
      question: 'Lösemi tedavisinde hangi bağış hayati önem taşır?',
      options: ['Kitap bağışı', 'Kan ve trombosit bağışı', 'Kıyafet bağışı'],
      answer: 1,
      hint: 'Damarlarımızda dolaşan bir şey.',
    },
  },
]

export const LETTER_BY_ID = Object.fromEntries(LETTERS.map((l) => [l.id, l])) as Record<LetterId, Letter>

export const letterByToken = (token: string) => LETTERS.find((l) => l.token === token.toLowerCase())

/** `from` harfinden sonra sıradaki bulunmamış harf (döngüsel). */
export function nextUnfound(found: Partial<Record<LetterId, unknown>>, from?: LetterId) {
  const start = from ? LETTERS.findIndex((l) => l.id === from) + 1 : 0
  for (let i = 0; i < LETTERS.length; i++) {
    const l = LETTERS[(start + i) % LETTERS.length]
    if (!found[l.id]) return l
  }
  return undefined
}

export const MAP_CENTER: [number, number] = [40.9867, 29.0262]
