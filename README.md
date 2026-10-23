# PPNP Maintenance

Aplikasi mobile untuk mencatat, memantau, dan mengelola laporan kerusakan fasilitas kampus. Aplikasi dibangun dengan React Native melalui Expo dan menyimpan data secara lokal menggunakan SQLite, sehingga dapat digunakan tanpa backend eksternal.

## Fitur

- Dashboard ringkasan jumlah laporan berdasarkan status.
- Pembuatan laporan kerusakan dengan judul, pelapor, deskripsi, kategori, lokasi, dan prioritas.
- Dokumentasi kerusakan melalui kamera atau galeri perangkat.
- Pencarian laporan berdasarkan judul dan penyaringan berdasarkan status.
- Alur penanganan laporan: `Baru` → `Diproses` → `Selesai`.
- Pencatatan nama teknisi, tindakan perbaikan, dan riwayat perubahan status.
- Pengelolaan data master kategori kerusakan dan lokasi fasilitas.
- Database SQLite lokal dengan data awal kategori dan lokasi.

## Teknologi

- React Native `0.86.0`
- Expo `~57.0.0`
- TypeScript `5.8`
- React Navigation
- `expo-sqlite` untuk penyimpanan lokal
- `expo-image-picker` untuk kamera dan galeri

## Prasyarat

- Node.js dan npm
- Expo CLI melalui dependensi proyek
- Android Studio/Android Emulator atau perangkat Android untuk pengujian mobile
- Xcode dan macOS jika ingin menjalankan target iOS

## Instalasi

```bash
git clone <url-repository>
cd PPNPMaintenance
npm install
```

## Menjalankan Aplikasi

Jalankan server pengembangan Expo:

```bash
npm start
```

Perintah target yang tersedia:

```bash
npm run android   # Membuka aplikasi pada Android
npm run ios      # Membuka aplikasi pada iOS
npm run web      # Membuka aplikasi pada web
npm run typecheck
```

Saat aplikasi pertama kali dibuka, database `ppnp_maintenance.db` dibuat secara otomatis. Tabel yang digunakan adalah `categories`, `locations`, `damage_reports`, dan `repair_histories`.

## Struktur Proyek

```text
PPNPMaintenance/
├── App.tsx                    # Entry point dan inisialisasi database
├── app.json                   # Konfigurasi Expo
├── package.json               # Dependensi dan script proyek
└── src/
    ├── database/              # Koneksi dan skema SQLite
    ├── navigation/            # Stack dan bottom-tab navigation
    ├── services/              # Operasi laporan, perbaikan, kategori, lokasi, statistik
    └── types/                 # Tipe data TypeScript
```

## Status Laporan

Setiap laporan memiliki status `Baru`, `Diproses`, atau `Selesai`. Perubahan status dicatat pada tabel riwayat perbaikan bersama teknisi dan tindakan yang dilakukan.

## Catatan

Data tersimpan di perangkat secara lokal. Menghapus data aplikasi atau melakukan reset storage perangkat dapat menghapus database dan seluruh laporan yang tersimpan.

## Lisensi

Belum ditentukan.
