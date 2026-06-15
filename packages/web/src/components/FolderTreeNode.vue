<template>
  <div class="select-none">
    <!-- Folder Row -->
    <div
      :id="'folder-node-' + folder.id"
      class="relative flex items-center py-1 px-2 rounded cursor-pointer transition-colors duration-150 text-body-sm group"
      :class="[
        selectedId === folder.id
          ? 'bg-primary/10 text-primary font-medium sidebar-item-active'
          : 'text-on-surface hover:bg-black/5'
      ]"
      @click="emit('select', folder.id)"
    >
      <!-- Expansion / Collapse Indicator (Chevron) -->
      <span
        :id="'caret-' + folder.id"
        class="w-5 h-5 flex items-center justify-center mr-1 text-on-surface-variant transition-transform duration-200"
        :class="[
          folder.isOpen ? 'rotate-90' : '',
          !folder.hasChildren ? 'opacity-0 cursor-default' : 'hover:bg-black/5 rounded'
        ]"
        @click.stop="toggleExpand"
      >
        <span v-if="folder.isLoading" class="animate-spin text-[10px]">⌛</span>
        <span v-else-if="folder.hasChildren" class="material-symbols-outlined scale-75"
          >chevron_right</span
        >
      </span>

      <!-- Folder Icon -->
      <span
        class="material-symbols-outlined mr-2 scale-90 transition-colors"
        :class="[getFolderIconColor(folder.name, selectedId === folder.id)]"
        :style="{ fontVariationSettings: '\'FILL\' 1' }"
      >
        {{ getFolderIcon(folder.name) }}
      </span>

      <!-- Folder Name -->
      <span class="truncate flex-1">{{ folder.name }}</span>
    </div>

    <!-- Subfolders (Recursive) -->
    <div
      v-if="folder.isOpen && folder.children && folder.children.length > 0"
      class="pl-4 border-l border-outline-variant/30 mt-0.5 space-y-0.5 ml-4"
    >
      <FolderTreeNode
        v-for="subfolder in folder.children"
        :key="subfolder.id"
        :folder="subfolder"
        :selected-id="selectedId"
        @select="emit('select', $event)"
        @expand="emit('expand', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClientFolderNode } from "../composables/useExplorer";

const props = defineProps<{
  folder: ClientFolderNode;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "expand", folder: ClientFolderNode): void;
}>();

const toggleExpand = () => {
  if (props.folder.hasChildren) {
    emit("expand", props.folder);
  }
};

const getFolderIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n === "documents") return "description";
  if (n === "pictures") return "image";
  if (n === "music") return "audiotrack";
  if (n === "downloads") return "save_alt";
  if (n === "desktop") return "desktop_windows";
  if (n === "videos") return "movie";
  if (n === "this pc") return "desktop_windows";
  if (n === "home") return "home";
  if (n === "gallery") return "photo_library";
  if (n === "onedrive" || n === "onedrive - personal") return "cloud";
  if (n === "network") return "language";
  if (n === "linux") return "terminal";
  if (n.startsWith("local disk") || n.includes("(c:)") || n.includes("(d:)")) return "database";
  return "folder";
};

const getFolderIconColor = (name: string, isSelected: boolean) => {
  if (isSelected) return "text-primary";
  const n = name.toLowerCase();
  if (n === "documents") return "text-primary-container";
  if (n === "pictures") return "text-primary-container";
  if (n === "music") return "text-tertiary";
  if (n === "downloads") return "text-primary-container";
  if (n === "this pc" || n === "desktop") return "text-primary-container";
  if (n === "home") return "text-primary-container";
  if (n === "gallery") return "text-tertiary-container";
  if (n === "onedrive" || n === "onedrive - personal") return "text-primary";
  if (n === "network") return "text-secondary";
  if (n === "linux") return "text-primary-container";
  if (n.startsWith("local disk") || n.includes("(c:)") || n.includes("(d:)")) return "text-secondary";
  return "text-[#ffc107]";
};
</script>

<style scoped>
.sidebar-item-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background-color: #0078d4;
  border-radius: 0 4px 4px 0;
}
</style>
