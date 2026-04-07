# YUXA — İlk yayın checklist (sıfırdan)

YUXA, **yeni paket adı** (`com.yuxa.sayisiralama`) ile mağazada **yeni bir uygulama** olarak yayınlanır. Eski ORDIX sürümüne güncelleme olarak bağlanmaz.

## Tamamlanan özellikler

### Oyun
- [x] Sayı sıralama mekaniği (klasik + ek modlar)
- [x] YUXA markası: turuncu tema, `logo-yuxa.png` ikon / splash
- [x] Responsive arayüz
- [x] Ses ve müzik (`expo-av`)
- [x] Haptic feedback
- [x] Animasyonlar ve menü tasarımı

### Çevrimiçi ve ilerleme
- [x] Skor tablosu (Firebase)
- [x] Başarımlar ve istatistikler
- [x] Yerel skor / kullanıcı adı (AsyncStorage)

### Teknik
- [x] `app.json` mağaza ayarları (`version` 1.0.0, Android `versionCode` 1 ile ilk yayına uygun)
- [x] EAS `eas.json` profilleri
- [x] Expo Router + TypeScript

## Yayın adımları

### Android (Google Play — yeni uygulama)
1. [Play Console](https://play.google.com/console) üzerinde **yeni uygulama** oluşturun.
2. Paket adı: **`com.yuxa.sayisiralama`** (manifest / `app.json` ile aynı olmalı).
3. Yerelde `.env` içinde Firebase `EXPO_PUBLIC_*` değişkenlerini doldurun.
4. Derleme:
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform android --profile production
   ```
5. Yükleme: `eas submit --platform android` veya Play Console üzerinden AAB yükleyin.

### iOS (App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Mağaza metni (Türkçe — taslak)

```
YUXA - Sayı Sıralama Oyunu

Sayıları küçükten büyüğe sırala, rekorunu kır, skor tablosunda yüksel ve başarımları topla. Hızlı turlar, net kurallar, zihin egzersizi.

Nasıl oynanır:
• Gelen sayıları doğru sırayla yerleştir
• Hata yapmadan devam et, puan topla
• Liderlik tablosunda yerini gör

Özellikler:
• Skor tablosu ve başarımlar
• Ses, titreşim ve akıcı arayüz
• Farklı ekran boyutlarına uyum
```

**Anahtar kelimeler (örnek):** sayı oyunu, sıralama, bulmaca, zeka, matematik, YUXA

**Kategori:** Oyunlar → Bulmaca / Eğitim

## Görseller
- [ ] Telefon ekran görüntüleri (telefon + istenirse tablet)
- [ ] Feature graphic (Android, 1024×500)
- [ ] 512 ikon Play’e otomatik veya 1024 master (`assets/images/logo-yuxa.png` kaynak)
- [ ] (Opsiyonel) tanıtım videosu

## Yasal
- [ ] Gizlilik politikası URL’i — `privacy-policy/index.html` → `npm run deploy:privacy` (Vercel) sonrası `.env` içine `EXPO_PUBLIC_PRIVACY_POLICY_URL` ekleyin
- [ ] (İsteğe bağlı) kullanım şartları
- [ ] İçerik derecelendirmesi (ör. Herkes / 3+)

## ASO (kısa)
- [ ] Başlık ve kısa açıklama A/B düşünümü
- [ ] Ekran görüntüsü sırası: oynanış → skor tablosu → başarımlar

## Sonraki sürümler (fikir)
- [ ] Çoklu dil
- [ ] Ek oyun modları / temalar

## Destek
- E-posta ve site adreslerinizi buraya yazın (örnek yer tutucu kullanmayın).
