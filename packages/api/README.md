# Explorer API Backend - @explorer/api

Layanan backend API ini dibangun menggunakan Elysia.js, Bun, dan Drizzle ORM untuk mengelola struktur data folder dan file di database PostgreSQL.

## Fitur Backend
- REST API yang cepat dengan framework Elysia.js yang berjalan di atas runtime Bun.
- Interaksi database PostgreSQL yang aman tipe menggunakan Drizzle ORM.
- Pencarian global folder dan file dengan kueri teroptimasi.
- Hubungan hirarki folder tak terbatas (self-referencing parent-child).

## Struktur Kode Sumber

Backend ini dirancang dengan arsitektur bersih yang memisahkan logika data, entitas domain, dan pengontrol API:
- src/db/: Konfigurasi database, skema tabel (folders, files), serta skrip pengisian data awal (seeding).
- src/domain/entities/: Entitas data murni untuk Folder dan File.
- src/repositories/: Lapisan akses data (Data Access Layer) yang mengabstraksikan kueri database (menggunakan implementasi Drizzle ORM).
- src/services/: Logika bisnis inti aplikasi (ExplorerService) untuk mengelola data penjelajah berkas.
- src/controllers/: Pengontrol HTTP (Elysia.js) untuk memetakan rute API.
- src/index.ts: Entry point utama server backend.

## Variabel Lingkungan

Layanan ini membutuhkan berkas `.env` di direktori `packages/api/` untuk terhubung ke basis data:
```env
DATABASE_URL="postgres://username:password@127.0.0.1:5432/nama_database"
PORT=3001
```

## Perintah Database (Drizzle)

- bun db:generate: Membuat berkas migrasi SQL berdasarkan skema Drizzle saat ini.
- bun db:push: Sinkronisasi langsung skema Drizzle ke basis data (sangat berguna untuk tahap pengembangan).
- bun db:seed: Menghapus data lama dan memasukkan data sampel awal terstruktur ke dalam database.

## Dokumentasi Endpoint API

Semua rute API terdaftar di bawah prefiks `/api/v1`:

### 1. Ambil Subfolder Tingkat Tertentu
- Rute: GET `/api/v1/folders`
- Parameter Query: `parentId` (string, opsional). Jika null atau diabaikan, akan mengambil folder root.
- Deskripsi: Mengembalikan daftar folder yang berada langsung di bawah parentId.

### 2. Ambil Isi Folder Lengkap (Panel Kanan)
- Rute: GET `/api/v1/folders/:id/contents`
- Parameter Rute: `id` (string, wajib) - ID dari folder yang ditargetkan.
- Deskripsi: Mengembalikan objek berisi array `subfolders` dan `files` di dalam folder tersebut.

### 3. Dapatkan Path Lengkap Folder (Breadcrumbs)
- Rute: GET `/api/v1/folders/:id/path`
- Parameter Rute: `id` (string, wajib) - ID dari folder.
- Deskripsi: Mengembalikan urutan folder induk dari tingkat root hingga folder yang ditentukan untuk merender breadcrumbs.

### 4. Pencarian Global
- Rute: GET `/api/v1/search`
- Parameter Query: `q` (string, wajib) - Teks pencarian (minimal 2 karakter).
- Deskripsi: Mencari folder dan berkas yang memiliki nama yang cocok dengan teks kueri secara case-insensitive.
