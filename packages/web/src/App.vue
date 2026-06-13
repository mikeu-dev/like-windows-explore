<template>
  <div class="h-screen w-screen flex flex-col bg-explorer-bg text-explorer-text overflow-hidden select-none">
    <!-- Header / Navbar Utama -->
    <header class="h-16 border-b border-explorer-border flex items-center justify-between px-6 bg-explorer-sidebar/50 backdrop-blur-md z-10">
      <!-- Judul & Logo Aplikasi (SEO h1) -->
      <div class="flex items-center space-x-3">
        <span class="text-2xl">🖥️</span>
        <div>
          <h1 class="text-base font-bold tracking-tight text-white">File Explorer</h1>
          <p class="text-[10px] text-explorer-muted">Sistem Manajemen Folder Hirarkis</p>
        </div>
      </div>

      <!-- Komponen Pencarian Global -->
      <ExplorerSearch
        v-model="searchQuery"
        @search="performSearch"
      />
    </header>

    <!-- Area Kerja Utama (Split Panel) -->
    <div class="flex-1 flex min-h-0">
      <!-- Panel Kiri: Folder Tree Sidebar (30% lebar atau w-72) -->
      <aside class="w-72 border-r border-explorer-border bg-explorer-sidebar flex flex-col p-4 min-w-[240px] max-w-sm">
        <h2 class="text-xs uppercase font-bold text-explorer-muted tracking-wider mb-3 pl-2">Navigasi Folder</h2>
        
        <div class="flex-1 overflow-y-auto">
          <div v-if="isTreeLoading" class="flex items-center justify-center py-8 text-explorer-muted text-xs space-x-2">
            <div class="w-4 h-4 border-2 border-explorer-active border-t-transparent rounded-full animate-spin"></div>
            <span>Memuat pohon folder...</span>
          </div>
          <FolderTree
            v-else
            :folders="rootFolders"
            :selected-id="selectedFolderId"
            @select="selectFolder"
            @expand="expandFolder"
          />
        </div>
      </aside>

      <!-- Panel Kanan: Isi Folder & Detail (70% lebar sisanya) -->
      <main class="flex-1 flex flex-col bg-explorer-bg p-6 min-w-0">
        <!-- Area Alamat / Breadcrumbs -->
        <div class="h-8 mb-4 bg-explorer-sidebar/30 border border-explorer-border/50 rounded-lg flex items-center px-4 overflow-hidden">
          <Breadcrumbs
            :path="breadcrumbs"
            @navigate="selectFolder"
          />
        </div>

        <!-- Area Tampilan Isi Folder -->
        <div class="flex-1 bg-explorer-sidebar/20 border border-explorer-border/30 rounded-xl p-5 shadow-inner min-h-0 flex flex-col">
          <div v-if="!selectedFolderId && !isSearching" class="flex-1 flex flex-col items-center justify-center text-explorer-muted space-y-4">
            <span class="text-6xl animate-bounce duration-1000">👈</span>
            <div class="text-center">
              <h3 class="text-sm font-semibold text-explorer-text">Belum ada folder terpilih</h3>
              <p class="text-xs mt-1">Silakan klik salah satu folder di panel navigasi kiri untuk melihat isinya.</p>
            </div>
          </div>

          <FolderContents
            v-else
            :subfolders="displaySubfolders"
            :files="displayFiles"
            :is-loading="selectedFolderContentsLoading || searchLoading"
            :is-searching="isSearching"
            :search-query="searchQuery"
            @navigate="selectFolder"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useExplorer } from './composables/useExplorer';
import FolderTree from './components/FolderTree.vue';
import FolderContents from './components/FolderContents.vue';
import Breadcrumbs from './components/Breadcrumbs.vue';
import ExplorerSearch from './components/ExplorerSearch.vue';

const {
  rootFolders,
  selectedFolderId,
  selectedFolderContents,
  selectedFolderContentsLoading,
  breadcrumbs,
  searchQuery,
  searchResults,
  isSearching,
  searchLoading,
  loadRootFolders,
  expandFolder,
  selectFolder,
  performSearch
} = useExplorer();

const isTreeLoading = ref(true);

// Komputasi folder yang akan ditampilkan (menyaring hasil pencarian vs isi folder biasa)
const displaySubfolders = computed(() => {
  if (isSearching.value) {
    return searchResults.value.folders;
  }
  return selectedFolderContents.value.subfolders;
});

const displayFiles = computed(() => {
  if (isSearching.value) {
    return searchResults.value.files;
  }
  return selectedFolderContents.value.files;
});

onMounted(async () => {
  try {
    await loadRootFolders();
  } catch (e) {
    console.error("Gagal melakukan inisialisasi aplikasi", e);
  } finally {
    isTreeLoading.value = false;
  }
});
</script>

<style>
/* CSS Reset Ringan & Animasi */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Kustomisasi variable warna global Tailwind */
:root {
  --hover-color: rgba(51, 65, 85, 0.4);
  --active-color: #38BDF8;
  --active-text-color: #0F172A;
  --border-color: rgba(51, 65, 85, 0.5);
}
</style>
