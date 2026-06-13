<template>
  <div
    class="h-screen w-screen flex flex-col bg-explorer-bg text-on-surface overflow-hidden select-none font-sans"
  >
    <!-- Header / Navbar Utama -->
    <header class="bg-surface-container-lowest flex flex-col shrink-0 border-b border-outline-variant/50">
      <!-- Window Controls & Tab Bar -->
      <div class="h-10 flex items-center justify-between px-4 border-b border-outline-variant/30 bg-[#f3f3f3]/60">
        <div class="flex items-center space-x-3">
          <span class="text-xl">🖥️</span>
          <div>
            <h1 class="text-xs font-bold text-on-surface">File Explorer</h1>
            <p class="text-[9px] text-explorer-muted">Sistem Manajemen Folder Hirarkis</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="material-symbols-outlined text-on-surface-variant hover:bg-black/5 p-1 rounded cursor-default scale-90">minimize</span>
          <span class="material-symbols-outlined text-on-surface-variant hover:bg-black/5 p-1 rounded cursor-default scale-90">check_box_outline_blank</span>
          <span class="material-symbols-outlined text-on-surface-variant hover:bg-error/10 hover:text-error p-1 rounded cursor-default scale-90">close</span>
        </div>
      </div>

      <!-- Address Bar Row -->
      <div class="h-12 flex items-center px-4 gap-3 bg-surface-container-lowest">
        <!-- Navigation Controls -->
        <div class="flex items-center gap-1 shrink-0">
          <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant opacity-40 cursor-default">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant opacity-40 cursor-default">
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-black/5 rounded transition-colors">
            <span class="material-symbols-outlined">arrow_upward</span>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-black/5 rounded transition-colors ml-1">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <!-- Breadcrumb Address Bar -->
        <div class="flex-1 flex items-center h-8 bg-surface-container border border-outline-variant rounded-sm px-2 gap-1 overflow-hidden">
          <Breadcrumbs :path="breadcrumbs" @navigate="selectFolder" />
        </div>

        <!-- Komponen Pencarian Global -->
        <ExplorerSearch v-model="searchQuery" @search="performSearch" />
      </div>

      <!-- Toolbar Row -->
      <div class="flex items-center px-4 h-toolbar-height bg-surface-container-lowest border-t border-outline-variant/30 w-full">
        <div class="flex items-center gap-2">
          <!-- Action Buttons -->
          <button class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/5 rounded transition-colors text-on-surface-variant">
            <span class="material-symbols-outlined text-primary scale-90" :style="{ fontVariationSettings: '\'FILL\' 1' }">add</span>
            <span class="font-body-sm text-body-sm text-on-surface">New</span>
            <span class="material-symbols-outlined scale-75">expand_more</span>
          </button>
          <div class="h-5 w-px bg-outline-variant/50 mx-1"></div>
          <button class="p-2 hover:bg-black/5 rounded transition-colors text-on-surface-variant" title="Cut">
            <span class="material-symbols-outlined scale-90">content_cut</span>
          </button>
          <button class="p-2 hover:bg-black/5 rounded transition-colors text-on-surface-variant" title="Copy">
            <span class="material-symbols-outlined scale-90">content_copy</span>
          </button>
          <button class="p-2 hover:bg-black/5 rounded transition-colors text-on-surface-variant" title="Paste">
            <span class="material-symbols-outlined scale-90">content_paste</span>
          </button>
          <button class="p-2 hover:bg-black/5 rounded transition-colors text-on-surface-variant" title="Rename">
            <span class="material-symbols-outlined scale-90">drive_file_rename_outline</span>
          </button>
          <button class="p-2 hover:bg-black/5 rounded transition-colors text-on-surface-variant" title="Delete">
            <span class="material-symbols-outlined scale-90">delete</span>
          </button>
          <div class="h-5 w-px bg-outline-variant/50 mx-1"></div>
          <button class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/5 rounded transition-colors text-on-surface-variant">
            <span class="material-symbols-outlined scale-90">sort</span>
            <span class="font-body-sm text-body-sm text-on-surface">Sort</span>
            <span class="material-symbols-outlined scale-75">expand_more</span>
          </button>
          <button class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/5 rounded transition-colors text-on-surface-variant">
            <span class="material-symbols-outlined scale-90">view_list</span>
            <span class="font-body-sm text-body-sm text-on-surface">View</span>
            <span class="material-symbols-outlined scale-75">expand_more</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Area Kerja Utama (Split Panel) -->
    <div class="flex-1 flex min-h-0">
      <!-- Panel Kiri: Folder Tree Sidebar (30% lebar atau w-72) -->
      <aside
        class="w-sidebar-width border-r border-outline-variant/50 bg-[#f3f3f3] flex flex-col p-3 shrink-0 min-w-[200px]"
      >
        <!-- Quick access and systems structure -->
        <div class="flex items-center px-2 py-1 mb-2 text-primary">
          <span class="material-symbols-outlined scale-90 mr-2" :style="{ fontVariationSettings: '\'FILL\' 1' }">star</span>
          <span class="font-title-sm text-title-sm text-on-surface font-semibold">Quick access</span>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar">
          <div
            v-if="isTreeLoading"
            class="flex items-center justify-center py-8 text-on-surface-variant text-body-sm space-x-2"
          >
            <div
              class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"
            />
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
      <main class="flex-1 flex flex-col bg-surface p-6 min-w-0">
        <!-- Area Tampilan Isi Folder -->
        <div class="flex-1 min-h-0 flex flex-col">
          <div
            v-if="!selectedFolderId && !isSearching"
            class="flex-1 flex flex-col items-center justify-center text-on-surface-variant space-y-4"
          >
            <span class="material-symbols-outlined text-6xl text-[#ffc107]">folder</span>
            <div class="text-center">
              <h3 class="text-body-md font-semibold text-on-surface">Belum ada folder terpilih</h3>
              <p class="text-body-sm mt-1 text-on-surface-variant/75">
                Silakan klik salah satu folder di panel navigasi kiri untuk melihat isinya.
              </p>
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
import { onMounted, ref, computed } from "vue";
import { useExplorer } from "./composables/useExplorer";
import FolderTree from "./components/FolderTree.vue";
import FolderContents from "./components/FolderContents.vue";
import Breadcrumbs from "./components/Breadcrumbs.vue";
import ExplorerSearch from "./components/ExplorerSearch.vue";

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
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
body {
  font-family: "Segoe UI", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
