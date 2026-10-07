# Katılımcı kayıtlarını Google E-Tablo'ya bağlama

Kurulum yaklaşık 5 dakika sürer ve bir kez yapılır. Kayıtlar **LÖSEV'in kendi Google hesabındaki** tabloya düşer; başka hiçbir yerde saklanmaz.

Tabloda her katılımcı bir satır olur:

| Oyuncu ID | Ad Soyad | E-posta / Telefon | Kayıt | L | Ö | S | E | V | Bulunan | Tamamladı | Sertifika No | Son İşlem |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

Harf sütunlarına o harfin bulunduğu saat yazılır. **"Tamamladı" sütunu dolu olanlar çekilişe katılanlardır.**

## Adımlar

1. **Tabloyu açın.** [sheets.new](https://sheets.new) adresine gidin (LÖSEV hesabınızla). Tablonun adını `LÖSEV İzinde – Katılımcılar` yapın.
2. **Script editörünü açın.** Menüden **Uzantılar → Apps Script**'i seçin.
3. **Kodu yapıştırın.** Açılan sayfadaki `Code.gs` içeriğini tamamen silin. Bu klasördeki [`Code.gs`](./Code.gs) dosyasının içeriğini yapıştırın ve 💾 **Kaydet**'e basın.
4. **Tabloyu hazırlayın.**
   - Üstteki fonksiyon listesinden **`kurulum`**'u seçip **Çalıştır**'a basın.
   - Google izin isteyecek: **İzinleri gözden geçir** → hesabınızı seçin.
   - "Google bu uygulamayı doğrulamadı" uyarısı çıkarsa **Gelişmiş → (güvenli değil) sayfasına git** deyin. Bu uyarı, kodu sizin yazdığınız/yapıştırdığınız için çıkar.
   - **İzin ver**'e basın. Tabloda `Katılımcılar` sayfası oluşacak.
5. **Web adresini oluşturun.**
   - Sağ üstte **Dağıt → Yeni dağıtım**'a basın.
   - ⚙️ simgesinden türü **Web uygulaması** seçin.
   - **Şu kullanıcı olarak yürüt:** *Ben*
   - **Erişimi olanlar:** *Herkes*
   - **Dağıt**'a basın ve çıkan **Web uygulaması URL'sini** kopyalayın (`https://script.google.com/macros/s/.../exec`).
6. **Adresi site ekibine gönderin.** Bu adres sitenin ayarlarına (`VITE_SHEET_ENDPOINT`) girilecek.

## Sık sorulanlar

**"Erişimi olanlar: Herkes" tablo herkese açık mı demek?**
Hayır. Bu ayar yalnızca sitenin tabloya **yeni kayıt yazabilmesi** içindir. Adresi açan biri sadece "kayıt servisi çalışıyor" yazısını görür; tablodaki verileri **göremez**. Tablo sizin hesabınızda gizli kalır, istediğiniz kişilerle normal şekilde paylaşabilirsiniz.

**Kodu sonradan değiştirirsem?**
**Dağıt → Dağıtımları yönet → ✏️ → Sürüm: Yeni sürüm → Dağıt** deyin. Adres değişmez.

**Çekiliş listesini nasıl alırım?**
"Tamamladı" sütununa göre filtreleyin ya da **Dosya → İndir → Excel/CSV** ile dışa aktarın.

**KVKK**
Kayıt formunda katılımcıdan aydınlatma metni onayı alınıyor. Metnin içeriği ve verilerin saklanma süresi LÖSEV hukuk ekibi tarafından belirlenmelidir. Etkinlik ve çekiliş bittikten sonra tabloyu silmek ya da anonimleştirmek iyi bir uygulamadır.
