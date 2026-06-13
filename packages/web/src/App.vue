<template>
  <div
    class="h-screen w-screen flex flex-col bg-explorer-bg text-on-surface overflow-hidden select-none font-sans"
  >
    <!-- Header / Navbar Utama -->
    <header class="bg-surface-container-lowest flex flex-col shrink-0 border-b border-outline-variant/50">
      <!-- Window Controls & Tab Bar -->
      <div class="h-10 flex items-center px-4 border-b border-outline-variant/30 bg-[#f3f3f3]/60">
        <div class="flex items-center space-x-3">
          <span class="text-xl">🖥️</span>
          <div>
            <h1 class="text-xs font-bold text-on-surface">File Explorer</h1>
            <p class="text-[9px] text-explorer-muted">Sistem Manajemen Folder Hirarkis</p>
          </div>
        </div>
      </div>

      <!-- Address Bar Row -->
      <div class="h-12 flex items-center px-4 gap-3 bg-surface-container-lowest">
        <!-- Navigation Controls -->
        <div class="flex items-center gap-1 shrink-0">
          <button
            class="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded transition-colors"
            :class="historyStack.length === 0 ? 'opacity-40 cursor-default' : 'hover:bg-black/5'"
            :disabled="historyStack.length === 0"
            @click="goBack"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded transition-colors"
            :class="forwardStack.length === 0 ? 'opacity-40 cursor-default' : 'hover:bg-black/5'"
            :disabled="forwardStack.length === 0"
            @click="goForward"
          >
            <span class="material-symbols-outlined">arrow_forward</span>
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center text-on-surface-variant rounded transition-colors"
            :class="(!selectedFolderId || breadcrumbs.length <= 1) ? 'opacity-40 cursor-default' : 'hover:bg-black/5'"
            :disabled="!selectedFolderId || breadcrumbs.length <= 1"
            @click="goUp"
          >
            <span class="material-symbols-outlined">arrow_upward</span>
          </button>
          <button
            class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-black/5 rounded transition-colors ml-1"
            :class="!selectedFolderId ? 'opacity-40 cursor-default' : 'hover:bg-black/5'"
            :disabled="!selectedFolderId"
            @click="selectedFolderId ? selectFolder(selectedFolderId, false) : null"
          >
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
      <div class="flex items-center px-4 h-toolbar-height bg-surface-container-lowest border-t border-outline-variant/30 w-full relative">
        <div class="flex items-center gap-2">
          <!-- Action Buttons -->
          <!-- New Button & Dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-on-surface-variant"
              :class="!selectedFolderId ? 'opacity-40 cursor-default' : 'hover:bg-black/5'"
              :disabled="!selectedFolderId"
              @click="isNewMenuOpen = !isNewMenuOpen"
            >
              <span class="material-symbols-outlined text-primary scale-90" :style="{ fontVariationSettings: '\'FILL\' 1' }">add</span>
              <span class="font-body-sm text-body-sm text-on-surface">New</span>
              <span class="material-symbols-outlined scale-75">expand_more</span>
            </button>
            <div
              v-if="isNewMenuOpen"
              class="absolute left-0 mt-1 w-40 bg-surface border border-outline-variant rounded shadow-lg z-20 py-1"
            >
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
                @click="createNewItem('folder')"
              >
                <span class="material-symbols-outlined text-[#ffc107] scale-90" :style="{ fontVariationSettings: '\'FILL\' 1' }">folder</span>
                Folder Baru
              </button>
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center gap-2"
                @click="createNewItem('file')"
              >
                <span class="material-symbols-outlined text-secondary scale-90">article</span>
                Berkas Baru
              </button>
            </div>
          </div>

          <div class="h-5 w-px bg-outline-variant/50 mx-1"></div>

          <!-- Cut -->
          <button
            class="p-2 rounded transition-colors text-on-surface-variant"
            :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
            :disabled="!activeItem"
            title="Cut"
            @click="cutItem"
          >
            <span class="material-symbols-outlined scale-90">content_cut</span>
          </button>

          <!-- Copy -->
          <button
            class="p-2 rounded transition-colors text-on-surface-variant"
            :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
            :disabled="!activeItem"
            title="Copy"
            @click="copyItem"
          >
            <span class="material-symbols-outlined scale-90">content_copy</span>
          </button>

          <!-- Paste -->
          <button
            class="p-2 rounded transition-colors text-on-surface-variant"
            :class="!clipboard ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
            :disabled="!clipboard"
            title="Paste"
            @click="pasteItem"
          >
            <span class="material-symbols-outlined scale-90">content_paste</span>
          </button>

          <!-- Rename -->
          <button
            class="p-2 rounded transition-colors text-on-surface-variant"
            :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
            :disabled="!activeItem"
            title="Rename"
            @click="renameItem"
          >
            <span class="material-symbols-outlined scale-90">drive_file_rename_outline</span>
          </button>

          <!-- Delete -->
          <button
            class="p-2 rounded transition-colors text-on-surface-variant"
            :class="!activeItem ? 'opacity-35 cursor-default' : 'hover:bg-black/5'"
            :disabled="!activeItem"
            title="Delete"
            @click="deleteItem"
          >
            <span class="material-symbols-outlined scale-90">delete</span>
          </button>

          <div class="h-5 w-px bg-outline-variant/50 mx-1"></div>

          <!-- Sort Button & Dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-black/5 rounded transition-colors text-on-surface-variant"
              @click="isSortMenuOpen = !isSortMenuOpen"
            >
              <span class="material-symbols-outlined scale-90">sort</span>
              <span class="font-body-sm text-body-sm text-on-surface">Sort</span>
              <span class="material-symbols-outlined scale-75">expand_more</span>
            </button>
            <div
              v-if="isSortMenuOpen"
              class="absolute left-0 mt-1 w-48 bg-surface border border-outline-variant rounded shadow-lg z-20 py-1"
            >
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
                :class="{'text-primary font-medium': sortBy === 'name' && sortOrder === 'asc'}"
                @click="setSort('name', 'asc')"
              >
                Nama (A-Z)
                <span v-if="sortBy === 'name' && sortOrder === 'asc'" class="material-symbols-outlined scale-75">check</span>
              </button>
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
                :class="{'text-primary font-medium': sortBy === 'name' && sortOrder === 'desc'}"
                @click="setSort('name', 'desc')"
              >
                Nama (Z-A)
                <span v-if="sortBy === 'name' && sortOrder === 'desc'" class="material-symbols-outlined scale-75">check</span>
              </button>
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
                :class="{'text-primary font-medium': sortBy === 'type'}"
                @click="setSort('type', 'asc')"
              >
                Tipe
                <span v-if="sortBy === 'type'" class="material-symbols-outlined scale-75">check</span>
              </button>
              <button
                class="w-full text-left px-4 py-2 text-body-sm hover:bg-black/5 flex items-center justify-between"
                :class="{'text-primary font-medium': sortBy === 'size'}"
                @click="setSort('size', 'asc')"
              >
                Ukuran
                <span v-if="sortBy === 'size'" class="material-symbols-outlined scale-75">check</span>
              </button>
            </div>
          </div>

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
            :sort-by="sortBy"
            :sort-order="sortOrder"
            @navigate="selectFolder"
            @select-item="activeItem = $event"
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
import { explorerApi } from "./services/api";

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
  historyStack,
  forwardStack,
  loadRootFolders,
  expandFolder,
  selectFolder,
  performSearch,
  goBack,
  goForward,
  goUp
} = useExplorer();

