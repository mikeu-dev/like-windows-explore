<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar Panel Kanan -->
    <div
      class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4 shrink-0"
    >
      <div class="text-body-sm text-on-surface-variant">
        <span v-if="isSearching"
          >Hasil Pencarian untuk:
          <strong class="text-on-surface font-semibold">"{{ searchQuery }}"</strong></span
        >
        <span v-else>{{ itemsCount }} item ditemukan</span>
      </div>

      <!-- Toggle Tampilan (Grid / List) -->
      <div
        class="flex items-center space-x-1 bg-surface-container p-1 rounded border border-outline-variant/50 text-xs"
      >
        <button
          id="view-grid-btn"
          class="px-2.5 py-1.5 rounded transition-all duration-150 flex items-center gap-1 font-medium"
          :class="[
            viewMode === 'grid'
              ? 'bg-[#e2e2e2] text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          ]"
          @click="viewMode = 'grid'"
        >
          <span class="material-symbols-outlined scale-75">grid_view</span>
          Grid
        </button>
        <button
          id="view-list-btn"
          class="px-2.5 py-1.5 rounded transition-all duration-150 flex items-center gap-1 font-medium"
          :class="[
            viewMode === 'list'
              ? 'bg-[#e2e2e2] text-primary shadow-sm font-semibold'
              : 'text-on-surface-variant hover:text-on-surface'
          ]"
          @click="viewMode = 'list'"
        >
          <span class="material-symbols-outlined scale-75">view_list</span>
          Detail List
        </button>
      </div>
    </div>

    <!-- Area Konten Utama -->
    <div class="flex-1 overflow-y-auto min-h-0 pr-1 no-scrollbar">
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center h-64 text-on-surface-variant space-y-3"
      >
        <div
          class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
        />
        <span class="text-body-sm">Memuat konten...</span>
      </div>

      <div
        v-else-if="isEmpty"
        class="flex flex-col items-center justify-center h-64 text-on-surface-variant space-y-2"
      >
        <span class="material-symbols-outlined text-4xl text-[#ffc107]">folder_open</span>
        <span class="text-body-sm">Folder ini kosong.</span>
      </div>

      <!-- Tampilan Grid (Large Icons) -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
      >
        <!-- Loop Subfolders -->
        <div
          v-for="subfolder in sortedSubfolders"
          :id="'content-folder-' + subfolder.id"
          :key="subfolder.id"
          class="flex flex-col items-center p-3 rounded border border-transparent transition-all duration-150 hover:bg-black/5 cursor-pointer select-none text-center"
          :class="[
            selectedItem?.id === subfolder.id
              ? 'bg-primary/10 border-primary/20 shadow-sm font-medium'
              : ''
          ]"
          @click="selectItem(subfolder, 'folder')"
          @dblclick="openFolder(subfolder.id)"
        >
          <span
            class="material-symbols-outlined text-4xl mb-2 text-[#ffc107]"
            :style="{ fontVariationSettings: '\'FILL\' 1' }"
          >
            folder
          </span>
          <span class="text-body-sm text-on-surface font-medium line-clamp-2 w-full break-all">{{
            subfolder.name
          }}</span>
        </div>

        <!-- Loop Files -->
        <div
          v-for="file in sortedFiles"
          :id="'content-file-' + file.id"
          :key="file.id"
          class="flex flex-col items-center p-3 rounded border border-transparent transition-all duration-150 hover:bg-black/5 cursor-pointer select-none text-center"
          :class="[
            selectedItem?.id === file.id
              ? 'bg-primary/10 border-primary/20 shadow-sm font-medium'
              : ''
          ]"
          @click="selectItem(file, 'file')"
          @dblclick="openFile(file)"
        >
          <span
            class="material-symbols-outlined text-4xl mb-2"
            :class="getFileIconDetails(file.name).color"
          >
            {{ getFileIconDetails(file.name).icon }}
          </span>
          <span class="text-body-sm text-on-surface font-medium line-clamp-1 w-full break-all">{{
            file.name
          }}</span>
          <span class="text-label-md text-on-surface-variant mt-1">{{
            formatBytes(file.size)
          }}</span>
        </div>
      </div>

      <!-- Tampilan List (Detail List) -->
      <div v-else class="w-full overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-outline-variant/30 text-body-sm text-on-surface-variant font-semibold"
            >
              <th class="pb-2 pl-4">Nama</th>
              <th class="pb-2">Tipe</th>
              <th class="pb-2 text-right pr-4">Ukuran</th>
            </tr>
          </thead>
          <tbody class="text-body-sm divide-y divide-outline-variant/20">
            <!-- Subfolders -->
            <tr
              v-for="subfolder in sortedSubfolders"
              :id="'content-folder-' + subfolder.id"
              :key="subfolder.id"
              class="hover:bg-black/5 transition-colors duration-100 cursor-pointer select-none"
              :class="[
                selectedItem?.id === subfolder.id ? 'bg-primary/10 text-primary' : 'text-on-surface'
              ]"
              @click="selectItem(subfolder, 'folder')"
              @dblclick="openFolder(subfolder.id)"
            >
              <td class="py-2 pl-4 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate">
                <span
                  class="material-symbols-outlined mr-3 text-[#ffc107] scale-90 animate-none"
                  :style="{ fontVariationSettings: '\'FILL\' 1' }"
                >
                  folder
                </span>
                <span class="font-medium truncate">{{ subfolder.name }}</span>
              </td>
              <td class="py-2 text-on-surface-variant">Folder</td>
              <td class="py-2 text-right pr-4 text-on-surface-variant">—</td>
            </tr>

            <!-- Files -->
            <tr
              v-for="file in sortedFiles"
              :id="'content-file-' + file.id"
              :key="file.id"
              class="hover:bg-black/5 transition-colors duration-100 cursor-pointer select-none"
              :class="[
                selectedItem?.id === file.id ? 'bg-primary/10 text-primary' : 'text-on-surface'
              ]"
              @click="selectItem(file, 'file')"
              @dblclick="openFile(file)"
            >
              <td class="py-2 pl-4 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate">
                <span
                  class="material-symbols-outlined mr-3 scale-90"
                  :class="getFileIconDetails(file.name).color"
                >
                  {{ getFileIconDetails(file.name).icon }}
                </span>
                <span class="font-medium truncate">{{ file.name }}</span>
              </td>
              <td class="py-2 text-on-surface-variant">
                {{ getFileType(file.name) }}
              </td>
              <td class="py-2 text-right pr-4 text-on-surface-variant font-mono">
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
      class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 transition-opacity"
      @click.self="modalFile = null"
    >
      <div
        class="bg-surface border border-outline-variant rounded shadow-2xl max-w-md w-full p-5 space-y-4 animate-scaleUp"
      >
        <div class="flex justify-between items-start">
          <div class="flex items-center space-x-3">
            <span
              class="material-symbols-outlined text-3xl"
              :class="getFileIconDetails(modalFile.name).color"
            >
              {{ getFileIconDetails(modalFile.name).icon }}
            </span>
            <div>
              <h2 class="text-body-md font-semibold text-on-surface break-all">
                {{ modalFile.name }}
              </h2>
              <p class="text-label-md text-on-surface-variant">
                {{ getFileType(modalFile.name) }}
              </p>
            </div>
          </div>
          <button
            class="text-on-surface-variant hover:text-on-surface text-lg font-bold"
            @click="modalFile = null"
          >
            ×
          </button>
        </div>
        <div
          class="border-t border-outline-variant/30 pt-4 space-y-2 text-label-md text-on-surface-variant"
        >
          <div class="flex justify-between">
            <span>Ukuran File:</span>
            <span class="text-on-surface font-mono font-medium"
              >{{ modalFile.size.toLocaleString() }} bytes ({{ formatBytes(modalFile.size) }})</span
            >
          </div>
          <div class="flex justify-between">
            <span>Lokasi:</span>
            <span class="text-on-surface break-all">ID Folder: {{ modalFile.folderId }}</span>
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <button
            class="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-medium rounded text-body-sm transition-colors shadow-sm"
            @click="modalFile = null"
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
  sortBy?: "name" | "type" | "size";
  sortOrder?: "asc" | "desc";
}>();

