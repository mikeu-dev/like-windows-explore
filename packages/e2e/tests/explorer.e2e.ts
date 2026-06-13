import { test, expect } from "@playwright/test";

test.describe("File Explorer App", () => {
  test.beforeEach(async ({ page }) => {
    // Membuka halaman utama aplikasi frontend
    await page.goto("/");
  });

  test("should display initial load state with root folders in sidebar", async ({ page }) => {
    // Verifikasi judul utama
    await expect(page.locator("h1")).toHaveText("File Explorer");
    await expect(page.locator("p.text-explorer-muted")).toHaveText(
      "Sistem Manajemen Folder Hirarkis"
    );

    // Verifikasi sidebar dimuat dan berisi folder utama
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator("text=Documents")).toBeVisible();
    await expect(sidebar.locator("text=Pictures")).toBeVisible();
    await expect(sidebar.locator("text=Music")).toBeVisible();
    await expect(sidebar.locator("text=Downloads")).toBeVisible();

    // Verifikasi pesan "Belum ada folder terpilih" di panel kanan saat awal dimuat
    await expect(page.locator("text=Belum ada folder terpilih")).toBeVisible();
    await expect(
      page.locator(
        "text=Silakan klik salah satu folder di panel navigasi kiri untuk melihat isinya."
      )
    ).toBeVisible();
  });

  test("should navigate to folders and update breadcrumbs & contents", async ({ page }) => {
    // 1. Klik folder "Documents" di sidebar
    await page.locator("aside >> text=Documents").click();

    // Verifikasi breadcrumbs berisi "Ini PC" dan "Documents"
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Ini PC");
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // Verifikasi isi folder "Documents" (Work, Personal, Archive) muncul di panel utama
    const contentPanel = page.locator("main");
    await expect(contentPanel.locator("text=Work")).toBeVisible();
    await expect(contentPanel.locator("text=Personal")).toBeVisible();
    await expect(contentPanel.locator("text=Archive")).toBeVisible();

    // 2. Double-click subfolder "Work" di panel konten utama
    const workFolder = contentPanel.locator('[id^="content-folder-"]:has-text("Work")');
    await workFolder.dblclick();

    // Verifikasi breadcrumbs ter-update dengan "Work"
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // Verifikasi isi folder "Work" (file pdf, docx, xlsx) muncul
    await expect(contentPanel.locator("text=curriculum_vitae.pdf")).toBeVisible();
    await expect(contentPanel.locator("text=project_requirements.docx")).toBeVisible();
    await expect(contentPanel.locator("text=monthly_budget.xlsx")).toBeVisible();

    // 3. Klik "Documents" pada breadcrumb untuk kembali
    await page.locator("#breadcrumbs-nav >> text=Documents").click();

    // Verifikasi konten kembali menampilkan Work, Personal, Archive
    await expect(contentPanel.locator("text=Work")).toBeVisible();
    await expect(contentPanel.locator("text=Personal")).toBeVisible();
    await expect(contentPanel.locator("text=Archive")).toBeVisible();
  });

  test("should perform global search and clear search correctly", async ({ page }) => {
    const searchInput = page.locator("#search-input");
    await expect(searchInput).toBeVisible();

    // Ketik "budget" ke dalam kolom pencarian
    await searchInput.fill("budget");

    // Tunggu debounce dan pastikan header pencarian muncul
    await expect(page.locator('text=Hasil Pencarian untuk: "budget"')).toBeVisible();

    // Pastikan file "monthly_budget.xlsx" muncul di hasil pencarian
    await expect(page.locator("text=monthly_budget.xlsx")).toBeVisible();

    // Pastikan item lain yang tidak cocok tidak muncul
    await expect(page.locator("text=fitness_plan.txt")).not.toBeVisible();

    // Klik tombol hapus/clear pencarian
    const clearBtn = page.locator("#search-clear-btn");
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();

    // Pastikan pencarian kembali bersih
    await expect(searchInput).toHaveValue("");
    await expect(page.locator("text=Belum ada folder terpilih")).toBeVisible();
  });

  test("should toggle view modes between grid and list", async ({ page }) => {
    // Masuk ke folder Documents
    await page.locator("aside >> text=Documents").click();

    // Secara default, view mode adalah Grid. Pastikan view-grid-btn aktif
    const gridBtn = page.locator("#view-grid-btn");
    const listBtn = page.locator("#view-list-btn");
    await expect(gridBtn).toHaveClass(/bg-explorer-active/);

    // Ganti ke tampilan Detail List
    await listBtn.click();
    await expect(listBtn).toHaveClass(/bg-explorer-active/);
    await expect(gridBtn).not.toHaveClass(/bg-explorer-active/);

    // Verifikasi table headers muncul (Nama, Tipe, Ukuran)
    await expect(page.locator('table th:has-text("Nama")')).toBeVisible();
    await expect(page.locator('table th:has-text("Tipe")')).toBeVisible();
    await expect(page.locator('table th:has-text("Ukuran")')).toBeVisible();

    // Kembalikan ke tampilan Grid
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/bg-explorer-active/);
    await expect(page.locator('table th:has-text("Nama")')).not.toBeVisible();
  });

  test("should open and close file detail modal", async ({ page }) => {
    // Masuk ke Documents >> Work
    await page.locator("aside >> text=Documents").click();
    await page.locator('[id^="content-folder-"]:has-text("Work")').dblclick();

    // Double click file "curriculum_vitae.pdf"
    const fileItem = page.locator('[id^="content-file-"]:has-text("curriculum_vitae.pdf")');
    await fileItem.dblclick();

    // Verifikasi modal detail file muncul
    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();
    await expect(modal.locator("h2")).toHaveText("curriculum_vitae.pdf");
    await expect(modal.locator("text=Berkas PDF")).toBeVisible();
    await expect(modal.locator("text=Ukuran File:")).toBeVisible();

    // Klik tombol Tutup untuk menutup modal
    await modal.locator('button:has-text("Tutup")').click();

    // Verifikasi modal tertutup
    await expect(modal).not.toBeVisible();
  });

  test("should navigate using history controls (Back, Forward, Up, Refresh)", async ({ page }) => {
    // 1. Masuk ke Documents
    await page.locator("aside >> text=Documents").click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 2. Masuk ke Work
    await page.locator('[id^="content-folder-"]:has-text("Work")').dblclick();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // 3. Uji Tombol Back
    const backBtn = page.locator('button:has-text("arrow_back")');
    await backBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");
    await expect(page.locator("#breadcrumbs-nav")).not.toContainText("Work");

    // 4. Uji Tombol Forward
    const forwardBtn = page.locator('button:has-text("arrow_forward")');
    await forwardBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Work");

    // 5. Uji Tombol Up
    const upBtn = page.locator('button:has-text("arrow_upward")');
    await upBtn.click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 6. Uji Tombol Refresh
    const refreshBtn = page.locator('button:has-text("refresh")');
    await refreshBtn.click();
    // Memastikan konten Documents (Work, Personal, Archive) tetap ada setelah refresh
    await expect(page.locator("main >> text=Work")).toBeVisible();
  });

  test("should sort items by name correctly", async ({ page }) => {
    // Masuk ke Documents
    await page.locator("aside >> text=Documents").click();
    
    // Pastikan view mode diatur ke Grid agar item terlihat
    const gridBtn = page.locator("#view-grid-btn");
    await gridBtn.click();

    // Pastikan item-item termuat
    await expect(page.locator("main >> text=Work")).toBeVisible();
    await expect(page.locator("main >> text=Personal")).toBeVisible();
    await expect(page.locator("main >> text=Archive")).toBeVisible();

    // Klik tombol Sort
    const sortBtn = page.locator('button:has-text("Sort")');
    await sortBtn.click();

    // Pilih Nama (Z-A)
    await page.locator('button:has-text("Nama (Z-A)")').click();

    // Verifikasi urutan item: Work (W), Personal (P), Archive (A)
    // Di urutan Z-A, Work berada di paling pertama
    const foldersZA = page.locator('[id^="content-folder-"]');
    await expect(foldersZA.nth(0)).toContainText("Work");
    await expect(foldersZA.nth(1)).toContainText("Personal");
    await expect(foldersZA.nth(2)).toContainText("Archive");

    // Klik Sort lagi
    await sortBtn.click();

    // Pilih Nama (A-Z)
    await page.locator('button:has-text("Nama (A-Z)")').click();

    // Verifikasi urutan kembali ke A-Z: Archive (A), Personal (P), Work (W)
    const foldersAZ = page.locator('[id^="content-folder-"]');
    await expect(foldersAZ.nth(0)).toContainText("Archive");
    await expect(foldersAZ.nth(1)).toContainText("Personal");
    await expect(foldersAZ.nth(2)).toContainText("Work");
  });

  test("should perform complete CRUD operations and clipboard actions", async ({ page }) => {
    // Masuk ke Documents
    await page.locator("aside >> text=Documents").click();

    // 1. Buat folder baru
    const newBtn = page.locator('button:has-text("New")');
    await newBtn.click();
    await page.locator('button:has-text("Folder Baru")').click();

    // Pastikan folder default dibuat
    await expect(page.locator("main >> text=New Folder")).toBeVisible();

    // 2. Ubah nama folder menjadi TestCrudFolder
    await page.locator('[id^="content-folder-"]:has-text("New Folder")').click();
    
    // Set handler dialog prompt sebelum klik Rename
    page.once("dialog", async dialog => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("TestCrudFolder");
    });
    await page.locator('button[title="Rename"]').click();

    // Pastikan nama folder berubah
    await expect(page.locator("main >> text=TestCrudFolder")).toBeVisible();
    await expect(page.locator("main >> text=New Folder")).not.toBeVisible();

    // 3. Masuk ke TestCrudFolder
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').dblclick();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("TestCrudFolder");

    // 4. Buat berkas baru
    await newBtn.click();
    await page.locator('button:has-text("Berkas Baru")').click();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 5. Salin berkas (Copy)
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    await page.locator('button[title="Copy"]').click();

    // 6. Navigasi Up kembali ke Documents
    await page.locator('button:has-text("arrow_upward")').click();
    await expect(page.locator("#breadcrumbs-nav")).toContainText("Documents");

    // 7. Tempel berkas (Paste)
    await page.locator('button[title="Paste"]').click();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 8. Masuk kembali ke TestCrudFolder untuk memverifikasi file asli masih ada (karena Copy)
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').dblclick();
    await expect(page.locator("main >> text=New File.txt")).toBeVisible();

    // 9. Hapus berkas di dalam TestCrudFolder
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    page.once("dialog", async dialog => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=New File.txt")).not.toBeVisible();

    // 10. Kembali ke Documents
    await page.locator('button:has-text("arrow_upward")').click();

    // 11. Hapus berkas kopian New File.txt di Documents
    await page.locator('[id^="content-file-"]:has-text("New File.txt")').click();
    page.once("dialog", async dialog => {
      await dialog.accept();
    });
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=New File.txt")).not.toBeVisible();

    // 12. Hapus TestCrudFolder di Documents
    await page.locator('[id^="content-folder-"]:has-text("TestCrudFolder")').click();
    page.once("dialog", async dialog => {
      await dialog.accept();
    });
    await page.locator('button[title="Delete"]').click();
    await expect(page.locator("main >> text=TestCrudFolder")).not.toBeVisible();
  });
});
