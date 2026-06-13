# Dokumen Arsitektur Proyek - Like Windows Explorer

Dokumen ini merinci keputusan desain, arsitektur perangkat lunak, pola rancangan (design patterns), dan strategi skalabilitas yang diterapkan pada aplikasi penjelajah berkas hirarkis ini.

---

## 1. Arsitektur Monorepo (Bun Workspaces)

Proyek ini dibangun menggunakan arsitektur monorepo dengan Bun Workspaces. Keuntungan utama dari pendekatan ini adalah:
- Pembagian Tanggung Jawab yang Bersih (Separation of Concerns): Kode dibagi menjadi paket frontend, backend, pengujian, dan kontrak data yang terisolasi.
- Kontrak Tipe Bersama (Shared Types): Paket web dan api mengimpor definisi tipe data langsung dari paket common. Hal ini menjamin konsistensi kontrak data pada waktu kompilasi (compile-time type safety). Jika ada perubahan struktur data pada model backend, TypeScript akan mendeteksi kesalahan pada frontend secara instan sebelum aplikasi dideploy.

Struktur repositori adalah sebagai berikut:
- packages/common: Library berisi DTO (Data Transfer Object) dan tipe data domain.
- packages/api: Aplikasi backend (Elysia.js, Drizzle ORM).
- packages/web: Klien frontend (Vue 3, Vite, Tailwind).
- packages/e2e: Pengujian otomatis Playwright.

---

## 2. Arsitektur Backend (Clean Architecture / Hexagonal)

Paket API dibangun menggunakan prinsip Clean Architecture dengan memisahkan kode menjadi lapisan-lapisan logis yang independen:

### Domain Entities
Terletak di `src/domain/entities/`. Merupakan model data murni (Folder dan File) tanpa dependensi ke framework luar atau pustaka database. Hal ini membuat aturan bisnis inti aman dari perubahan teknologi database atau framework web.

### Repository Interfaces (Ports)
Terletak di `src/repositories/*.interface.ts`. Mendefinisikan kontrak akses data (IFolderRepository dan IFileRepository). Lapisan bisnis (Services) hanya berinteraksi dengan antarmuka ini, tidak peduli database apa yang digunakan di bawahnya.

### Drizzle Repositories (Adapters)
Terletak di `src/repositories/drizzle-*.repository.ts`. Merupakan implementasi konkret dari antarmuka repositori menggunakan Drizzle ORM untuk melakukan kueri ke PostgreSQL. Jika di masa depan database diubah (misalnya ke MongoDB atau Prisma ORM), kita hanya perlu membuat adapter repositori baru tanpa menyentuh kode bisnis di Services.

### Service Layer (Application Logic)
Terletak di `src/services/explorer.service.ts`. Lapisan ini menampung aturan bisnis inti (seperti menyusun path breadcrumbs dan mengelompokkan subfolder/file). Komponen ini menggunakan teknik Dependency Injection (DI) untuk menerima repositori melalui konstruktornya, sehingga sangat mudah untuk diuji menggunakan Mocking.

### Controller Layer (HTTP/Web)
Terletak di `src/controllers/`. Menggunakan Elysia.js untuk memetakan permintaan HTTP ke metode layanan Service. Pengontrol bertugas melakukan validasi skema input (menggunakan validasi bawaan Elysia TypeBox) dan merespons dengan kode HTTP yang sesuai.

---

## 3. Desain Skalabilitas & Optimasi Performa

Salah satu poin penilaian krusial adalah kemampuan sistem dalam menangani jutaan data folder dan file serta ribuan pengguna bersamaan. Optimasi berikut telah diterapkan:

### Pemuatan Tertunda (Lazy Loading) pada Antarmuka
Alih-alih memuat seluruh pohon folder (yang bisa berisi jutaan folder) saat pertama kali aplikasi dibuka, frontend hanya memuat folder tingkat root. Ketika pengguna melakukan ekspansi (klik caret) pada suatu folder di panel kiri, barulah frontend mengirimkan permintaan ke API untuk mengambil subfolder di bawah ID folder tersebut. Hal ini menghemat bandwidth, konsumsi memori browser, dan beban kompilasi DOM secara signifikan.

### Pengecekan Keberadaan Anak (Child Check) Efisien dalam O(1)
Untuk menampilkan indikator caret (panah ekspansi) di sebelah nama folder, aplikasi perlu mengetahui apakah folder tersebut memiliki subfolder di dalamnya.
- Pendekatan Buruk: Melakukan kueri hitung (COUNT) pada database. Perintah `SELECT COUNT(*)` akan memindai seluruh baris data di database yang lambat jika jumlah data jutaan.
- Pendekatan Optimasi: Repositori Drizzle menggunakan kueri subquery `EXISTS`:
  ```sql
  EXISTS(SELECT 1 FROM folders WHERE parent_id = parent.id)
  ```
  Mesin database PostgreSQL akan langsung berhenti memindai setelah menemukan baris pertama yang cocok. Kompleksitas kueri diturunkan menjadi O(1).

### Strategi Pengindeksan (Database Indexing)
Indeks database telah ditambahkan pada kolom pencarian dan relasi induk-anak di berkas skema Drizzle (`folders.ts` & `files.ts`):
- folders_parent_id_idx: Mengoptimalkan kueri pencarian subfolder berdasarkan `parentId` (sangat krusial untuk fitur Lazy Loading).
- folders_parent_name_idx: Indeks komposit pada `parentId` dan `name` untuk mempercepat pengurutan folder berdasarkan abjad di dalam direktori induk tertentu.
- files_folder_id_idx: Mengoptimalkan kueri pengambilan file yang berada di dalam folder tertentu.

### Pencegahan Beban Lebih Melalui Debouncing Klien
Pada input pencarian global frontend, teknik Debounce (300ms) diterapkan. Backend tidak akan dihujani oleh kueri pencarian pada setiap ketukan keyboard pengguna. Backend hanya akan menerima permintaan setelah pengguna selesai mengetik (berhenti menekan tombol selama minimal 300ms).

---

## 4. Strategi Pengujian (Testing Strategy)

Keandalan aplikasi dijamin melalui tiga jenis pengujian otomatis:

### Unit Testing (Backend Service)
Menguji logika bisnis di `ExplorerService` secara terisolasi tanpa koneksi database asli, menggunakan repositori tiruan (mock repositories) untuk memvalidasi kasus seperti penyusunan path breadcrumbs secara rekursif dan pengelompokkan item.

### UI Testing (Component SFC Verification)
Menguji integritas komponen Vue (SFC) secara statis untuk memastikan properti (props), rendering rekursif, dan elemen template terdefinisi dengan benar sesuai desain.

### End-to-End (E2E) Testing (Playwright)
Simulasi otomatis yang menguji seluruh fungsionalitas dari mata pengguna asli:
- Orkestrasi otomatis: Playwright menyalakan API server dan Web server secara mandiri sebelum menjalankan tes.
- Skenario nyata: Mengklik folder di sidebar, melakukan navigasi mendalam dengan double-click pada grid panel kanan, mengetik di bilah pencarian, beralih tampilan tabel, hingga memverifikasi detail modal berkas.
