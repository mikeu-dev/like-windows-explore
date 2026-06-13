<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar Panel Kanan -->
    <div class="flex items-center justify-between pb-4 border-b border-explorer-border/50 mb-4">
      <div class="text-sm text-explorer-muted">
        <span v-if="isSearching"
          >Hasil Pencarian untuk:
          <strong class="text-explorer-text">"{{ searchQuery }}"</strong></span
        >
        <span v-else>{{ itemsCount }} item ditemukan</span>
      </div>

      <!-- Toggle Tampilan (Grid / List) -->
      <div
        class="flex items-center space-x-2 bg-explorer-sidebar p-1 rounded-lg border border-explorer-border/50 text-xs"
      >
        <button
          id="view-grid-btn"
          class="px-2.5 py-1.5 rounded transition-all duration-150"
          :class="[
            viewMode === 'grid'
              ? 'bg-explorer-active text-explorer-bg font-semibold'
              : 'text-explorer-muted hover:text-explorer-text'
          ]"
          @click="viewMode = 'grid'"
        >
          Grid
        </button>
        <button
          id="view-list-btn"
          class="px-2.5 py-1.5 rounded transition-all duration-150"
          :class="[
            viewMode === 'list'
              ? 'bg-explorer-active text-explorer-bg font-semibold'
              : 'text-explorer-muted hover:text-explorer-text'
          ]"
          @click="viewMode = 'list'"
        >
          Detail List
        </button>
      </div>
    </div>

    <!-- Area Konten Utama -->
    <div class="flex-1 overflow-y-auto min-h-0 pr-1">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center h-64 text-explorer-muted space-y-3"
      >
        <div
          class="w-8 h-8 border-4 border-explorer-active border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-sm">Memuat konten...</span>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex flex-col items-center justify-center h-64 text-explorer-muted space-y-2"
      >
        <span class="text-4xl">📂</span>
        <span class="text-sm">Folder ini kosong.</span>
      </div>

      <!-- Tampilan Grid (Large Icons) -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        <!-- Loop Subfolders -->
        <div
          v-for="subfolder in subfolders"
          :key="subfolder.id"
          :id="'content-folder-' + subfolder.id"
          class="flex flex-col items-center p-3 rounded-xl border border-transparent transition-all duration-150 hover:bg-explorer-sidebar/60 hover:border-explorer-border/40 cursor-pointer select-none text-center"
          :class="[
            selectedItem?.id === subfolder.id
              ? 'bg-explorer-sidebar border-explorer-active/60 shadow-md ring-1 ring-explorer-active/30'
              : ''
          ]"
          @click="selectItem(subfolder, 'folder')"
          @dblclick="openFolder(subfolder.id)"
        >
          <span class="text-4xl mb-2">📁</span>
          <span class="text-xs text-explorer-text font-medium line-clamp-2 w-full break-all">{{
            subfolder.name
          }}</span>
        </div>

        <!-- Loop Files -->
        <div
          v-for="file in files"
          :key="file.id"
          :id="'content-file-' + file.id"
          class="flex flex-col items-center p-3 rounded-xl border border-transparent transition-all duration-150 hover:bg-explorer-sidebar/60 hover:border-explorer-border/40 cursor-pointer select-none text-center"
          :class="[
            selectedItem?.id === file.id
              ? 'bg-explorer-sidebar border-explorer-active/60 shadow-md ring-1 ring-explorer-active/30'
              : ''
          ]"
          @click="selectItem(file, 'file')"
          @dblclick="openFile(file)"
        >
          <span class="text-4xl mb-2">{{ getFileIcon(file.name) }}</span>
          <span class="text-xs text-explorer-text font-medium line-clamp-1 w-full break-all">{{
            file.name
          }}</span>
          <span class="text-[10px] text-explorer-muted mt-1">{{ formatBytes(file.size) }}</span>
        </div>
      </div>

      <!-- Tampilan List (Detail List) -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-explorer-border/40 text-xs text-explorer-muted font-semibold uppercase tracking-wider"
            >
              <th class="pb-3 pl-2">Nama</th>
              <th class="pb-3">Tipe</th>
              <th class="pb-3 text-right pr-2">Ukuran</th>
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-explorer-border/20">
            <!-- Subfolders -->
            <tr
              v-for="subfolder in subfolders"
              :key="subfolder.id"
              class="hover:bg-explorer-sidebar/40 transition-colors duration-100 cursor-pointer select-none"
              :class="[
                selectedItem?.id === subfolder.id
                  ? 'bg-explorer-sidebar text-explorer-active'
                  : 'text-explorer-text'
              ]"
              @click="selectItem(subfolder, 'folder')"
              @dblclick="openFolder(subfolder.id)"
            >
              <td class="py-2.5 pl-2 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate">
                <span class="mr-2.5 text-base">📁</span>
                <span class="font-medium truncate">{{ subfolder.name }}</span>
              </td>
              <td class="py-2.5 text-explorer-muted text-xs">Folder</td>
              <td class="py-2.5 text-right pr-2 text-explorer-muted text-xs">—</td>
            </tr>

            <!-- Files -->
            <tr
              v-for="file in files"
              :key="file.id"
              class="hover:bg-explorer-sidebar/40 transition-colors duration-100 cursor-pointer select-none"
              :class="[
                selectedItem?.id === file.id
                  ? 'bg-explorer-sidebar text-explorer-active'
                  : 'text-explorer-text'
              ]"
              @click="selectItem(file, 'file')"
              @dblclick="openFile(file)"
            >
              <td class="py-2.5 pl-2 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate">
                <span class="mr-2.5 text-base">{{ getFileIcon(file.name) }}</span>
                <span class="font-medium truncate">{{ file.name }}</span>
              </td>
              <td class="py-2.5 text-explorer-muted text-xs">{{ getFileType(file.name) }}</td>
              <td class="py-2.5 text-right pr-2 text-explorer-muted text-xs font-mono">
                {{ formatBytes(file.size) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detail Berkas (Ketika berkas di-double click) -->
    <div
      v-if="modalFile"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity"
      @click.self="modalFile = null"
    >
      <div
        class="bg-explorer-sidebar border border-explorer-border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">{{ getFileIcon(modalFile.name) }}</span>
            <div>
              <h2 class="text-base font-semibold text-explorer-text break-all">
                {{ modalFile.name }}
              </h2>
              <p class="text-xs text-explorer-muted">{{ getFileType(modalFile.name) }}</p>
            </div>
          </div>
          <button
            @click="modalFile = null"
            class="text-explorer-muted hover:text-explorer-text text-lg font-bold"
          >
            ×
          </button>
        </div>
        <div class="border-t border-explorer-border/50 pt-4 space-y-2 text-xs text-explorer-muted">
          <div class="flex justify-between">
            <span>Ukuran File:</span>
            <span class="text-explorer-text font-mono font-medium"
              >{{ modalFile.size.toLocaleString() }} bytes ({{ formatBytes(modalFile.size) }})</span
            >
          </div>
          <div class="flex justify-between">
            <span>Lokasi:</span>
            <span class="text-explorer-text break-all">ID Folder: {{ modalFile.folderId }}</span>
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <button
            @click="modalFile = null"
            class="px-4 py-2 bg-explorer-active hover:bg-explorer-active/90 text-explorer-bg font-semibold rounded-lg text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { FolderDTO, FileDTO } from "@explorer/common";

const props = defineProps<{
  subfolders: FolderDTO[];
  files: FileDTO[];
  isLoading: boolean;
  isSearching: boolean;
  searchQuery: string;
}>();

const emit = defineEmits<{
  (e: "navigate", folderId: string): void;
}>();

const viewMode = ref<"grid" | "list">("grid");
const selectedItem = ref<{ id: string; type: "folder" | "file" } | null>(null);
const modalFile = ref<FileDTO | null>(null);

const itemsCount = computed(() => props.subfolders.length + props.files.length);
const isEmpty = computed(() => props.subfolders.length === 0 && props.files.length === 0);

const selectItem = (item: any, type: "folder" | "file") => {
  selectedItem.value = { id: item.id, type };
};

const openFolder = (folderId: string) => {
  emit("navigate", folderId);
  selectedItem.value = null;
};

const openFile = (file: FileDTO) => {
  modalFile.value = file;
};

// Deteksi ikon berkas berdasarkan ekstensi
const getFileIcon = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📄"; // pdf
    case "docx":
    case "doc":
    case "txt":
    case "md":
      return "📝"; // document / text
    case "xlsx":
    case "xls":
      return "📊"; // spreadsheet
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "🖼️"; // image
    case "zip":
    case "rar":
    case "tar":
    case "gz":
      return "📦"; // zip
    default:
      return "📄"; // unknown file
  }
};

// Deteksi tipe berkas
const getFileType = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "Berkas PDF";
    case "docx":
    case "doc":
      return "Dokumen Word";
    case "txt":
      return "Berkas Teks";
    case "md":
      return "Markdown";
    case "xlsx":
    case "xls":
      return "Lembar Kerja Excel";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "Gambar";
    case "zip":
    case "rar":
    case "tar":
    case "gz":
      return "Arsip Terkompresi";
    default:
      return "Berkas " + (ext?.toUpperCase() || "Lainnya");
  }
};

// Format ukuran berkas (bytes -> KB/MB)
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
</script>

<style scoped>
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scaleUp {
  animation: scaleUp 0.15s ease-out forwards;
}
</style>