const isTreeLoading = ref(true);

const sortBy = ref<"name" | "type" | "size">("name");
const sortOrder = ref<"asc" | "desc">("asc");
const isSortMenuOpen = ref(false);

const isNewMenuOpen = ref(false);
const activeItem = ref<{ id: string; type: "folder" | "file"; name: string } | null>(null);
const clipboard = ref<{
  item: any;
  type: "folder" | "file";
  action: "cut" | "copy";
  sourceFolderId: string;
} | null>(null);

const setSort = (field: "name" | "type" | "size", order: "asc" | "desc") => {
  sortBy.value = field;
  sortOrder.value = order;
  isSortMenuOpen.value = false;
};

async function refreshView() {
  if (selectedFolderId.value) {
    await selectFolder(selectedFolderId.value, false);
  }
  await loadRootFolders();
}

async function createNewItem(type: "folder" | "file") {
  if (!selectedFolderId.value) return;
  const defaultName = type === "folder" ? "New Folder" : "New File.txt";
  isNewMenuOpen.value = false;

  if (type === "folder") {
    await explorerApi.createFolder(defaultName, selectedFolderId.value);
  } else {
    await explorerApi.createFile(defaultName, selectedFolderId.value, 0);
  }
  await refreshView();
}

async function deleteItem() {
  if (!activeItem.value || !selectedFolderId.value) return;
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus "${activeItem.value.name}"?`);
  if (!confirmDelete) return;

  if (activeItem.value.type === "folder") {
    await explorerApi.deleteFolder(activeItem.value.id);
  } else {
    await explorerApi.deleteFile(activeItem.value.id);
  }
  activeItem.value = null;
  await refreshView();
}

async function renameItem() {
  if (!activeItem.value || !selectedFolderId.value) return;
  const newName = prompt(`Ubah nama "${activeItem.value.name}" menjadi:`, activeItem.value.name);
  if (!newName || newName.trim() === "") return;

  if (activeItem.value.type === "folder") {
    await explorerApi.renameFolder(activeItem.value.id, newName);
  } else {
    await explorerApi.renameFile(activeItem.value.id, newName);
  }
  activeItem.value = null;
  await refreshView();
}

function cutItem() {
  if (!activeItem.value || !selectedFolderId.value) return;
  const target = activeItem.value.type === "folder"
    ? selectedFolderContents.value.subfolders.find((f) => f.id === activeItem.value!.id)
    : selectedFolderContents.value.files.find((f) => f.id === activeItem.value!.id);
  
  if (target) {
    clipboard.value = {
      item: { ...target },
      type: activeItem.value.type,
      action: "cut",
      sourceFolderId: selectedFolderId.value
    };
  }
}

function copyItem() {
  if (!activeItem.value || !selectedFolderId.value) return;
  const target = activeItem.value.type === "folder"
    ? selectedFolderContents.value.subfolders.find((f) => f.id === activeItem.value!.id)
    : selectedFolderContents.value.files.find((f) => f.id === activeItem.value!.id);
  
  if (target) {
    clipboard.value = {
      item: { ...target },
      type: activeItem.value.type,
      action: "copy",
      sourceFolderId: selectedFolderId.value
    };
  }
}

async function pasteItem() {
  if (!clipboard.value || !selectedFolderId.value) return;
  
  const { item, type, action, sourceFolderId } = clipboard.value;
  
  if (action === "cut") {
    if (sourceFolderId === selectedFolderId.value) {
      clipboard.value = null;
      return;
    }
    
    if (type === "folder") {
      await explorerApi.moveFolder(item.id, selectedFolderId.value);
    } else {
      await explorerApi.moveFile(item.id, selectedFolderId.value);
    }
    clipboard.value = null;
  } else {
    // action === "copy"
    if (type === "folder") {
      await explorerApi.copyFolder(item.id, selectedFolderId.value);
    } else {
      await explorerApi.copyFile(item.id, selectedFolderId.value);
    }
  }
  await refreshView();
}

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
