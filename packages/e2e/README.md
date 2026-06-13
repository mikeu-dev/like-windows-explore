# Explorer E2E Testing - @explorer/e2e

Paket ini berisi modul pengujian End-to-End (E2E) menggunakan Playwright untuk memvalidasi alur kerja aplikasi secara menyeluruh (dari antarmuka pengguna hingga respons API dan database).

## Orkestrasi Otomatis

Untuk memastikan pengujian berjalan realistis, berkas `playwright.config.ts` dikonfigurasi untuk menjalankan server pengembangan lokal secara otomatis sebelum pengujian dimulai:
- Backend API Server: Dijalankan di port 3001 (`http://127.0.0.1:3001/api/v1/folders`).
- Frontend Client: Dijalankan di port 5173 (`http://localhost:5173`).

Playwright akan menunggu kedua server tersebut siap, mengeksekusi skenario tes, dan kemudian mematikan proses server tersebut secara otomatis setelah tes selesai.

## Skenario Pengujian

Kasus pengujian di berkas `tests/explorer.spec.ts` meliputi:

1. Verifikasi Halaman Utama: Memastikan judul navbar, sidebar navigasi, dan pesan awal "Belum ada folder terpilih" dirender dengan benar.
2. Pengujian Navigasi Folder: Mensimulasikan klik folder di sidebar, memverifikasi pembaruan panel kanan, dan menguji navigasi mendalam (double-click) serta interaksi breadcrumbs untuk kembali ke folder sebelumnya.
3. Pengujian Pencarian Global: Memastikan fitur pencarian dengan filter kata kunci dapat menyaring file/folder secara dinamis dan tombol hapus pencarian berfungsi mengembalikan tampilan semula.
4. Pengujian Mode Tampilan: Memverifikasi perubahan tata letak ketika berpindah dari mode "Grid" ke "Detail List" dan sebaliknya.
5. Pengujian Modal Detail File: Memastikan modal detail file dapat dibuka dengan double-click pada file dan ditutup menggunakan tombol Tutup.

## Instruksi Menjalankan Tes

Pastikan Anda berada di direktori root monorepo saat menjalankan perintah berikut:

### Langkah 1: Pemasangan Browser Playwright
Playwright membutuhkan browser khusus (Chromium, Firefox, Webkit) untuk berjalan. Jalankan perintah berikut satu kali setelah instalasi dependensi monorepo:
```bash
bun --cwd packages/e2e playwright install
```

### Langkah 2: Jalankan Tes (Headless Mode)
Jalankan pengujian secara otomatis tanpa menampilkan jendela browser di latar belakang:
```bash
bun test:e2e
```

### Langkah 3: Jalankan Tes dengan UI Interaktif
Jika Anda ingin melihat jalannya simulasi browser secara visual dan mendebug langkah pengujian satu per satu, jalankan:
```bash
bun --cwd packages/e2e playwright test --ui
```

### Langkah 4: Tampilkan Laporan Pengujian
Jika tes selesai dan Anda ingin melihat laporan visual HTML dari performa tes:
```bash
bun --cwd packages/e2e playwright show-report
```
