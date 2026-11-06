# Yeşil Kargo · Kargo Takip Sistemi

Yeşil Kargo; bir kargo firmasının gönderi kabulünden teslimata kadar tüm süreçlerini yöneten, müşterilerin gönderilerini anlık olarak takip edebildiği web tabanlı kargo takip sistemi.

> İnternet Programlama dersi dönem projesi — Aslı Geçer (2023141068)

## Özellikler

| Rol | İşlevler |
|---|---|
| **Ziyaretçi** | Takip numarası ile üye olmadan kargo sorgulama, rota haritası, ücret hesaplama, şube listesi |
| **Müşteri** | Üyelik, gönderi oluşturma, QR kodlu kargo etiketi, "Kargolarım" (gönderilen ve gelen), adres defteri, teslimat ve kurye puanlama |
| **Şube Personeli** | QR okutarak durum güncelleme, şubede gönderi kabulü, kuryeye gönderi atama |
| **Kurye** | Atanan gönderiler, alıcının 6 haneli doğrulama kodu ile teslimat, teslim edilemedi kaydı |
| **Yönetici** | Dashboard, şube / personel / kurye yönetimi, ücret tarifesi, tüm gönderiler, raporlar |

## Özgün özellikler

**Alıcı kontrolü — "Kargom yolda, planım değişti":** Alıcı, kargo dağıtıma çıkmadan önce teslimatı yönetir:
başka bir iş günü seçer, "şubeden kendim alacağım" der, komşusuna bıraktırır veya yeşil teslimat gününü seçer.
Üye alıcı bunu gönderi detayından, üye olmayan alıcı ise e-postadaki bağlantıdan (`/teslimat-yonet/<takip-no>`)
telefon numarasının son 4 hanesiyle doğrulayarak yapar. Tercih kurye ve şube ekranlarında görünür; "şubeden alacağım"
seçilen gönderiler kuryeye atanmaz, şube personeli doğrulama koduyla şubede teslim eder.

