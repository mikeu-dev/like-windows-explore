# Explorer Client Web - @explorer/web

Aplikasi frontend penjelajah berkas (File Explorer) ini dibangun menggunakan Vue 3, Vite, dan Tailwind CSS. Aplikasi ini mensimulasikan antarmuka Windows Explorer dengan navigasi interaktif.

## Fitur Antarmuka
- Folder Tree Sidebar: Pohon folder interaktif di panel kiri dengan pemuatan tertunda (lazy loading) dan dukungan penelusuran rekursif tanpa batas.
- Split Pane Layout: Tata letak panel ganda (sidebar navigasi di kiri dan tampilan isi folder di kanan) yang bersih dan responsif.
- Breadcrumbs Nav: Area navigasi alamat yang memperlihatkan alur path aktif dan mendukung lompatan navigasi balik.
- Dual View Mode: Mengubah tampilan isi folder secara instan antara mode "Grid" (ikon besar) dan mode "Detail List" (tabel baris berisi nama, tipe, dan ukuran).
- File Detail Modal: Menampilkan informasi detail berkas (ukuran, tipe, lokasi induk) saat file di-double click.
- Global Search: Kolom pencarian di bagian atas dengan optimasi debounce (300ms) untuk mencari berkas dan folder secara global.

## Struktur Kode Sumber

- src/main.ts: Berkas entri JavaScript utama yang memuat Vue 3.
- src/App.vue: Komponen layout utama yang merapikan seluruh tata letak dan panel navigasi.
- src/assets/main.css: Konfigurasi Tailwind CSS dan variabel tema global.
- src/services/api.ts: Lapisan integrasi klien HTTP untuk melakukan panggilan API ke server backend.
- src/composables/useExplorer.ts: Komponen logic (composable) yang mengelola status aplikasi secara terpusat (state management, event handler, kueri data).
- src/components/: Direktori komponen Vue yang modular:
  - Breadcrumbs.vue: Navigasi alamat berantai.
  - ExplorerSearch.vue: Bilah pencarian global dengan debounced input.
  - FolderTree.vue: Wadah pembungkus pohon folder di sidebar.
  - FolderTreeNode.vue: Komponen rekursif untuk merender node folder individual beserta anak-anaknya.
  - FolderContents.vue: Area tampilan utama untuk merender file dan subfolder (mendukung double click untuk membuka/membuka modal).

## Konfigurasi Gaya (Styling)

Aplikasi ini menggunakan tema gelap (*dark mode*) premium dan konsisten yang diatur di berkas CSS utama. Beberapa variabel CSS kustom didefinisikan untuk interaksi efek hover dan status aktif:
```css
:root {
  --hover-color: rgba(51, 65, 85, 0.4);
  --active-color: #38BDF8;
  --active-text-color: #0F172A;
  --border-color: rgba(51, 65, 85, 0.5);
}
```

## Perintah Pengembangan

Perintah ini dijalankan di dalam direktori `packages/web/`:
- bun dev: Menjalankan dev server Vite (http://localhost:5173).
- bun build: Melakukan kompilasi tipe data TypeScript dan membuat bundel produksi siap dideploy ke direktori `dist/`.
- bun preview: Menjalankan server lokal untuk melihat hasil build produksi.
