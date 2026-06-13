# Shared Common Library - @explorer/common

Paket ini merupakan pustaka bersama yang mendefinisikan tipe data TypeScript, DTO (Data Transfer Object), dan antarmuka domain yang digunakan secara konsisten oleh layanan API (backend) dan aplikasi Web (frontend).

## Pola Industri dan Desain

Dalam arsitektur monorepo standar industri, paket sharing type/common ini berfungsi sebagai satu-satunya sumber kebenaran (Single Source of Truth) untuk kontrak komunikasi antara klien dan server. Menjaga paket ini tetap murni berisi definisi tipe data (tanpa logika bisnis atau dependensi eksternal yang besar) memastikan:
- Waktu kompilasi yang sangat cepat.
- Tidak adanya ketergantungan melingkar (circular dependencies).
- Kemudahan pemeliharaan ketika skema data berubah.

## Struktur Berkas

Pustaka ini sangat sederhana dan modular:
- src/types.ts: Mendefinisikan tipe data DTO seperti FolderDTO, FileDTO, FolderContentsDTO, dan SearchResultsDTO.
- src/index.ts: Entry point utama yang mengekspor seluruh modul dari pustaka agar dapat diimpor oleh paket lain.

## Integrasi Monorepo

Paket ini diimpor oleh paket lain menggunakan sistem link lokal workspace Bun pada berkas `package.json` masing-masing:
```json
"dependencies": {
  "@explorer/common": "workspace:*"
}
```
Hal ini memungkinkan perubahan tipe data di paket ini langsung ter-refleksi secara realtime di aplikasi frontend maupun backend tanpa perlu melakukan proses pemublikasian ke registry NPM eksternal.