**Yeşil Kargo:** Her gönderinin tahmini karbon ayak izi (şehirler arası taşıma + son kilometre) gösterilir.
Alıcı acil olmayan kargosu için mahallesine haftada bir yapılan toplu dağıtımı ("yeşil teslimat günü") seçebilir.
Şubeden teslim (+15) ve yeşil gün (+10) tercihleri teslimatta yeşil puan kazandırır; puanlar gönderi oluştururken
indirim olarak kullanılır (10 puan = 1 TL, en fazla ücretin %20'si). Yönetici panelinde aylık CO₂ tasarrufu grafiği yer alır.

**Kurye rota optimizasyonu:** Kurye panelinde dağıtımdaki gönderiler en kısa durak sırasına göre dizilir
(kuş uçuşu mesafeyle en yakın komşu + 2-opt sezgiseli). Haritada numaralı duraklar, optimize rota ile atanma sırası
arasındaki km ve CO₂ farkı gösterilir. "Navigasyonu başlat" düğmesi durakları sırasıyla Google Haritalar'a aktarır
(API anahtarı gerekmez). Denemek için: `kurye@demo.com` (Murat Çelik, 7 duraklı Kadıköy rotası) veya `kurye5@demo.com` (Ali Vural, 7 duraklı Çankaya rotası).

**Erişilebilir takip modu:** Üst menüdeki erişilebilirlik simgesiyle tek tıkla açılır; yazılar büyür,
kontrast artar, bağlantıların altı çizilir ve animasyonlar kapanır. Tercih tarayıcıda hatırlanır. Takip ve gönderi detay
sayfalarındaki **"Sesli dinle"** düğmesi, kargonun durumunu tarayıcının konuşma sentezi (Web Speech API) ile Türkçe okur.
Yaşlı ve görme güçlüğü olan kullanıcılar düşünülerek tasarlanmıştır.

Gönderi durum akışı:

```
Gönderi Oluşturuldu → Şubeye Teslim Edildi → Transfer Merkezinde → Varış Şubesinde → Dağıtımda → Teslim Edildi
                                                                                          ↘ Teslim Edilemedi
```

## Teknolojiler

- **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript**
- **Tailwind CSS 4** — mobil uyumlu (responsive) arayüz
- **Leaflet + OpenStreetMap** — gönderi rota haritası
- **qrcode.react / html5-qrcode** — QR kod üretme ve kamerayla okuma
- **Recharts** — yönetici paneli grafikleri
- Planlanan: **PostgreSQL + Prisma**, **Auth.js**, **Resend** (e-posta), **Vercel** (yayın)

## Proje durumu

Bu sürüm **kullanıcı arayüzü aşamasıdır**. Tüm ekranlar çalışır durumdadır ancak veriler
`src/lib/mock-data.ts` içindeki örnek verilerden gelir ve sunucu belleğinde tutulur
(sunucu yeniden başlatıldığında sıfırlanır). Veritabanı, gerçek kimlik doğrulama ve e-posta
gönderimi gerçekleştirim aşamasında eklenecektir.

## Kurulum

Gereksinimler: Node.js 20.9 veya üzeri

```bash
git clone https://github.com/asligg/kargo-takip-sistemi.git
cd kargo-takip-sistemi
npm install
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır.

## Demo hesaplar

Tüm demo hesapların parolası: `demo1234`

Giriş sayfasındaki "Demo hesaplar" kutusundan tüm hesaplar tek tıkla seçilebilir.

| Rol | Hesaplar |
|---|---|
| Müşteri | musteri@demo.com (Elif Yılmaz), mehmet@demo.com, ayse@demo.com, kerem@demo.com |
| Şube Personeli | sube@demo.com (Sivas), kadikoy@demo.com, besiktas@demo.com, cankaya@demo.com, konak@demo.com, kayseri@demo.com, bursa@demo.com, antalya@demo.com, konya@demo.com, samsun@demo.com, trabzon@demo.com |
| Kurye | kurye@demo.com, kurye2@demo.com, kurye4@demo.com (Kadıköy) · kurye3@demo.com (Sivas) · kurye5@demo.com, kurye6@demo.com (Çankaya) · kurye7@demo.com (Konak) · kurye8@demo.com (Kayseri) · kurye9@demo.com (Beşiktaş) · kurye10@demo.com (Bursa) · kurye11@demo.com (Antalya) · kurye12@demo.com (Konya) · kurye13@demo.com (Samsun) · kurye14@demo.com (Trabzon) |
| Yönetici | yonetici@demo.com |

Örnek takip numaraları: `KT2026110301`, `KT2026110310`, `KT2026110288`, `KT2026110277`

Özgün özellikleri denemek için:
- `KT2026110366` ve `KT2026110381` → takip sayfasında "Alıcı mısınız? Teslimatı yönetin" (doğrulama: alıcı telefonunun son 4 hanesi)
- `KT2026110381` → alıcı "şubeden alacağım" dedi; `antalya@demo.com` ile şubede kodla teslim edilebilir
- `KT2026110345` → komşuya bırakılabilir notu (`kurye2@demo.com` ekranında)
- `musteri@demo.com` 120, `kerem@demo.com` 35 yeşil puanla başlar

Kurye ekranında teslimat denemesi için demo doğrulama kodu ekranda gösterilir
(ör. `KT2026110301` için `482913`). Gerçek sistemde kod yalnızca alıcının e-postasına gönderilir.

## Klasör yapısı

```
src/
  app/
    (site)/            # herkese açık sayfalar: ana sayfa, takip, giriş, kayıt, ücret hesapla…
    (panel)/
      musteri/         # müşteri paneli
      sube/            # şube personeli paneli
      kurye/           # kurye paneli
      yonetici/        # yönetici paneli
    actions/           # Server Actions (form işlemleri, sunucu tarafı doğrulama)
  components/
    ui/                # Button, Card, Field gibi ortak bileşenler
    layout/            # site üst menüsü, panel kenar menüsü
    shipment/          # takip formu, durum zaman çizelgesi, harita, QR etiket/okuyucu
    forms/             # gönderi, durum güncelleme, teslimat, yönetim formları
  lib/
    data.ts            # veri erişim katmanı (ileride Prisma ile değiştirilecek)
    auth.ts            # oturum ve rol kontrolü
    mock-data.ts       # örnek veriler
    price.ts           # desi ve ücret hesaplama
    status.ts          # gönderi durumları
```

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim derlemesi alır |
| `npm run start` | Derlenmiş uygulamayı çalıştırır |
| `npm run lint` | ESLint kontrolü |
