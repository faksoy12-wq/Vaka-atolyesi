# Vaka Atölyesi

Kişisel TUS çalışması için çevrimdışı kullanılabilen flashcard uygulaması.

## Kaynak yapısı

- `dist/`: Uygulamanın doğrudan sunulabilir dosyaları.
- `dist/cards.json`: Ders, konu ve flashcard içeriği.
- `dist/assets/`: Kart görselleri ve kaynak önizleme görselleri.
- `research/`: Kart hazırlama, kaynak eşleştirme ve içerik düzenleme yardımcı dosyaları.
- `check*.mjs`: Çalışma ve veri akışına ilişkin doğrulama betikleri.

Uygulamayı yerelde açmak için `dist/` klasörünü bir statik web sunucusuyla sunun. Site kök dizini `dist/` olmalıdır.

## Doğrulama

Node.js kurulu ortamda kök dizinden:

```sh
node check.mjs
node check-repeat.mjs
node check-rounds.mjs
node check-mix.mjs
node check-experience.mjs
```

## İçerik görünürlüğü

Bu GitHub deposu herkese açıktır. Kartlar, kaynak görselleri ve depodaki diğer içerikler de herkes tarafından görüntülenebilir.
