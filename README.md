# Kadıköy’de LÖSEV’in İzinde

2–8 Kasım Lösemili Çocuklar Haftası şehir oyunu. İnsan boyundaki L-Ö-S-E-V harfleri Kadıköy’e yerleştiriliyor. Oyuncu QR’ı okutuyor, mini bulmacayı çözüyor ya da fotoğraf çekiyor, sıradaki ipucunu açıyor ve 5 harfi tamamlayınca dijital sertifika ile çekiliş hakkı kazanıyor.

**Teknoloji:** React 19 · Vite · TypeScript · Tailwind v4 · Motion · MapLibre GL (3D vektör harita) · qr-scanner · html-to-image

## Çalıştırma

```bash
npm install
npm run dev          # http://localhost:5173 (aynı ağdaki telefondan da açılır)
npm run dev:https    # telefonda QR kamerasını test etmek için (kamera HTTPS ister)
npm run build        # dist/ → statik hosting (Vercel/Netlify ayarları hazır)
```

## Sayfalar

| Yol | Ne |
|---|---|
| `/` | Tanıtım: kayan harf sahnesi, nasıl oynanır, rota haritası, ödüller, SSS |
| `/katil` | Kayıt (ad, iletişim, KVKK onayı) |
| `/oyun` | Oyuncu paneli: ilerleme, sıradaki ipucu, harita, QR okut |
| `/h/:token` | QR’ın açtığı harf sayfası: LÖSEV mesajı → doğrulama → yeni ipucu |
| `/sertifika` | Kişiye özel sertifika (1080×1350 PNG indir / paylaş) |
| `/afis` | **Basılacak A4 QR panoları** (5 harf + kayıt afişi). Sunumda “Simüle et” ile QR okutmadan demo yapılır |

## Yürüme rotaları

Harfler arasındaki gerçek yürüme rotaları **önceden hesaplanıp** `src/data/routes.json` dosyasına gömülü. Site çalışırken hiçbir rota servisine istek atmıyor. Hesaplama için OpenStreetMap verisiyle çalışan FOSSGIS OSRM yaya profili kullanıldı.

```bash
npm run routes   # letters.ts'te koordinat değişince yeniden çalıştır
```

### Harita ve kademeli keşif

Harita markaya özel çizilmiş 3D bir vektör harita: MapLibre GL + OpenFreeMap (OSM verisi, API anahtarı yok). Stil dosyası `src/map/style.ts`.

- **Ana sayfa:** Kaydırmayla Kadıköy üzerinde sinematik kamera uçuşu. Yalnızca başlangıç (L · İskele) açık. Diğer 4 harf "?" olarak, ~170 m'lik arama alanlarında gösteriliyor; arama alanının merkezi harfin tam yeri değil.
- **Oyunda:** Bulunan harfler pinle işaretleniyor. Sıradaki harf için yalnızca arama alanı var. Sıradaki harf, yürüyerek en yakın bulunmamış harf.
- **"Rotayı göster":** Tam konum açılıyor. Son harften rota ışıklı çizgiyle çiziliyor ve kamera yürüme yönüne dönüyor.
- **"Konumumu göster":** Canlı konum ve sıcak/soğuk göstergesi.
- **"Yol tarifi":** Telefonun haritasında yürüme navigasyonu açılıyor (iOS'ta Apple Haritalar, diğerlerinde Google Maps).
- **2D/3D düğmesi** var. WebGL olmayan cihazlarda ve harita yüklenemezse yedek mesaj gösteriliyor.

> Not: Brieften gelen L→Ö→S→E→V sırası 3,2 km. Başlangıç ve bitişi koruyan L→E→Ö→S→V sırası 2,4 km.

## İçeriği düzenlemek

Tüm oyun içeriği tek dosyada: **`src/data/letters.ts`**. Konumlar, koordinatlar, ipuçları, LÖSEV mesajları ve bulmaca soruları orada. Etkinlik adı, tarih ve yıl `src/data/event.ts` içinde.

## Yayın öncesi kontrol listesi

- [ ] **İçerik onayı:** `letters.ts` içindeki bilgi mesajları ve sorular LÖSEV iletişim ekibince onaylanmalı.
- [ ] **Resmî logo:** `Wordmark` bileşeni (`src/components/ui.tsx`) şu an metin logo. LÖSEV’den SVG logo alınıp değiştirilmeli.
- [ ] **KVKK aydınlatma metni:** `JoinForm.tsx` içindeki TODO. Hukuk ekibinden alınacak metne link verilmeli.
- [ ] **Koordinatlar:** OpenStreetMap’ten alındı. Kurulum günü saha ekibi gerçek harf noktasında doğrulamalı.
- [ ] **`VITE_PUBLIC_URL`:** QR’lara basılacak kalıcı alan adı (`.env.example`). Afişler basıldıktan sonra değişmemeli.
- [ ] **Harita karoları:** OpenFreeMap ücretsiz ve adil kullanım esaslı. Etkinlik trafiği öncesi kendilerine haber vermek ya da `VITE_MAP_TILES` ile başka bir sağlayıcıya geçmek değerlendirilmeli.
- [ ] **Token’lar:** `letters.ts` içindeki QR token’ları yayından önce yeniden üretilmeli.

## Backend (sonraki adım)

Şu an tüm oyun durumu **oyuncunun cihazında** (localStorage) tutuluyor. Bileşenler yalnızca `src/lib/game.ts` içindeki `useGame()` ve `game.*` fonksiyonlarını kullanıyor; backend buraya bağlanacak. Gerekenler:

1. **Kayıt** (`game.register`): Çekiliş için iletişim bilgisinin sunucuda toplanması.
2. **Harf doğrulama** (`game.markFound`): Token kontrolü sunucuda yapılmalı. Şu an token’lar istemci kodunda olduğu için hile yapılabilir.
3. **Fotoğraf yükleme**: `Found.tsx` → `Photo` bileşenindeki TODO.
4. **Çekiliş listesi ve sertifika no** sunucuda üretilmeli.

Hafif seçenek: Supabase (auth gerektirmeyen anonim kayıt + RLS) ya da tek bir serverless fonksiyon + veritabanı.
