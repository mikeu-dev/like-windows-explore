# Like Windows Explorer - Monorepo Workspace

Repositori ini berisi implementasi aplikasi manajemen berkas hirarkis berbasis web yang menyerupai Windows Explorer. Proyek ini dikembangkan dengan arsitektur monorepo menggunakan Bun Workspaces untuk pemisahan fungsionalitas yang bersih dan modular.

## Struktur Workspace

Proyek ini terbagi menjadi empat paket utama di dalam direktori packages:

1. packages/common: Paket pustaka bersama yang berisi kontrak tipe data, DTO (Data Transfer Object), dan definisi antarmuka domain yang digunakan oleh frontend dan backend.
2. packages/api: Layanan backend API yang dibangun menggunakan Elysia.js, Bun, dan Drizzle ORM untuk mengelola struktur data folder dan file di database PostgreSQL.
3. packages/web: Antarmuka pengguna (frontend) yang dibangun menggunakan Vue 3, Vite, dan Tailwind CSS.
4. packages/e2e: Kerangka pengujian End-to-End menggunakan Playwright untuk memvalidasi alur aplikasi secara menyeluruh dari frontend hingga ke database.

## Prasyarat Teknologi

Untuk menjalankan proyek ini secara lokal, Anda memerlukan:
- Bun (versi 1.0.0 atau yang lebih baru)
- PostgreSQL (server database berjalan secara lokal)

---

## Panduan Instalasi dan Memulai Cepat

### Langkah 1: Instalasi Dependensi
Jalankan perintah berikut di direktori root untuk menginstal semua dependensi di seluruh paket workspace secara otomatis:
```bash
bun install
```

### Langkah 2: Konfigurasi Variabel Lingkungan
Buat berkas `.env` di dalam direktori `packages/api/` dan konfigurasikan koneksi database Anda:
```env
DATABASE_URL="postgres://username:password@127.0.0.1:5432/nama_database"
```

### Langkah 3: Setup Database dan Migrasi
Jalankan migrasi database dan masukkan data awal (seeding) melalui perintah di paket API:
```bash
# Lakukan sinkronisasi skema ke database
bun --cwd packages/api db:push

# Jalankan proses seeding data awal
bun --cwd packages/api db:seed
```

### Langkah 4: Jalankan Aplikasi dalam Mode Pengembangan
Untuk menjalankan backend server dan frontend client secara bersamaan dalam mode development, jalankan perintah berikut di direktori root:
```bash
bun dev
```
- Frontend akan berjalan di: http://localhost:5173
- Backend API akan berjalan di: http://127.0.0.1:3001

---

## Daftar Perintah Manajemen Proyek

Seluruh perintah manajemen proyek dapat dijalankan secara terpusat dari direktori root:

### Pengembangan dan Pembuatan
- bun dev: Menjalankan backend server dan frontend client secara paralel.
- bun dev:api: Menjalankan backend server (Elysia.js) saja.
- bun dev:web: Menjalankan frontend client (Vue 3/Vite) saja.
- bun build: Membuat bundel produksi untuk seluruh paket.

### Pengujian dan Kualitas Kode
- bun test: Menjalankan pengujian unit (unit testing) lokal.
- bun test:e2e: Menjalankan seluruh pengujian End-to-End menggunakan Playwright.
- bun check: Memeriksa integritas tipe data TypeScript di seluruh proyek (api, web, e2e, common).
- bun lint: Memeriksa kepatuhan aturan gaya kode menggunakan ESLint.
- bun lint:fix: Memperbaiki kesalahan gaya kode yang dapat diselesaikan otomatis oleh ESLint.
- bun format: Memformat seluruh kode menggunakan Prettier.
- bun format:check: Memeriksa apakah semua berkas telah mengikuti format kode Prettier.
