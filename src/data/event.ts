export const EVENT = {
  title: 'Kadıköy’de LÖSEV’in İzinde',
  dates: '2–8 Kasım',
  year: 2026,
  week: 'Lösemili Çocuklar Haftası',
  officialSite: 'https://www.losev.org.tr',
}

/** QR kodlarına basılacak kök adres. Prod'da VITE_PUBLIC_URL mutlaka set edilmeli. */
export const publicUrl = () =>
  (import.meta.env.VITE_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin
