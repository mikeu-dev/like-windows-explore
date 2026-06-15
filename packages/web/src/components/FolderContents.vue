<template>
  <div class="h-full flex flex-col">


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
          v-for="subfolder in subfolders"
          :id="'content-folder-' + subfolder.id"
          :key="subfolder.id"
          class="flex flex-col items-center p-3 rounded border border-transparent transition-all duration-150 hover:bg-black/5 cursor-pointer select-none text-center border-l-4"
          :class="[
            activeItem?.id === subfolder.id
              ? 'bg-[#eef7ff] border-primary border-primary/20 shadow-sm font-medium'
              : 'border-transparent'
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
          v-for="file in files"
          :id="'content-file-' + file.id"
          :key="file.id"
          class="flex flex-col items-center p-3 rounded border border-transparent transition-all duration-150 hover:bg-black/5 cursor-pointer select-none text-center border-l-4"
          :class="[
            activeItem?.id === file.id
              ? 'bg-[#eef7ff] border-primary border-primary/20 shadow-sm font-medium'
              : 'border-transparent'
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
              class="border-b border-outline-variant/30 text-label-sm font-semibold text-on-surface-variant bg-surface-container-low/50 h-9"
            >
              <th class="pb-1 pl-4 w-1/2 align-middle font-semibold">Nama</th>
              <th class="pb-1 w-1/6 align-middle font-semibold border-l border-outline-variant/30 pl-2">Tanggal modifikasi</th>
              <th class="pb-1 w-1/6 align-middle font-semibold border-l border-outline-variant/30 pl-2">Tipe</th>
              <th class="pb-1 text-right pr-4 w-1/6 align-middle font-semibold border-l border-outline-variant/30 pl-2">Ukuran</th>
            </tr>
          </thead>
          <tbody class="text-body-sm divide-y divide-outline-variant/10">
            <!-- Subfolders -->
            <tr
              v-for="subfolder in subfolders"
              :id="'content-folder-' + subfolder.id"
              :key="subfolder.id"
              class="hover:bg-black/5 transition-colors duration-100 cursor-pointer select-none h-[40px] border-l-4"
              :class="[
                activeItem?.id === subfolder.id ? 'bg-[#eef7ff] border-primary text-primary font-semibold' : 'border-transparent text-on-surface'
              ]"
              @click="selectItem(subfolder, 'folder')"
              @dblclick="openFolder(subfolder.id)"
            >
              <td class="py-1 pl-4 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate h-[40px]">
                <span
                  class="material-symbols-outlined mr-3 text-[#ffc107] scale-90 animate-none shrink-0"
                  :style="{ fontVariationSettings: '\'FILL\' 1' }"
                >
                  folder
                </span>
                <span class="font-medium truncate">{{ subfolder.name }}</span>
              </td>
              <td class="py-1 pl-2 text-on-surface-variant text-body-sm">10/24/2023 2:45 PM</td>
              <td class="py-1 pl-2 text-on-surface-variant text-body-sm">Folder</td>
              <td class="py-1 text-right pr-4 text-on-surface-variant font-mono">—</td>
            </tr>

            <!-- Files -->
            <tr
              v-for="file in files"
              :id="'content-file-' + file.id"
              :key="file.id"
              class="hover:bg-black/5 transition-colors duration-100 cursor-pointer select-none h-[40px] border-l-4"
              :class="[
                activeItem?.id === file.id ? 'bg-[#eef7ff] border-primary text-primary font-semibold' : 'border-transparent text-on-surface'
              ]"
              @click="selectItem(file, 'file')"
              @dblclick="openFile(file)"
            >
              <td class="py-1 pl-4 flex items-center max-w-xs sm:max-w-md md:max-w-xl truncate h-[40px]">
                <span
                  class="material-symbols-outlined mr-3 scale-90 shrink-0"
                  :class="getFileIconDetails(file.name).color"
                >
                  {{ getFileIconDetails(file.name).icon }}
                </span>
                <span class="font-medium truncate">{{ file.name }}</span>
              </td>
              <td class="py-1 pl-2 text-on-surface-variant text-body-sm">10/24/2023 2:45 PM</td>
              <td class="py-1 pl-2 text-on-surface-variant text-body-sm">
                {{ getFileType(file.name) }}
              </td>
              <td class="py-1 text-right pr-4 text-on-surface-variant font-mono">
                {{ formatBytes(file.size) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FolderDTO, FileDTO } from "@explorer/common";

const props = defineProps<{
  subfolders: FolderDTO[];
  files: FileDTO[];
  isLoading: boolean;
  isSearching: boolean;
  searchQuery: string;
  activeItem: { id: string; type: "folder" | "file"; name: string } | null;
}>();

const emit = defineEmits<{
  (e: "navigate", folderId: string): void;
  (e: "select-item", item: { id: string; type: "folder" | "file"; name: string } | null): void;
  (e: "open-file", file: FileDTO): void;
}>();

const viewMode = defineModel<"grid" | "list">("viewMode", { default: "grid" });

const itemsCount = computed(() => props.subfolders.length + props.files.length);
const isEmpty = computed(() => props.subfolders.length === 0 && props.files.length === 0);

const selectItem = (item: any, type: "folder" | "file") => {
  emit("select-item", { id: item.id, type, name: item.name });
};

const openFolder = (folderId: string) => {
  emit("navigate", folderId);
  emit("select-item", null);
};

const openFile = (file: FileDTO) => {
  emit("open-file", file);
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
    case "png":
    case "gif":
    case "svg":
      return { icon: "image", color: "text-[#0078d4]" };
    case "zip":
    case "rar":
    case "tar":
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
/* Scoped styles removed as modal is lifted up */
</style>