const emit = defineEmits<{
  (e: "navigate", folderId: string): void;
  (e: "select-item", item: { id: string; type: "folder" | "file"; name: string } | null): void;
}>();

const viewMode = ref<"grid" | "list">("grid");
const selectedItem = ref<{ id: string; type: "folder" | "file" } | null>(null);
const modalFile = ref<FileDTO | null>(null);

const itemsCount = computed(() => props.subfolders.length + props.files.length);
const isEmpty = computed(() => props.subfolders.length === 0 && props.files.length === 0);

const activeSortBy = computed(() => props.sortBy || "name");
const activeSortOrder = computed(() => props.sortOrder || "asc");

const sortedSubfolders = computed(() => {
  const folders = [...props.subfolders];
  folders.sort((a, b) => {
    let comparison = 0;
    if (activeSortBy.value === "name") {
      comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    return activeSortOrder.value === "asc" ? comparison : -comparison;
  });
  return folders;
});

const sortedFiles = computed(() => {
  const filesList = [...props.files];
  filesList.sort((a, b) => {
    let comparison = 0;
    if (activeSortBy.value === "name") {
      comparison = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    } else if (activeSortBy.value === "size") {
      comparison = a.size - b.size;
    } else if (activeSortBy.value === "type") {
      const extA = a.name.split(".").pop()?.toLowerCase() || "";
      const extB = b.name.split(".").pop()?.toLowerCase() || "";
      comparison = extA.localeCompare(extB);
    }
    return activeSortOrder.value === "asc" ? comparison : -comparison;
  });
  return filesList;
});

const selectItem = (item: any, type: "folder" | "file") => {
  selectedItem.value = { id: item.id, type };
  emit("select-item", { id: item.id, type, name: item.name });
};

const openFolder = (folderId: string) => {
  emit("navigate", folderId);
  selectedItem.value = null;
  emit("select-item", null);
};

const openFile = (file: FileDTO) => {
  modalFile.value = file;
};

const getFileIconDetails = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { icon: "picture_as_pdf", color: "text-[#e01515]" };
    case "docx":
    case "doc":
      return { icon: "description", color: "text-[#0078d4]" };
    case "txt":
    case "md":
      return { icon: "article", color: "text-secondary" };
    case "xlsx":
    case "xls":
      return { icon: "table_view", color: "text-[#107c41]" };
    case "jpg":
    case "jpeg":
      return { icon: "image", color: "text-[#0078d4]" };
    case "png":
    case "gif":
    case "svg":
      return { icon: "image", color: "text-[#0078d4]" };
    case "zip":
      return { icon: "folder_zip", color: "text-[#f39c12]" };
    case "rar":
      return { icon: "folder_zip", color: "text-[#f39c12]" };
    case "tar":
      return { icon: "folder_zip", color: "text-[#f39c12]" };
    case "gz":
      return { icon: "folder_zip", color: "text-[#f39c12]" };
    default:
      return { icon: "draft", color: "text-secondary" };
  }
};

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
      return "Berkas ZIP";
    case "rar":
      return "Berkas RAR";
    case "tar":
      return "Berkas TAR";
    case "gz":
      return "Berkas GZIP";
    default:
      return "Berkas " + (ext?.toUpperCase() || "Lainnya");
  }
};

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
